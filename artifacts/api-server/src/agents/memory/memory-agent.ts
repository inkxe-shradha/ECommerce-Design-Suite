/**
 * memory-agent.ts — Core MemoryAgent service for the ShopNow AI chatbot.
 *
 * Responsibilities:
 *   1. Checkpoint — persist conversation state snapshots after subflows
 *   2. Rehydrate — fetch latest checkpoint + semantic matches on new messages
 *   3. Fact CRUD — store/retrieve/delete durable user preferences
 *   4. Context Window — assemble bounded prompt context from checkpoints + facts
 *
 * Privacy-first: only persists with explicit consent; redacts PII; supports TTL.
 *
 * @see implementation_plan.md — TICKET MEM-2
 */

import { and, desc, eq, gt, sql } from 'drizzle-orm';
import {
  db,
  conversationCheckpointsTable,
  userMemoryTable,
} from '@workspace/db';
import type {
  ConversationCheckpoint,
  InsertConversationCheckpoint,
  UserMemory,
  InsertUserMemory,
} from '@workspace/db';
import { EmbeddingService } from './embedding-service.js';
import { PrivacyGuard } from './privacy-guard.js';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CheckpointInput {
  sessionId: string;
  userId: number | null;
  checkpointIndex: number;
  intent: string;
  persona?: string | null;
  slots: Record<string, unknown>;
  lastUserMsgs: string[];
  lastAgentMsgs: string[];
  summary: string;
  consentLevel?: 'ephemeral' | 'session' | 'persistent';
}

export interface RehydrationResult {
  /** Most recent checkpoint for this session */
  latestCheckpoint: ConversationCheckpoint | null;
  /** Top-k semantically relevant past checkpoints (cross-session) */
  relevantCheckpoints: ConversationCheckpoint[];
  /** Top-k relevant durable facts for this user */
  relevantFacts: UserMemory[];
  /** Pre-assembled context string ready for prompt injection */
  contextWindow: string;
}

export interface FactInput {
  userId: number;
  factType: 'preference' | 'persona' | 'explicit_fact' | 'purchase_pattern';
  factKey: string;
  factValue: string;
  source?: 'user_explicit' | 'agent_inferred' | 'system';
  confidence?: number;
  expiresAt?: Date | null;
}

export interface ContextWindowOptions {
  maxTokens?: number;
  maxCheckpoints?: number;
  maxFacts?: number;
}

// ─── MemoryAgent Service ────────────────────────────────────────────────────

export class MemoryAgent {
  name = 'MemoryAgent';

  private readonly embedding: EmbeddingService;
  private readonly privacy: PrivacyGuard;

  constructor(
    embedding?: EmbeddingService,
    privacy?: PrivacyGuard,
  ) {
    this.embedding = embedding ?? new EmbeddingService();
    this.privacy = privacy ?? new PrivacyGuard();
  }

  // ── Checkpoint ──────────────────────────────────────────────────────────

  /**
   * Persist a conversation state checkpoint.
   * Generates an embedding from the summary for semantic retrieval.
   * Respects consent level — ephemeral checkpoints are marked for cleanup.
   */
  async checkpoint(input: CheckpointInput): Promise<ConversationCheckpoint> {
    const consentLevel = input.consentLevel ?? 'ephemeral';

    // Redact PII from summary and messages before storage
    const redactedSummary = this.privacy.redactPII(input.summary);
    const redactedUserMsgs = input.lastUserMsgs.map((m) =>
      this.privacy.redactPII(m),
    );
    const redactedAgentMsgs = input.lastAgentMsgs.map((m) =>
      this.privacy.redactPII(m),
    );

    // Generate embedding from the redacted summary
    let embeddingVector: string | null = null;
    try {
      const vector = await this.embedding.embed(redactedSummary);
      embeddingVector = `[${vector.join(',')}]`; // pgvector format
    } catch (err) {
      console.warn('[MemoryAgent] Embedding generation failed, storing without vector:', err);
    }

    // Compute expiry based on consent
    const expiresAt =
      consentLevel === 'ephemeral'
        ? new Date(Date.now() + 1000 * 60 * 60) // 1 hour for ephemeral
        : consentLevel === 'session'
          ? new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h for session
          : new Date(Date.now() + 1000 * 60 * 60 * 24 * 90); // 90 days for persistent

    const record: InsertConversationCheckpoint = {
      userId: input.userId,
      sessionId: input.sessionId,
      checkpointIndex: input.checkpointIndex,
      intent: input.intent,
      persona: input.persona,
      slotsJson: input.slots,
      lastUserMsgsJson: redactedUserMsgs,
      lastAgentMsgsJson: redactedAgentMsgs,
      summary: redactedSummary,
      embedding: embeddingVector,
      consentLevel,
      expiresAt,
    };

    const [checkpoint] = await db
      .insert(conversationCheckpointsTable)
      .values(record)
      .returning();

    console.log(
      `[MemoryAgent] Checkpoint #${input.checkpointIndex} saved for session=${input.sessionId} ` +
        `(consent=${consentLevel}, intent=${input.intent})`,
    );

    return checkpoint;
  }

