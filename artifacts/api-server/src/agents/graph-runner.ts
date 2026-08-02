import { AgentGraph } from './agent-graph.js';
import type { AgentContext, AgentResponse, ParsedIntent } from './types.js';

export class GraphRunner {
  constructor(private readonly graph: AgentGraph) {}

  async run(ctx: AgentContext, parsed: ParsedIntent): Promise<AgentResponse> {
    const route = this.graph.resolve(parsed);
    console.log(
      `[GraphRunner] Intent: "${route.intent}" → Executing ${route.agent.name}`,
    );

    return route.agent.execute(ctx, parsed);
  }
}
