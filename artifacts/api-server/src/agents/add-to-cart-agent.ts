import { db, cartItemsTable, productsTable } from '@workspace/db';
import { eq, and, desc, ilike } from 'drizzle-orm';
import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

export class AddToCartAgent implements Agent {
  name = 'AddToCartAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userId, userContext, history, message } = ctx;
    const lower = message.toLowerCase();

    if (!userId) {
      return {
        reply: `🔐 You need to **log in** before I can add items to your cart. Once logged in, just say "add to cart" and I'll handle it!`,
        products: [],
        orders: [],
        requiresLogin: true,
        followUp: ['Show me products instead'],
        userContext: null,
      };
    }

    const sessionId = `user_${userId}`;

    // Detect "add all to cart" (bundle add from previous recommendations)
    const isAddAll =
      lower.includes('add all') ||
      lower.includes('add everything') ||
      lower.includes('add bundle');

    if (isAddAll) {
      return this.addAllFromHistory(sessionId, history, userContext, userId);
    }

    // Single product add
    const product = await this.findBestProductFromContext(history);

    if (!product) {
      return {
        reply: `I don't see any products from our recent conversation to add. Let me help you find something first!`,
        products: [],
        orders: [],
        followUp: ['Show me mobiles', 'Best laptops', 'Top picks for me'],
        userContext: {
          name: userContext.name,
          recentOrderCount: userContext.recentOrders?.length ?? 0,
          interests: userContext.interests,
        },
      };
    }

