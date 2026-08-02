import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

// Dynamically rescue user intent when nothing else matched
function buildSmartFallbackReply(
  message: string,
  userId: number | null,
  userName: string | null,
): { reply: string; followUp: string[] } {
  const lower = message.toLowerCase();
  const name = userName ? `, ${userName}` : '';

  // TV or Smart Display query
  if (/\btv\b|smart tv|television|qled|oled|4k tv/.test(lower)) {
    return {
      reply:
        `📺 Looking for a **Smart TV**${name}? Our TV catalog is coming soon!\n\n` +
        `In the meantime I can help you with great alternatives:`,
      followUp: [
        'Show me monitors',
        'Show me premium audio / soundbars',
        'What is trending today?',
      ],
    };
  }

  // Tablet or iPad query
  if (/tablet|ipad|android tablet/.test(lower)) {
    return {
      reply:
        `📋 Looking for a **Tablet**${name}? That category is coming to our store soon!\n\n` +
        `Can I help you with something else?`,
      followUp: [
        'Show me ultrabook laptops',
        'Show me premium phones',
        'Help me pick a laptop',
      ],
    };
  }

  // Return/Refund/Exchange
  if (/return|refund|exchange|cancel|damaged|wrong item|replace/.test(lower)) {
    return {
      reply:
        `🔄 Need help with a **return or refund**${name}? Here's what you can do:\n\n` +
        `1. Go to **My Orders** to view eligible items\n` +
        `2. Click the order and tap **"Request Return"**\n` +
        `3. Our support will process it within 2-3 business days\n\n` +
        `Want me to show your recent orders?`,
      followUp: ['Show my orders', 'My recent purchases', 'Talk to support'],
    };
  }

  // Warranty / Service query
  if (/warranty|service|repair|broken|not working/.test(lower)) {
    return {
      reply:
        `🔧 For **warranty & service**${name}, please contact the brand's authorized service center or check the warranty card included with your product.\n\n` +
        `I can also show your order details if you need proof of purchase.`,
      followUp: ['Show my orders', 'Help me pick a product'],
    };
  }

  // Comparison query (caught here as last resort if compare agent missed it)
  if (/ vs | versus |compare/.test(lower)) {
    return {
      reply:
        `⚖️ Want to **compare products**${name}? Try asking me like:\n\n` +
        `> "Compare iPhone 15 vs Samsung S24"\n` +
        `> "Samsung S24 Ultra vs OnePlus 12"\n\n` +
        `Or tell me two products you're deciding between!`,
      followUp: [
        'Compare iPhone 15 vs Samsung S24',
        'Compare Sony WH-1000XM5 vs Bose QC45',
      ],
    };
  }

  // Generic logged-in fallback
  if (userId) {
    return {
      reply:
        `I'm not sure I understood that${name}, but I'm here to help! Try asking me:\n\n` +
        `• **"Help me pick a good mobile"** — guided recommendation\n` +
        `• **"Build me a gaming PC"** — custom PC builder\n` +
        `• **"My recent orders"** — order tracking\n` +
        `• **"Best laptops under ₹60,000"** — product search\n` +
        `• **"Compare iPhone 15 vs Samsung S24"** — side-by-side`,
      followUp: [
        'Help me pick a good mobile',
        'Build a Gaming PC',
        'Show Trending Products',
        'My Orders',
      ],
    };
  }

  // Generic guest fallback
  return {
    reply:
      `I'm not sure I understood that, but I'm here to help! Try asking me:\n\n` +
      `• **"Help me pick a laptop"** — guided recommendation\n` +
      `• **"Best budget phones under ₹15,000"** — product search\n` +
      `• **"What's trending today?"** — popular products\n` +
      `• **"Compare iPhone 15 vs Samsung S24"** — side-by-side\n\n` +
      `💡 **Log in** to access order tracking, personalized picks, and more!`,
    followUp: [
      'Help me pick a good mobile',
      'Show best budget laptops',
      "What's trending today?",
    ],
  };
}

export class UnknownAgent implements Agent {
  name = 'UnknownAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId, message } = ctx;

    // Use parsed.reply if AI provider returned a helpful reply
    if (parsed.reply && parsed.reply.length > 20) {
      return {
        reply: parsed.reply,
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

    const { reply, followUp } = buildSmartFallbackReply(
      message,
      userId,
      userContext.name ?? null,
    );

    return {
      reply,
      products: [],
      orders: [],
      followUp,
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
