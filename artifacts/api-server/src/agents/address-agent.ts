import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

export class AddressAgent implements Agent {
  name = 'AddressAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId } = ctx;

    if (!userId) {
      return {
        reply: `🔒 To view your saved delivery address, please **log in** first. I'll be able to show your shipping details and help you update them!`,
        products: [],
        orders: [],
        requiresLogin: true,
        userContext: null,
      };
    }

    let reply = parsed.reply;
    if (!reply) {
      const addr = userContext.lastAddress as any;
      reply = addr
        ? `Your last delivery address was:\n📍 ${addr.name}, ${addr.street}, ${addr.city} - ${addr.zip}`
        : `No saved address found. You can add one during checkout.`;
    }

    return {
      reply,
      products: [],
      orders: [],
      userContext: {
        name: userContext.name,
        recentOrderCount: userContext.recentOrders?.length ?? 0,
        interests: userContext.interests,
      },
    };
  }
}
