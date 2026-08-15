/**
 * build-chat-graph.ts — Declarative graph wiring for the ShopNow chat pipeline.
 *
 * Replaces the imperative SupervisorAgent orchestration with a StateGraph:
 *
 *   START → MemoryRehydrateNode → RouterNode → [conditional] → SpecialistNode
 *     → GuardrailNode → [conditional: high_risk → HumanReviewNode | safe → CheckpointNode]
 *     → END
 *
 * This file constructs and compiles the graph. The SupervisorAgent simply
 * calls `compiledGraph.invoke(initialState)` and extracts the response.
 *
 * @see implementation_plan.md — TICKET GRAPH-2
 */

import {
  StateGraph,
  START,
  END,
  type GraphState,
  type AgentNode,
} from './state-graph.js';
import { MemoryAgent } from '../memory/memory-agent.js';
import { RouterAgent } from '../router-agent.js';
import { GuardrailAgent } from '../guardrail-agent.js';

// Import all specialist agents
import { GreetingAgent } from '../greeting-agent.js';
import { ProductSearchAgent } from '../product-search-agent.js';
import { GuidedProductAdvisorAgent } from '../guided-product-advisor-agent.js';
import { GamingBuildAdvisorAgent } from '../gaming-build-advisor-agent.js';
import { BundleAdvisorAgent } from '../bundle-advisor-agent.js';
import { OrdersAgent } from '../orders-agent.js';
import { AddToCartAgent } from '../add-to-cart-agent.js';
import { TopPicksAgent } from '../top-picks-agent.js';
import { PopularProductsAgent } from '../popular-products-agent.js';
import { UnknownAgent } from '../unknown-agent.js';

// ─── Adapter: Wrap existing Agent interface as AgentNode ────────────────────

function wrapSpecialist(agent: { name: string; execute: Function }): AgentNode {
  return {
    name: agent.name,
    async execute(state: GraphState): Promise<GraphState> {
      const ctx = {
        message: state.message,
        userId: state.userId,
        userContext: state.userContext,
        history: state.history,
      };

      const response = await agent.execute(ctx, state.parsedIntent ?? {});
      return { ...state, agentResponse: response };
    },
  };
}

// ─── Memory Rehydrate Node ──────────────────────────────────────────────────

function createMemoryRehydrateNode(memoryAgent: MemoryAgent): AgentNode {
  return {
    name: 'MemoryRehydrate',
    async execute(state: GraphState): Promise<GraphState> {
      try {
        const memory = await memoryAgent.rehydrate(
          state.sessionId,
          state.userId,
          state.message,
          { maxTokens: 2000, maxCheckpoints: 3, maxFacts: 3 },
        );

        // Inject memory context into history for downstream agents
        if (memory.contextWindow) {
          const memoryMessage = {
            role: 'system',
            content: `[Memory Context]\n${memory.contextWindow}`,
          };
          return {
            ...state,
            memory,
            history: [memoryMessage, ...state.history],
            // Restore persona from checkpoint if available
            persona:
              state.persona ??
              memory.latestCheckpoint?.persona ??
              null,
          };
        }

        return { ...state, memory };
      } catch (err) {
        console.warn('[MemoryRehydrateNode] Rehydration failed, continuing without memory:', err);
        return state;
      }
    },
  };
}

// ─── Router Node ────────────────────────────────────────────────────────────

