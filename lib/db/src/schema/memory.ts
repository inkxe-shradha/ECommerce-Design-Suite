/**
 * memory.ts — Drizzle schema for MemoryAgent persistence.
 *
 * Tables:
 *   - conversation_checkpoints: Server-side conversation state snapshots
 *   - user_memory: Durable user facts/preferences with semantic embeddings
 *
 * Requires: pgvector extension (CREATE EXTENSION IF NOT EXISTS vector)
 *
 * @see implementation_plan.md — TICKET MEM-1
 */

import {
  pgTable,
  uuid,
  integer,
  text,
  timestamp,
  real,
  index,
  jsonb,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from './users.js';

// ─── conversation_checkpoints ───────────────────────────────────────────────

export const conversationCheckpointsTable = pgTable(
  'conversation_checkpoints',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    /** FK to users.id — null for anonymous/guest sessions */
    userId: integer('user_id').references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

    /** Client-generated session UUID (persisted in sessionStorage) */
    sessionId: text('session_id').notNull(),

    /** Sequential checkpoint index within session */
    checkpointIndex: integer('checkpoint_index').notNull().default(0),

    /** Classified intent at checkpoint time */
    intent: text('intent').notNull(),

    /** Detected persona at checkpoint time (parent, student, gamer, etc.) */
    persona: text('persona'),

    /** Full consultation state snapshot (category, useCase, budget, slots...) */
    slotsJson: jsonb('slots_json').notNull().default({}),

    /** Last 3 user messages for context reconstruction */
    lastUserMsgsJson: jsonb('last_user_msgs_json').notNull().default([]),

    /** Last 3 agent replies for context reconstruction */
    lastAgentMsgsJson: jsonb('last_agent_msgs_json').notNull().default([]),

    /** Short natural-language summary of this checkpoint */
    summary: text('summary'),

    /**
     * Embedding vector for semantic retrieval.
     * In migration SQL this should be: vector(1536).
     * Drizzle stores as text; cast via sql`` at query time.
     */
    embedding: text('embedding'),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Auto-expiry for cleanup job. Default: 90 days from creation. */
    expiresAt: timestamp('expires_at', { withTimezone: true })
      .notNull()
      .default(sql`now() + interval '90 days'`),

    /**
     * Memory consent level:
     *   - 'ephemeral'  — deleted at session end (default)
     *   - 'session'    — persisted for session duration only
     *   - 'persistent' — persisted until user deletes or TTL expires
     */
    consentLevel: text('consent_level').notNull().default('ephemeral'),
  },
  (t) => [
    index('checkpoints_session_idx').on(t.sessionId, t.checkpointIndex),
    index('checkpoints_user_idx').on(t.userId),
    index('checkpoints_expires_idx').on(t.expiresAt),
  ],
);

export type ConversationCheckpoint =
  typeof conversationCheckpointsTable.$inferSelect;
export type InsertConversationCheckpoint =
  typeof conversationCheckpointsTable.$inferInsert;

// ─── user_memory ────────────────────────────────────────────────────────────

export const userMemoryTable = pgTable(
  'user_memory',
  {
    id: uuid('id')
      .primaryKey()
      .default(sql`gen_random_uuid()`),

    /** FK to users.id — required (only logged-in users get durable memory) */
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    /**
     * Fact classification:
     *   - 'preference'       — brand preference, budget range, category affinity
     *   - 'persona'          — parent, student, gamer, professional
     *   - 'explicit_fact'    — user explicitly stated ("I have a 10-year-old son")
     *   - 'purchase_pattern' — derived from order history
     */
    factType: text('fact_type').notNull(),

    /** Structured key, e.g. 'budget_range', 'child_age', 'preferred_brands' */
    factKey: text('fact_key').notNull(),

    /**
     * JSON-encoded value. Encrypted at rest when containing sensitive info.
     * See PrivacyGuard for encryption logic.
     */
    factValue: text('fact_value').notNull(),

    /** Embedding for semantic search over facts */
    embedding: text('embedding'),

    /**
     * Provenance:
     *   - 'user_explicit' — user directly stated
     *   - 'agent_inferred' — derived by agent from conversation
     *   - 'system' — computed from purchase/browse history
     */
    source: text('source').notNull().default('agent_inferred'),

    /** Confidence of inferred facts (1.0 for explicit) */
    confidence: real('confidence').notNull().default(1.0),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** null = no auto-expiry */
    expiresAt: timestamp('expires_at', { withTimezone: true }),
  },
  (t) => [
    index('user_memory_user_type_idx').on(t.userId, t.factType),
    index('user_memory_user_key_idx').on(t.userId, t.factKey),
  ],
);

export type UserMemory = typeof userMemoryTable.$inferSelect;
export type InsertUserMemory = typeof userMemoryTable.$inferInsert;
