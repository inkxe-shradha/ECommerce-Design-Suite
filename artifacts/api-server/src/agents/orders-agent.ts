import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

export class OrdersAgent implements Agent {
  name = 'OrdersAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId } = ctx;

    if (!userId) {
      return {
        reply: `🔒 To view your order history, you'll need to **log in** first. Once logged in, I can show you all your recent orders, track deliveries, and help with returns!`,
        products: [],
        orders: [],
        requiresLogin: true,
        userContext: null,
      };
    }

    const name = userContext.name ? `, ${userContext.name}` : '';

    let reply = parsed.reply;
    if (!reply) {
      const orderSummary = userContext.recentOrders?.length
        ? userContext.recentOrders
            .map(
              (o) =>
                `• Order #${o.id}: ${o.products.join(', ')} — ₹${o.totalAmount} (${o.status})`,
            )
            .join('\n')
        : `You haven't placed any orders yet${name}. Browse our collection and find something you love! 🛍️`;
      reply = userContext.recentOrders?.length
        ? `Here are your recent orders${name}:\n\n${orderSummary}`
        : orderSummary;
    }

    return {
      reply,
      products: [],
      orders: userContext.recentOrders ?? [],
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
