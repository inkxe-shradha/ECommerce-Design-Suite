import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

export class UnknownAgent implements Agent {
  name = 'UnknownAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId } = ctx;
    const name = userContext.name ? `, ${userContext.name}` : '';

    let reply = parsed.reply;
    if (!reply) {
      const suggestions = userId
        ? `I'm here to help${name}! Try asking me:\n• "Show me laptops under ₹60,000"\n• "My recent orders"\n• "Top picks for me"\n• "What's my delivery address?"`
        : `I'm here to help! Try asking me:\n• "Show me laptops under ₹60,000"\n• "Best budget phones"\n• "Premium headphones"\n\n💡 **Log in** to access your orders, saved addresses, and personalised picks!`;
      reply = suggestions;
    }

    return {
      reply,
      products: [],
      orders: [],
      userContext: userId
        ? {
            name: userContext.name,
            recentOrderCount: userContext.recentOrders?.length ?? 0,
            interests: userContext.interests,
          }
        : null,
    };
  }
}
