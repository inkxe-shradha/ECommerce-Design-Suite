import { AgentGraph } from './agent-graph.js';
import {
  createProductSearchClarification,
  mergePendingProductSearch,
  needsProductSearchClarification,
} from './clarification-policy.js';
import { GraphRunner } from './graph-runner.js';
import { GuardrailAgent } from './guardrail-agent.js';
import { RouterAgent } from './router-agent.js';
import {
  detectCorrection,
  formatSelfCorrectionPrefix,
} from './self-correction-engine.js';
import type { AgentContext, AgentResponse } from './types.js';

export class SupervisorAgent {
  name = 'SupervisorAgent';

  private readonly router = new RouterAgent();
  private readonly graphRunner = new GraphRunner(new AgentGraph());
  private readonly guardrail = new GuardrailAgent();

  async execute(ctx: AgentContext): Promise<AgentResponse> {
    const correctionAnalysis = detectCorrection(ctx.message);
    if (correctionAnalysis.isCorrection) {
      console.log(
        `[SupervisorAgent] Self-correction triggered (${correctionAnalysis.correctionType}): "${ctx.message}"`,
      );
    }

    try {
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

      // If user corrected the AI, prepend self-correction acknowledgment
      if (correctionAnalysis.isCorrection && response.reply) {
        const prefix = formatSelfCorrectionPrefix(correctionAnalysis);
        if (!response.reply.startsWith('💡')) {
          response.reply = prefix + response.reply;
        }
      }

      return this.guardrail.finalize(ctx, response);
    } catch (error) {
      console.error('[SupervisorAgent] Error in execution graph:', error);

      // Fault-tolerant self-healing fallback response
      const fallbackResponse: AgentResponse = {
        reply:
          "💡 **I noticed a hiccup while processing your request.** My apologies! Let me help you directly:\n\n" +
          "Could you tell me your target product, preferred brand (e.g. Apple, Samsung, ASUS), or budget?",
        products: [],
        orders: [],
        followUp: [
          'Build a Gaming PC',
          'Show Mobiles',
          'Show Laptops',
          'Apply a coupon',
        ],
        userContext: ctx.userContext
          ? {
              name: ctx.userContext.name,
              recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
              interests: ctx.userContext.interests,
            }
          : null,
      };

      return this.guardrail.finalize(ctx, fallbackResponse);
    }
  }
}
