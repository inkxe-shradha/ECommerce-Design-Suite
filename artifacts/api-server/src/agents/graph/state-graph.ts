/**
 * state-graph.ts — LangGraph-inspired StateGraph for the ShopNow agent pipeline.
 *
 * Provides a declarative, middleware-aware graph runner that replaces the
 * current flat AgentGraph → GraphRunner dispatch.
 *
 * Key concepts:
 *   - GraphState: Shared mutable state flowing through nodes
 *   - AgentNode: Any unit of work (agent, middleware, tool call)
 *   - StateGraph: Builder for declaring nodes and edges
 *   - CompiledGraph: Executable pipeline from a compiled StateGraph
 *
 * @see implementation_plan.md — TICKET GRAPH-1, GRAPH-2
 */

import type { AgentResponse, ParsedIntent, UserContext } from '../types.js';
import type { RehydrationResult } from '../memory/memory-agent.js';

// ─── Graph State ────────────────────────────────────────────────────────────

export interface GraphState {
  // ── Input ───────────────────────────────────────────────────────────
  /** Raw user message */
  message: string;
  /** Authenticated user ID (null for anonymous) */
  userId: number | null;
  /** User context from DB (orders, interests, etc.) */
  userContext: UserContext;
  /** Conversation history from client */
  history: Array<{ role: string; content: string }>;
  /** Client-provided session ID */
  sessionId: string;

  // ── Memory (populated by MemoryAgent.rehydrate) ─────────────────────
  /** Rehydrated memory context */
  memory?: RehydrationResult;
  /** Consent level for this session */
  consentLevel: 'ephemeral' | 'session' | 'persistent';

  // ── Router (populated by RouterAgent) ───────────────────────────────
  /** Parsed intent classification */
  parsedIntent?: ParsedIntent;
  /** Detected persona (parent, student, gamer, etc.) */
  persona?: string | null;
  /** Which specialist node to route to */
  routeTo?: string;

  // ── Specialist (populated by specialist agents) ─────────────────────
  /** Specialist agent response */
  agentResponse?: AgentResponse;

  // ── Guardrail (populated by GuardrailAgent) ─────────────────────────
  /** Whether the response was flagged */
  guardrailFlags?: string[];
  /** Whether a human review is required */
  requiresHumanReview?: boolean;
  /** Risk level */
  riskLevel?: 'low' | 'medium' | 'high';

  // ── Execution metadata ──────────────────────────────────────────────
  /** Trace of node executions for debugging */
  executionTrace: Array<{
    node: string;
    startTime: number;
    endTime: number;
    error?: string;
  }>;
  /** Current node in execution */
  currentNode?: string;
  /** Terminal: should the graph stop? */
  shouldTerminate: boolean;
  /** Error that caused early termination */
  terminalError?: Error;
}

// ─── Agent Node Interface ───────────────────────────────────────────────────

export interface AgentNode {
  /** Unique node name */
  name: string;
  /** Execute this node, returning the (potentially mutated) state */
  execute(state: GraphState): Promise<GraphState>;
}

// ─── Edge Types ─────────────────────────────────────────────────────────────

interface DirectEdge {
  type: 'direct';
  from: string;
  to: string;
}

interface ConditionalEdge {
  type: 'conditional';
  from: string;
  router: (state: GraphState) => string;
  /** Map of route key → target node name */
  targets: Record<string, string>;
}

type Edge = DirectEdge | ConditionalEdge;

// ─── StateGraph Builder ─────────────────────────────────────────────────────

export const START = '__START__';
export const END = '__END__';

export class StateGraph {
  private nodes: Map<string, AgentNode> = new Map();
  private edges: Edge[] = [];
  private entryPoint: string | null = null;

  /**
   * Register a node in the graph.
   */
  addNode(name: string, node: AgentNode): StateGraph {
    if (this.nodes.has(name)) {
      throw new Error(`Node "${name}" already registered`);
    }
    this.nodes.set(name, node);
    return this;
  }

  /**
   * Add a direct (unconditional) edge: from → to.
   */
  addEdge(from: string, to: string): StateGraph {
    this.edges.push({ type: 'direct', from, to });
    if (from === START) {
      this.entryPoint = to;
    }
    return this;
  }

  /**
   * Add a conditional edge: the router function returns a key
   * that maps to one of the targets.
   */
  addConditionalEdge(
    from: string,
    router: (state: GraphState) => string,
    targets: Record<string, string>,
  ): StateGraph {
    this.edges.push({ type: 'conditional', from, router, targets });
    return this;
  }

