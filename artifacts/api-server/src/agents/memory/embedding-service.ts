/**
 * embedding-service.ts — Abstraction over embedding generation and vector search.
 *
 * Default implementation: OpenAI text-embedding-3-small (1536 dimensions).
 * Designed for easy swap to local models (Ollama/nomic-embed) or managed
 * vector DBs (Pinecone, Weaviate) via the interface.
 *
 * @see implementation_plan.md — TICKET MEM-4
 */

// ─── Interface ──────────────────────────────────────────────────────────────

export interface IEmbeddingService {
  /** Generate a single embedding vector from text */
  embed(text: string): Promise<number[]>;
  /** Generate embeddings for multiple texts (batch) */
  embedBatch(texts: string[]): Promise<number[][]>;
}

// ─── OpenAI Implementation ──────────────────────────────────────────────────

export class EmbeddingService implements IEmbeddingService {
  private readonly model: string;
  private readonly dimensions: number;
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;

  constructor(opts?: {
    model?: string;
    dimensions?: number;
    apiKey?: string;
    baseUrl?: string;
  }) {
    this.model = opts?.model ?? 'text-embedding-3-small';
    this.dimensions = opts?.dimensions ?? 1536;
    this.apiKey = opts?.apiKey ?? process.env.OPENAI_API_KEY;
    this.baseUrl = opts?.baseUrl ?? 'https://api.openai.com/v1';
  }

  async embed(text: string): Promise<number[]> {
    const [result] = await this.embedBatch([text]);
    return result;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      console.warn(
        '[EmbeddingService] No API key configured, returning zero vectors',
      );
      return texts.map(() => new Array(this.dimensions).fill(0));
    }

    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: texts.map((t) => t.slice(0, 8000)), // Truncate to model limit
          dimensions: this.dimensions,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Embedding API error ${response.status}: ${errorText}`,
        );
      }

      const json = (await response.json()) as {
        data: Array<{ embedding: number[]; index: number }>;
      };

      // Sort by index to match input order
      return json.data
        .sort((a, b) => a.index - b.index)
        .map((d) => d.embedding);
    } catch (err) {
      console.error('[EmbeddingService] Failed to generate embeddings:', err);
      // Graceful degradation: return zero vectors
      return texts.map(() => new Array(this.dimensions).fill(0));
    }
  }
}

// ─── Placeholder for alternative backends ───────────────────────────────────

/**
 * Example: PineconeEmbeddingService, WeaviateEmbeddingService, OllamaEmbeddingService
 *
 * Implement IEmbeddingService and swap in MemoryAgent constructor:
 *
 *   const memoryAgent = new MemoryAgent(
 *     new PineconeEmbeddingService({ apiKey: '...', index: '...' }),
 *   );
 */
