/**
 * supervisor-v2.ts — Graph-based SupervisorAgent.
 *
 * This is the new entrypoint for chat processing. It replaces the imperative
 * orchestration in supervisor-agent.ts with a single `compiledGraph.invoke()` call.
 *
 * The original supervisor-agent.ts is preserved for backward compatibility.
 * To switch, update the import in routes/ai.ts.
 *
 * @see implementation_plan.md — TICKET GRAPH-2
 */

import { buildChatGraph } from './graph/build-chat-graph.js';
import type { GraphState } from './graph/state-graph.js';
import type { AgentContext, AgentResponse } from './types.js';

const compiledGraph = buildChatGraph();

export class SupervisorAgentV2 {
  name = 'SupervisorAgentV2';

  /**
   * Execute the full graph pipeline for a chat message.
   *
   * @param ctx - Agent context (message, userId, userContext, history)
   * @param sessionId - Client-provided session UUID
   * @param consentLevel - Memory consent level
   */
  async execute(
    ctx: AgentContext & { sessionId?: string },
    consentLevel: 'ephemeral' | 'session' | 'persistent' = 'ephemeral',
  ): Promise<AgentResponse> {
    const initialState: GraphState = {
      message: ctx.message,
      userId: ctx.userId,
      userContext: ctx.userContext,
      history: ctx.history ?? [],
      sessionId: ctx.sessionId ?? crypto.randomUUID(),
      consentLevel,
      executionTrace: [],
      shouldTerminate: false,
    };

    try {
      const finalState = await compiledGraph.invoke(initialState);

      if (finalState.terminalError) {
        console.error(
          '[SupervisorAgentV2] Graph terminated with error:',
          finalState.terminalError,
        );
        return this.buildFallbackResponse(ctx);
      }

      const response = finalState.agentResponse ?? this.buildFallbackResponse(ctx);

      // Attach execution trace in debug mode
      if (process.env.NODE_ENV === 'development') {
        (response as any).__trace = finalState.executionTrace;
      }

      return response;
    } catch (error) {
      console.error('[SupervisorAgentV2] Unhandled error:', error);
      return this.buildFallbackResponse(ctx);
    }
  }

  private buildFallbackResponse(ctx: AgentContext): AgentResponse {
    return {
      reply:
        '💡 **I noticed a hiccup while processing your request.** My apologies!\n\n' +
        'Could you rephrase your question? For example:\n' +
        '• **"Help me pick a mobile"** — guided recommendation\n' +
        '• **"Build me a gaming PC"** — custom PC builder\n' +
        '• **"Show laptops under ₹60,000"** — product search\n' +
        '• **"My recent orders"** — order tracking',
      products: [],
      orders: [],
      followUp: [
        'Help me pick a mobile',
        'Build a Gaming PC',
        'Show Trending Products',
        'My Orders',
      ],
      userContext: ctx.userId
        ? {
            name: ctx.userContext.name,
            recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
            interests: ctx.userContext.interests,
          }
        : null,
    };
  }
}

// ─── Example: Rehydration usage in SupervisorAgent ──────────────────────────
//
// The graph handles rehydration automatically via the MemoryRehydrateNode.
// But if you need manual rehydration outside the graph:
//
//   import { MemoryAgent } from './memory/index.js';
//
//   const memoryAgent = new MemoryAgent();
//
//   // In your handler:
//   const rehydrated = await memoryAgent.rehydrate(
//     sessionId,
//     userId,
//     userMessage,
//     { maxTokens: 2000 },
//   );
//
//   // Inject into prompt context:
//   const systemPrompt = `
//     You are a shopping assistant.
//     ${rehydrated.contextWindow}
//     Current message: ${userMessage}
//   `;
//