  /**
   * Compile the graph into an executable pipeline.
   * Validates that all edge targets exist and there is an entry point.
   */
  compile(): CompiledGraph {
    if (!this.entryPoint) {
      throw new Error('No entry point defined. Use addEdge(START, "firstNode")');
    }

    // Validate all edge targets reference existing nodes or END
    for (const edge of this.edges) {
      if (edge.type === 'direct') {
        if (edge.to !== END && !this.nodes.has(edge.to)) {
          throw new Error(`Edge target "${edge.to}" is not a registered node`);
        }
      } else {
        for (const [key, target] of Object.entries(edge.targets)) {
          if (target !== END && !this.nodes.has(target)) {
            throw new Error(
              `Conditional edge target "${target}" (key="${key}") is not a registered node`,
            );
          }
        }
      }
    }

    return new CompiledGraph(
      this.nodes,
      this.edges,
      this.entryPoint,
    );
  }
}

// ─── Compiled Graph Executor ────────────────────────────────────────────────

export class CompiledGraph {
  /** Maximum node traversals before forced termination (infinite loop guard) */
  private static readonly MAX_STEPS = 10;

  constructor(
    private readonly nodes: Map<string, AgentNode>,
    private readonly edges: Edge[],
    private readonly entryPoint: string,
  ) {}

  /**
   * Execute the graph starting from the entry point.
   * Traverses nodes following edges until END is reached or MAX_STEPS exceeded.
   */
  async invoke(initialState: GraphState): Promise<GraphState> {
    let state = { ...initialState, executionTrace: [] };
    let currentNodeName = this.entryPoint;
    let steps = 0;

    while (currentNodeName !== END && steps < CompiledGraph.MAX_STEPS) {
      steps++;

      if (state.shouldTerminate) {
        console.log(`[GraphRunner] Early termination at step ${steps}`);
        break;
      }

      const node = this.nodes.get(currentNodeName);
      if (!node) {
        throw new Error(`Node "${currentNodeName}" not found during execution`);
      }

      state.currentNode = currentNodeName;
      const startTime = Date.now();

      try {
        state = await node.execute(state);
        state.executionTrace.push({
          node: currentNodeName,
          startTime,
          endTime: Date.now(),
        });
      } catch (err) {
        state.executionTrace.push({
          node: currentNodeName,
          startTime,
          endTime: Date.now(),
          error: err instanceof Error ? err.message : String(err),
        });
        state.shouldTerminate = true;
        state.terminalError = err instanceof Error ? err : new Error(String(err));
        console.error(`[GraphRunner] Error in node "${currentNodeName}":`, err);
        break;
      }

      // Find the next node
      currentNodeName = this.resolveNextNode(currentNodeName, state);

      console.log(
        `[GraphRunner] Step ${steps}: ${node.name} → ${currentNodeName} (${Date.now() - startTime}ms)`,
      );
    }

    if (steps >= CompiledGraph.MAX_STEPS) {
      console.error(
        `[GraphRunner] Exceeded MAX_STEPS (${CompiledGraph.MAX_STEPS}). Force terminating.`,
      );
    }

    return state;
  }

  /**
   * Resolve the next node name given the current node and state.
   */
  private resolveNextNode(currentNodeName: string, state: GraphState): string {
    // Find edges originating from current node
    const outEdges = this.edges.filter((e) => e.from === currentNodeName);

    if (outEdges.length === 0) {
      return END; // No outgoing edges → terminal
    }

    // Prioritize conditional edges
    for (const edge of outEdges) {
      if (edge.type === 'conditional') {
        const routeKey = edge.router(state);
        const target = edge.targets[routeKey] ?? edge.targets['__default__'];
        if (target) return target;
      }
    }

    // Fall back to direct edge
    for (const edge of outEdges) {
      if (edge.type === 'direct') {
        return edge.to;
      }
    }

    return END;
  }

  /**
   * Get a visualization-friendly representation of the graph.
   */
  describe(): string {
    const lines: string[] = ['Graph Nodes:'];
    for (const [name] of this.nodes) {
      lines.push(`  - ${name}`);
    }
    lines.push('Graph Edges:');
    for (const edge of this.edges) {
      if (edge.type === 'direct') {
        lines.push(`  ${edge.from} → ${edge.to}`);
      } else {
        const targets = Object.entries(edge.targets)
          .map(([k, v]) => `${k}→${v}`)
          .join(', ');
        lines.push(`  ${edge.from} →? [${targets}]`);
      }
    }
    return lines.join('\n');
  }
}
