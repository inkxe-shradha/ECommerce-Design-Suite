import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

// Extract a specific order ID if mentioned in the message
function extractOrderId(message: string): number | null {
  const match = message.match(/(?:order\s*#?\s*|#)(\d{1,6})/i);
  if (match) {
    const id = parseInt(match[1], 10);
    return id > 0 ? id : null;
  }
  return null;
}

// Detect if message is a return/refund/exchange request
function isReturnIntent(message: string): boolean {
  return /return|refund|exchange|cancel.*order|cancellation|damaged|wrong item|replace|replacement/i.test(
    message,
  );
}

export class OrdersAgent implements Agent {
  name = 'OrdersAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId, message } = ctx;

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

    // ── Return / Refund / Exchange request ─────────────────────────────────
    if (isReturnIntent(message) || parsed.reply === 'return') {
      if (!userContext.recentOrders?.length) {
        return {
          reply:
            `🔄 **Returns & Refunds${name}**\n\n` +
            `You don't have any recent orders to return. If you made a purchase, please check your email confirmation or contact our support team.`,
          products: [],
          orders: [],
          followUp: ['What can I buy today?', 'Show trending products'],
          userContext: {
            name: userContext.name,
            recentOrderCount: 0,
            interests: userContext.interests,
          },
        };
      }

      const eligibleOrders = userContext.recentOrders.filter(
        (o) => o.status === 'Delivered' || o.status === 'delivered',
      );

      let reply = `🔄 **Returns & Refunds${name}**\n\n`;
      if (eligibleOrders.length > 0) {
        reply += `Here are your **delivered orders** eligible for return:\n\n`;
        eligibleOrders.forEach((o) => {
          reply += `• **Order #${o.id}** — ₹${o.totalAmount} _(${o.products.join(', ')})_\n`;
        });
        reply += `\n**To initiate a return**: Go to **[My Orders](/orders)** → Click the order → Tap **"Request Return"**.\n`;
        reply += `Returns are processed within **2–3 business days** after pickup.`;
      } else {
        reply +=
          `None of your recent orders are currently eligible for return (items must be in "Delivered" status).\n\n` +
          `For assistance, please contact our support team or check your order status below.`;
      }

      return {
        reply,
        products: [],
        orders: userContext.recentOrders,
        followUp: ['Show all my orders', 'Track my delivery', 'Browse new products'],
        userContext: {
          name: userContext.name,
          recentOrderCount: userContext.recentOrders.length,
          interests: userContext.interests,
        },
      };
    }

    // ── Specific Order ID tracking ──────────────────────────────────────────
    const specificOrderId = extractOrderId(message);
    if (specificOrderId) {
      const found = userContext.recentOrders?.find(
        (o) => o.id === specificOrderId,
      );
      if (found) {
        return {
          reply:
            `📦 **Order #${found.id} Status${name}**\n\n` +
            `**Items**: ${found.products.join(', ')}\n` +
            `**Total**: ₹${found.totalAmount}\n` +
            `**Status**: ${found.status}\n\n` +
            `View full invoice and tracking → [Order Details](/order/${found.id})`,
          products: [],
          orders: [found],
          followUp: [
            `View Order #${found.id} Details`,
            'Show all my orders',
            'Track another order',
          ],
          userContext: {
            name: userContext.name,
            recentOrderCount: userContext.recentOrders?.length ?? 0,
            interests: userContext.interests,
          },
        };
      } else {
        return {
          reply:
            `⚠️ I couldn't find **Order #${specificOrderId}** in your account${name}.\n\n` +
            `It may belong to a different account, or the order number may be incorrect. Here are your recent orders instead:`,
          products: [],
          orders: userContext.recentOrders ?? [],
          followUp: ['Show all my orders', 'Help me find a product'],
          userContext: {
            name: userContext.name,
            recentOrderCount: userContext.recentOrders?.length ?? 0,
            interests: userContext.interests,
          },
        };
      }
    }

    // ── General order history ───────────────────────────────────────────────
    const orderSummary = userContext.recentOrders?.length
      ? userContext.recentOrders
          .map(
            (o) =>
              `• **Order #${o.id}**: ${o.products.join(', ')} — ₹${o.totalAmount} *(${o.status})*`,
          )
          .join('\n')
      : `You haven't placed any orders yet${name}. Browse our collection and find something you love! 🛍️`;

    const reply = userContext.recentOrders?.length
      ? `📦 Here are your recent orders${name}:\n\n${orderSummary}\n\n_Click any order for full details & invoice._`
      : orderSummary;

    return {
      reply,
      products: [],
      orders: userContext.recentOrders ?? [],
      followUp: userContext.recentOrders?.length
        ? ['Track delivery status', 'Request a return', 'Continue shopping']
        : ['Show trending products', 'Help me pick a mobile'],
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
