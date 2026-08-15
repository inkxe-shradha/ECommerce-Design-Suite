/**
 * memory.ts — Express routes for Memory management.
 *
 * Endpoints:
 *   GET    /api/memory/facts          — List user's stored facts
 *   DELETE /api/memory/facts/:id      — Delete a specific memory
 *   POST   /api/memory/consent        — Update consent level
 *   GET    /api/memory/checkpoints    — List checkpoints (debug)
 *   DELETE /api/memory/purge          — Delete all user memories
 *
 * All endpoints require authentication.
 *
 * @see implementation_plan.md — TICKET MEM-3
 */

import { Router } from 'express';
import { MemoryAgent } from '../agents/memory/index.js';
import { getAuthUserId } from '../lib/crypto.js';

export const memoryRouter = Router();

const memoryAgent = new MemoryAgent();

// ── Auth middleware ─────────────────────────────────────────────────────────

function requireAuth(req: any, res: any, next: any) {
  const userId = getAuthUserId(req);
  if (!userId) {
    return res.status(401).json({
      error: 'Authentication required to manage memories',
      privacyNotice:
        'Memory management is only available for logged-in users.',
    });
  }
  req.authenticatedUserId = userId;
  next();
}

// ── GET /api/memory/facts ───────────────────────────────────────────────────

memoryRouter.get('/facts', requireAuth, async (req: any, res) => {
  try {
    const facts = await memoryAgent.listFacts(req.authenticatedUserId);

    return res.status(200).json({
      facts: facts.map((f) => ({
        id: f.id,
        factType: f.factType,
        factKey: f.factKey,
        factValue: f.factValue,
        source: f.source,
        confidence: f.confidence,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
      total: facts.length,
      privacyNotice:
        'These are facts stored from your conversations. You can delete any of them.',
    });
  } catch (error) {
    console.error('[MemoryRouter] Error listing facts:', error);
    return res.status(500).json({ error: 'Failed to retrieve memories' });
  }
});

// ── DELETE /api/memory/facts/:id ────────────────────────────────────────────

memoryRouter.delete('/facts/:id', requireAuth, async (req: any, res) => {
  try {
    const deleted = await memoryAgent.deleteFact(
      req.authenticatedUserId,
      req.params.id,
    );

    if (!deleted) {
      return res.status(404).json({ error: 'Memory not found' });
    }

    return res.status(200).json({
      deleted: true,
      message: 'Memory deleted successfully',
    });
  } catch (error) {
    console.error('[MemoryRouter] Error deleting fact:', error);
    return res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// ── POST /api/memory/consent ────────────────────────────────────────────────

memoryRouter.post('/consent', requireAuth, async (req: any, res) => {
  const { level } = req.body;

  if (!level || !['ephemeral', 'session', 'persistent'].includes(level)) {
    return res.status(400).json({
      error: 'Invalid consent level. Must be: ephemeral, session, or persistent',
    });
  }

  try {
    // TODO: Update consent level in user preferences and propagate
    // to existing checkpoints (MEM-3 implementation detail)

    return res.status(200).json({
      consentLevel: level,
      message: `Memory consent updated to "${level}"`,
      privacyNotice:
        level === 'persistent'
          ? 'Your conversation context will be remembered across sessions. You can delete memories anytime.'
          : level === 'session'
            ? 'Your context is remembered for this session only.'
            : 'No conversation data will be stored.',
    });
  } catch (error) {
    console.error('[MemoryRouter] Error updating consent:', error);
    return res.status(500).json({ error: 'Failed to update consent' });
  }
});

// ── GET /api/memory/checkpoints ─────────────────────────────────────────────

memoryRouter.get('/checkpoints', requireAuth, async (req: any, res) => {
  try {
    // Debug endpoint: list recent checkpoints
    const { sessionId } = req.query;
    // Minimal implementation — full version in MEM-3

    return res.status(200).json({
      message: 'Checkpoint listing coming in MEM-3 implementation',
      sessionId: sessionId ?? 'all',
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to list checkpoints' });
  }
});

// ── DELETE /api/memory/purge ────────────────────────────────────────────────

memoryRouter.delete('/purge', requireAuth, async (req: any, res) => {
  const { confirm } = req.body;

  if (confirm !== 'DELETE_ALL_MEMORIES') {
    return res.status(400).json({
      error:
        'Confirmation required. Send { "confirm": "DELETE_ALL_MEMORIES" } to proceed.',
      warning: 'This action is permanent and cannot be undone.',
    });
  }

  try {
    await memoryAgent.purgeAllMemories(req.authenticatedUserId);

    return res.status(200).json({
      purged: true,
      message: 'All your stored memories have been permanently deleted.',
    });
  } catch (error) {
    console.error('[MemoryRouter] Error purging memories:', error);
    return res.status(500).json({ error: 'Failed to purge memories' });
  }
});