function createRouterNode(routerAgent: RouterAgent): AgentNode {
  return {
    name: 'Router',
    async execute(state: GraphState): Promise<GraphState> {
      const ctx = {
        message: state.message,
        userId: state.userId,
        userContext: state.userContext,
        history: state.history,
      };

      const parsed = await routerAgent.classifyIntent(ctx);

      // Persona detection from message content
      const lower = state.message.toLowerCase();
      let persona = state.persona;
      if (!persona) {
        if (/\b(my son|my daughter|my kid|for my child|for my boy|for my girl)\b/.test(lower)) {
          persona = 'parent';
        } else if (/\b(i'?m a student|for school|for college|for university)\b/.test(lower)) {
          persona = 'student';
        } else if (/\b(i'?m a gamer|gaming enthusiast)\b/.test(lower)) {
          persona = 'gamer';
        } else if (/\b(for my wife|for my husband|for my partner|anniversary|birthday gift)\b/.test(lower)) {
          persona = 'gift_buyer';
        }
      }

      // Determine route target
      const routeTo = parsed.isGreeting ? 'greeting' : parsed.intent ?? 'unknown';

      return {
        ...state,
        parsedIntent: parsed,
        persona,
        routeTo,
      };
    },
  };
}

// ─── Guardrail Node ─────────────────────────────────────────────────────────

function createGuardrailNode(guardrailAgent: GuardrailAgent): AgentNode {
  return {
    name: 'Guardrail',
    async execute(state: GraphState): Promise<GraphState> {
      if (!state.agentResponse) {
        return { ...state, guardrailFlags: ['no_response'] };
      }

      const ctx = {
        message: state.message,
        userId: state.userId,
        userContext: state.userContext,
        history: state.history,
      };

      // Apply existing guardrail finalization
      const finalizedResponse = guardrailAgent.finalize(ctx, state.agentResponse);

      // Add transparency metadata
      finalizedResponse.isAIGenerated = true;

      // Check for high-risk conditions
      const totalCartValue = (finalizedResponse.products ?? []).reduce(
        (sum: number, p: any) => sum + (Number(p.price) || 0),
        0,
      );

      const isHighRisk = totalCartValue > 50000;

      return {
        ...state,
        agentResponse: finalizedResponse,
        requiresHumanReview: isHighRisk,
        riskLevel: isHighRisk ? 'high' : 'low',
        guardrailFlags: [],
      };
    },
  };
}

// ─── Memory Checkpoint Node ─────────────────────────────────────────────────

function createCheckpointNode(memoryAgent: MemoryAgent): AgentNode {
  return {
    name: 'MemoryCheckpoint',
    async execute(state: GraphState): Promise<GraphState> {
      // Only checkpoint if there's meaningful state to save
      if (!state.agentResponse || !state.parsedIntent) {
        return state;
      }

      // Determine checkpoint index
      const lastIndex = state.memory?.latestCheckpoint?.checkpointIndex ?? -1;

      try {
        await memoryAgent.checkpoint({
          sessionId: state.sessionId,
          userId: state.userId,
          checkpointIndex: lastIndex + 1,
          intent: state.routeTo ?? 'unknown',
          persona: state.persona,
          slots: {
            parsedIntent: state.parsedIntent,
            productCount: state.agentResponse.products?.length ?? 0,
            hasOrders: (state.agentResponse.orders?.length ?? 0) > 0,
          },
          lastUserMsgs: [state.message],
          lastAgentMsgs: [state.agentResponse.reply?.slice(0, 500) ?? ''],
          summary: `User asked about ${state.routeTo}. ` +
            `${state.persona ? `Persona: ${state.persona}. ` : ''}` +
            `Returned ${state.agentResponse.products?.length ?? 0} products.`,
          consentLevel: state.consentLevel,
        });
      } catch (err) {
        console.warn('[CheckpointNode] Checkpoint failed:', err);
        // Non-fatal: don't block the response
      }

      // Store persona as durable fact if detected and user is logged in
      if (state.persona && state.userId && state.consentLevel === 'persistent') {
        try {
          await memoryAgent.storeFact({
            userId: state.userId,
            factType: 'persona',
            factKey: 'detected_persona',
            factValue: state.persona,
            source: 'agent_inferred',
            confidence: 0.8,
          });
        } catch {
          // Non-fatal
        }
      }

      return state;
    },
  };
}

// ─── Human Review Node ──────────────────────────────────────────────────────

const humanReviewNode: AgentNode = {
  name: 'HumanReview',
  async execute(state: GraphState): Promise<GraphState> {
    if (!state.agentResponse) return state;

    // Augment response with human review metadata
    state.agentResponse.requiresHumanReview = true;
    state.agentResponse.reply =
      `⚠️ **This recommendation involves a high-value purchase.**\n\n` +
      `For your protection, we'd like a team member to review before you proceed.\n\n` +
      state.agentResponse.reply;

    return state;
  },
};

// ─── Build and Compile the Chat Graph ───────────────────────────────────────

export function buildChatGraph(): ReturnType<StateGraph['compile']> {
  const memoryAgent = new MemoryAgent();
  const routerAgent = new RouterAgent();
  const guardrailAgent = new GuardrailAgent();

  const graph = new StateGraph();

  // Register middleware nodes
  graph.addNode('memoryRehydrate', createMemoryRehydrateNode(memoryAgent));
  graph.addNode('router', createRouterNode(routerAgent));
  graph.addNode('guardrail', createGuardrailNode(guardrailAgent));
  graph.addNode('humanReview', humanReviewNode);
  graph.addNode('memoryCheckpoint', createCheckpointNode(memoryAgent));

  // Register specialist nodes (wrap existing agents)
  graph.addNode('greeting', wrapSpecialist(new GreetingAgent()));
  graph.addNode('product_search', wrapSpecialist(new ProductSearchAgent()));
  graph.addNode('guided_advisor', wrapSpecialist(new GuidedProductAdvisorAgent()));
  graph.addNode('gaming_build', wrapSpecialist(new GamingBuildAdvisorAgent()));
  graph.addNode('bundle_advisor', wrapSpecialist(new BundleAdvisorAgent()));
  graph.addNode('orders', wrapSpecialist(new OrdersAgent()));
  graph.addNode('add_to_cart', wrapSpecialist(new AddToCartAgent()));
  graph.addNode('top_picks', wrapSpecialist(new TopPicksAgent()));
  graph.addNode('popular_products', wrapSpecialist(new PopularProductsAgent()));
  graph.addNode('unknown', wrapSpecialist(new UnknownAgent()));

  // ── Wire the edges ──────────────────────────────────────────────────

  // START → Memory Rehydrate
  graph.addEdge(START, 'memoryRehydrate');

  // Memory Rehydrate → Router
  graph.addEdge('memoryRehydrate', 'router');

  // Router → [conditional] → Specialist
  graph.addConditionalEdge(
    'router',
    (state) => state.routeTo ?? 'unknown',
    {
      greeting: 'greeting',
      product_search: 'product_search',
      guided_advisor: 'guided_advisor',
      gaming_build: 'gaming_build',
      bundle_advisor: 'bundle_advisor',
      orders: 'orders',
      order: 'orders',
      order_history: 'orders',
      order_status: 'orders',
      add_to_cart: 'add_to_cart',
      top_picks: 'top_picks',
      popular_products: 'popular_products',
      __default__: 'unknown',
    },
  );

  // All specialists → Guardrail
  const specialists = [
    'greeting', 'product_search', 'guided_advisor', 'gaming_build',
    'bundle_advisor', 'orders', 'add_to_cart', 'top_picks',
    'popular_products', 'unknown',
  ];
  for (const s of specialists) {
    graph.addEdge(s, 'guardrail');
  }

  // Guardrail → [conditional] → HumanReview or Checkpoint
  graph.addConditionalEdge(
    'guardrail',
    (state) => state.requiresHumanReview ? 'high_risk' : 'safe',
    {
      high_risk: 'humanReview',
      safe: 'memoryCheckpoint',
    },
  );

  // HumanReview → Checkpoint
  graph.addEdge('humanReview', 'memoryCheckpoint');

  // Checkpoint → END
  graph.addEdge('memoryCheckpoint', END);

  return graph.compile();
}
