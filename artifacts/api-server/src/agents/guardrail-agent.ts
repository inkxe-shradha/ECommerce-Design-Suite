import type { AgentContext, AgentResponse } from './types.js';

export class GuardrailAgent {
  name = 'GuardrailAgent';

  finalize(ctx: AgentContext, response: AgentResponse): AgentResponse {
    return {
      ...response,
      reply:
        typeof response.reply === 'string' && response.reply.trim()
          ? response.reply
          : 'I could not complete that request. Please try again.',
      products: Array.isArray(response.products) ? response.products : [],
      orders: Array.isArray(response.orders) ? response.orders : [],
      followUp: Array.isArray(response.followUp)
        ? response.followUp
        : undefined,
      userContext:
        response.userContext ??
        (ctx.userId
          ? {
              name: ctx.userContext.name,
              recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
              interests: ctx.userContext.interests,
            }
          : null),
    };
  }
}