  // ── Rehydrate ─────────────────────────────────────────────────────────

  /**
   * Rehydrate context for a new message.
   *
   * Strategy:
   *   1. Fetch the latest checkpoint for this session (quick exact match)
   *   2. If user is logged in, fetch top-k semantically relevant past checkpoints
   *   3. If user is logged in, fetch top-k relevant durable facts
   *   4. Assemble a bounded context window string
   *
   * @param sessionId - Current session ID
   * @param userId - Logged-in user ID (null for anonymous)
   * @param query - Current user message (for semantic search)
   * @param options - Context window size options
   */
  async rehydrate(
    sessionId: string,
    userId: number | null,
    query: string,
    options: ContextWindowOptions = {},
  ): Promise<RehydrationResult> {
    const {
      maxTokens = 2000,
      maxCheckpoints = 3,
      maxFacts = 3,
    } = options;

    const startTime = Date.now();

    // 1. Latest checkpoint for current session
    const [latestCheckpoint] = await db
      .select()
      .from(conversationCheckpointsTable)
      .where(
        and(
          eq(conversationCheckpointsTable.sessionId, sessionId),
          gt(conversationCheckpointsTable.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(conversationCheckpointsTable.checkpointIndex))
      .limit(1);

    // 2. Semantic search for relevant past checkpoints (cross-session)
    let relevantCheckpoints: ConversationCheckpoint[] = [];
    if (userId) {
      try {
        relevantCheckpoints = await this.semanticSearchCheckpoints(
          userId,
          query,
          maxCheckpoints,
          sessionId, // exclude current session from cross-session results
        );
      } catch (err) {
        console.warn('[MemoryAgent] Semantic checkpoint search failed:', err);
      }
    }

    // 3. Relevant durable facts
    let relevantFacts: UserMemory[] = [];
    if (userId) {
      try {
        relevantFacts = await this.getRelevantFacts(userId, query, maxFacts);
      } catch (err) {
        console.warn('[MemoryAgent] Fact retrieval failed:', err);
      }
    }

    // 4. Assemble context window
    const contextWindow = this.buildContextWindow(
      latestCheckpoint ?? null,
      relevantCheckpoints,
      relevantFacts,
      maxTokens,
    );

    const latency = Date.now() - startTime;
    console.log(
      `[MemoryAgent] Rehydration complete in ${latency}ms: ` +
        `checkpoint=${latestCheckpoint ? 'yes' : 'none'}, ` +
        `crossSession=${relevantCheckpoints.length}, ` +
        `facts=${relevantFacts.length}`,
    );

    return {
      latestCheckpoint: latestCheckpoint ?? null,
      relevantCheckpoints,
      relevantFacts,
      contextWindow,
    };
  }

  // ── Durable Fact CRUD ─────────────────────────────────────────────────

  /**
   * Store or update a durable fact for a user.
   * Generates embedding for semantic retrieval.
   */
  async storeFact(input: FactInput): Promise<UserMemory> {
    const redactedValue = this.privacy.redactPII(input.factValue);

    let embeddingVector: string | null = null;
    try {
      const vector = await this.embedding.embed(
        `${input.factKey}: ${redactedValue}`,
      );
      embeddingVector = `[${vector.join(',')}]`;
    } catch {
      // Non-fatal: store without embedding
    }

    // Upsert: if same userId + factKey exists, update
    const existing = await db
      .select()
      .from(userMemoryTable)
      .where(
        and(
          eq(userMemoryTable.userId, input.userId),
          eq(userMemoryTable.factKey, input.factKey),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(userMemoryTable)
        .set({
          factValue: redactedValue,
          factType: input.factType,
          embedding: embeddingVector,
          source: input.source ?? 'agent_inferred',
          confidence: input.confidence ?? 1.0,
          updatedAt: new Date(),
          expiresAt: input.expiresAt ?? null,
        })
        .where(eq(userMemoryTable.id, existing[0].id))
        .returning();
      return updated;
    }

    const record: InsertUserMemory = {
      userId: input.userId,
      factType: input.factType,
      factKey: input.factKey,
      factValue: redactedValue,
      embedding: embeddingVector,
      source: input.source ?? 'agent_inferred',
      confidence: input.confidence ?? 1.0,
      expiresAt: input.expiresAt ?? null,
    };

    const [fact] = await db
      .insert(userMemoryTable)
      .values(record)
      .returning();

    return fact;
  }

  /** List all facts for a user */
  async listFacts(userId: number): Promise<UserMemory[]> {
    return db
      .select()
      .from(userMemoryTable)
      .where(eq(userMemoryTable.userId, userId))
      .orderBy(desc(userMemoryTable.updatedAt));
  }

  /** Delete a specific fact */
  async deleteFact(userId: number, factId: string): Promise<boolean> {
    const result = await db
      .delete(userMemoryTable)
      .where(
        and(
          eq(userMemoryTable.id, factId),
          eq(userMemoryTable.userId, userId),
        ),
      )
      .returning();
    return result.length > 0;
  }

  /** Purge all memories for a user (GDPR-style right to be forgotten) */
  async purgeAllMemories(userId: number): Promise<void> {
    await db
      .delete(userMemoryTable)
      .where(eq(userMemoryTable.userId, userId));
    await db
      .delete(conversationCheckpointsTable)
      .where(eq(conversationCheckpointsTable.userId, userId));
    console.log(`[MemoryAgent] Purged all memories for user=${userId}`);
  }

  // ── Private helpers ───────────────────────────────────────────────────

  /**
   * Semantic search over past checkpoints using pgvector cosine similarity.
   * Excludes the current session to avoid duplication.
   */
  private async semanticSearchCheckpoints(
    userId: number,
    query: string,
    topK: number,
    excludeSessionId?: string,
  ): Promise<ConversationCheckpoint[]> {
    const queryVector = await this.embedding.embed(query);
    const vectorStr = `[${queryVector.join(',')}]`;

    // NOTE: This raw SQL query uses pgvector's <=> cosine distance operator.
    // The embedding column must be of type vector(1536) in the actual DB.
    const results = await db.execute(sql`
      SELECT *, (embedding::vector(1536) <=> ${vectorStr}::vector(1536)) AS distance
      FROM conversation_checkpoints
      WHERE user_id = ${userId}
        AND embedding IS NOT NULL
        AND expires_at > now()
        ${excludeSessionId ? sql`AND session_id != ${excludeSessionId}` : sql``}
      ORDER BY distance ASC
      LIMIT ${topK}
    `);

    return (results.rows ?? []) as ConversationCheckpoint[];
  }

  /**
   * Semantic search over durable user facts.
   */
  async getRelevantFacts(
    userId: number,
    query: string,
    topK: number,
  ): Promise<UserMemory[]> {
    // First try semantic search if embeddings exist
    try {
      const queryVector = await this.embedding.embed(query);
      const vectorStr = `[${queryVector.join(',')}]`;

      const results = await db.execute(sql`
        SELECT *, (embedding::vector(1536) <=> ${vectorStr}::vector(1536)) AS distance
        FROM user_memory
        WHERE user_id = ${userId}
          AND embedding IS NOT NULL
          AND (expires_at IS NULL OR expires_at > now())
        ORDER BY distance ASC
        LIMIT ${topK}
      `);

      if ((results.rows ?? []).length > 0) {
        return results.rows as UserMemory[];
      }
    } catch {
      // Fall through to non-semantic retrieval
    }

    // Fallback: return most recent facts
    return db
      .select()
      .from(userMemoryTable)
      .where(eq(userMemoryTable.userId, userId))
      .orderBy(desc(userMemoryTable.confidence), desc(userMemoryTable.updatedAt))
      .limit(topK);
  }

  /**
   * Assemble a bounded context string from checkpoints and facts.
   * Estimates token count at ~4 chars per token.
   */
  private buildContextWindow(
    latest: ConversationCheckpoint | null,
    crossSession: ConversationCheckpoint[],
    facts: UserMemory[],
    maxTokens: number,
  ): string {
    const CHARS_PER_TOKEN = 4;
    const maxChars = maxTokens * CHARS_PER_TOKEN;
    const parts: string[] = [];
    let currentChars = 0;

    // 1. Current session context (highest priority)
    if (latest) {
      const sessionCtx = this.formatCheckpoint(latest, 'Current Session');
      if (currentChars + sessionCtx.length <= maxChars) {
        parts.push(sessionCtx);
        currentChars += sessionCtx.length;
      }
    }

    // 2. Durable facts (second priority)
    if (facts.length > 0) {
      const factsHeader = '## Known User Preferences\n';
      let factsBlock = factsHeader;
      for (const fact of facts) {
        const line = `- ${fact.factKey}: ${fact.factValue} (confidence: ${fact.confidence})\n`;
        if (currentChars + factsBlock.length + line.length <= maxChars) {
          factsBlock += line;
        }
      }
      if (factsBlock !== factsHeader) {
        parts.push(factsBlock);
        currentChars += factsBlock.length;
      }
    }

    // 3. Cross-session checkpoints (third priority, most expendable)
    for (const cp of crossSession) {
      const block = this.formatCheckpoint(cp, 'Previous Session');
      if (currentChars + block.length <= maxChars) {
        parts.push(block);
        currentChars += block.length;
      }
    }

    return parts.join('\n---\n');
  }

  private formatCheckpoint(
    cp: ConversationCheckpoint,
    label: string,
  ): string {
    const persona = cp.persona ? ` (persona: ${cp.persona})` : '';
    const dateStr = new Date(cp.createdAt).toLocaleDateString();
    return (
      `## ${label}${persona} — ${dateStr}\n` +
      `Intent: ${cp.intent}\n` +
      `Summary: ${cp.summary ?? 'N/A'}\n` +
      `State: ${JSON.stringify(cp.slotsJson)}\n`
    );
  }
}
