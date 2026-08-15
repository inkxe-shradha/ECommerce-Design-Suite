/**
 * memory/index.ts — Barrel export for the Memory module.
 */

export { MemoryAgent } from './memory-agent.js';
export type {
  CheckpointInput,
  RehydrationResult,
  FactInput,
  ContextWindowOptions,
} from './memory-agent.js';
export { EmbeddingService } from './embedding-service.js';
export type { IEmbeddingService } from './embedding-service.js';
export { PrivacyGuard } from './privacy-guard.js';
export type { PIIDetection } from './privacy-guard.js';
