import { AgentGraph } from './agent-graph.js';
import {
  createProductSearchClarification,
  mergePendingProductSearch,
  needsProductSearchClarification,
} from './clarification-policy.js';
import { GraphRunner } from './graph-runner.js';
import { GuardrailAgent } from './guardrail-agent.js';
import { RouterAgent } from './router-agent.js';
import type { AgentContext, AgentResponse } from './types.js';

export class SupervisorAgent {
  name = 'SupervisorAgent';

  private readonly router = new RouterAgent();
  private readonly graphRunner = new GraphRunner(new AgentGraph());
  private readonly guardrail = new GuardrailAgent();

  async execute(ctx: AgentContext): Promise<AgentResponse> {
    const parsed = mergePendingProductSearch(
      ctx,
      await this.router.classifyIntent(ctx),
    );

    if (needsProductSearchClarification(ctx, parsed)) {
      console.log(
        '[SupervisorAgent] Requesting product category clarification',
      );
      return this.guardrail.finalize(
        ctx,
        createProductSearchClarification(ctx, parsed),
      );
    }

    const response = await this.graphRunner.run(ctx, parsed);
    return this.guardrail.finalize(ctx, response);
  }
}