    try {
      // Check if already in cart
      const existing = await db
        .select()
        .from(cartItemsTable)
        .where(
          and(
            eq(cartItemsTable.sessionId, sessionId),
            eq(cartItemsTable.productId, product.id),
          ),
        );

      if (existing.length > 0) {
        return {
          reply: `**${product.name}** is already in your cart! 🛒\n\nWant me to find more options or help you checkout?`,
          products: [product],
          orders: [],
          followUp: [
            'Show similar products',
            'Show me something else',
            'What else do you recommend?',
          ],
          userContext: {
            name: userContext.name,
            recentOrderCount: userContext.recentOrders?.length ?? 0,
            interests: userContext.interests,
          },
        };
      }

      await db.insert(cartItemsTable).values({
        sessionId,
        productId: product.id,
        quantity: 1,
      });

      return {
        reply: `✅ Added **${product.name}** (₹${Math.round(parseFloat(product.price)).toLocaleString()}) to your cart!\n\nAnything else you'd like to add?`,
        products: [product],
        orders: [],
        followUp: [
          'Show similar products',
          `More ${product.category}`,
          'What else do you recommend?',
          'Show me accessories',
        ],
        userContext: {
          name: userContext.name,
          recentOrderCount: userContext.recentOrders?.length ?? 0,
          interests: userContext.interests,
        },
      };
    } catch (error) {
      console.error('AddToCart error:', error);
      return {
        reply: `Sorry, I couldn't add that to your cart right now. Please try again!`,
        products: [product],
        orders: [],
        followUp: ['Try again', 'Show me other products'],
        userContext: {
          name: userContext.name,
          recentOrderCount: userContext.recentOrders?.length ?? 0,
          interests: userContext.interests,
        },
      };
    }
  }

  /**
   * Add all products mentioned in recent conversation (bundle add).
   * Looks for product names in assistant messages and adds them all to cart.
   */
  private async addAllFromHistory(
    sessionId: string,
    history: Array<{ role: string; content: string }> | undefined,
    userContext: any,
    userId: number,
  ): Promise<AgentResponse> {
    if (!history?.length) {
      return {
        reply: `I don't see any bundle or products to add. Let me help you find something first!`,
        products: [],
        orders: [],
        followUp: [
          "I'm a student, suggest a setup",
          'Show me laptops',
          'Best deals today',
        ],
        userContext: {
          name: userContext.name,
          recentOrderCount: userContext.recentOrders?.length ?? 0,
          interests: userContext.interests,
        },
      };
    }

    // Find product names mentioned in recent AI messages (from bundle recommendations)
    const recentAiMessages = history
      .filter((h) => h.role === 'assistant')
      .slice(-3);
    const allAiText = recentAiMessages.map((m) => m.content).join(' ');

    // Extract product names from numbered list patterns like "1. **Product Name** —"
    const productNameMatches = allAiText.match(/\*\*([^*]+)\*\*/g);
    if (!productNameMatches || productNameMatches.length === 0) {
      return {
        reply: `I couldn't identify the products to add. Could you tell me which items you'd like?`,
        products: [],
        orders: [],
        followUp: ['Show me the bundle again', 'Recommend something new'],
        userContext: {
          name: userContext.name,
          recentOrderCount: userContext.recentOrders?.length ?? 0,
          interests: userContext.interests,
        },
      };
    }

    // Clean up product names
    const productNames = productNameMatches
      .map((m) => m.replace(/\*\*/g, '').trim())
      .filter(
        (n) =>
          n.length > 3 &&
          !n.includes('Bundle') &&
          !n.includes('Total') &&
          !n.includes('Price'),
      );

    const addedProducts: any[] = [];
    const alreadyInCart: string[] = [];
    const notFound: string[] = [];

    for (const productName of productNames.slice(0, 6)) {
      // Find the product in DB
      const [product] = await db
        .select()
        .from(productsTable)
        .where(ilike(productsTable.name, `%${productName.substring(0, 30)}%`))
        .limit(1);

      if (!product) {
        notFound.push(productName);
        continue;
      }

      // Check if already in cart
      const existing = await db
        .select()
        .from(cartItemsTable)
        .where(
          and(
            eq(cartItemsTable.sessionId, sessionId),
            eq(cartItemsTable.productId, product.id),
          ),
        );

      if (existing.length > 0) {
        alreadyInCart.push(product.name);
        continue;
      }

      await db.insert(cartItemsTable).values({
        sessionId,
        productId: product.id,
        quantity: 1,
      });
      addedProducts.push(product);
    }

    // Build response
    let reply = '';
    if (addedProducts.length > 0) {
      const total = addedProducts.reduce(
        (sum, p) => sum + parseFloat(p.price),
        0,
      );
      reply += `✅ Added **${addedProducts.length} items** to your cart!\n\n`;
      addedProducts.forEach((p) => {
        reply += `• ${p.name} — ₹${Math.round(parseFloat(p.price)).toLocaleString('en-IN')}\n`;
      });
      reply += `\n🛒 **Cart total for these: ₹${Math.round(total).toLocaleString('en-IN')}**`;
    }
    if (alreadyInCart.length > 0) {
      reply += `\n\n📌 Already in cart: ${alreadyInCart.join(', ')}`;
    }
    if (addedProducts.length === 0 && alreadyInCart.length > 0) {
      reply = `All those items are already in your cart! 🛒 Ready to checkout?`;
    }

    return {
      reply,
      products: addedProducts,
      orders: [],
      followUp: [
        'Go to checkout',
        'Show me more accessories',
        'What else do I need?',
      ],
      userContext: {
        name: userContext.name,
        recentOrderCount: userContext.recentOrders?.length ?? 0,
        interests: userContext.interests,
      },
    };
  }

  private async findBestProductFromContext(
    history?: Array<{ role: string; content: string }>,
  ): Promise<any | null> {
    if (!history?.length) return null;

    // Detect category from conversation history
    let category: string | undefined;
    const allMessages = history.slice(-6);

    for (const msg of allMessages) {
      const l = msg.content.toLowerCase();
      if (
        l.includes('mobile') ||
        l.includes('phone') ||
        l.includes('samsung') ||
        l.includes('iphone') ||
        l.includes('galaxy')
      )
        category = 'Mobiles';
      else if (
        l.includes('laptop') ||
        l.includes('macbook') ||
        l.includes('notebook')
      )
        category = category || 'Laptops';
      else if (
        l.includes('headphone') ||
        l.includes('earbuds') ||
        l.includes('audio') ||
        l.includes('speaker')
      )
        category = category || 'Audio';
      else if (l.includes('camera') || l.includes('dslr'))
        category = category || 'Cameras';
      else if (
        l.includes('keyboard') ||
        l.includes('mouse') ||
        l.includes('accessori')
      )
        category = category || 'Accessories';
    }

    // Get the top-rated in-stock product in that category
    const conditions = [eq(productsTable.inStock, true)];
    if (category) conditions.push(eq(productsTable.category, category));

    const [product] = await db
      .select()
      .from(productsTable)
      .where(and(...conditions))
      .orderBy(desc(productsTable.rating))
      .limit(1);

    return product || null;
  }
}
