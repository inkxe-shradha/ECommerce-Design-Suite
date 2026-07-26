import { db, productsTable } from '@workspace/db';
import { or, eq, desc, notInArray, and, inArray } from 'drizzle-orm';
import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

export class TopPicksAgent implements Agent {
  name = 'TopPicksAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId } = ctx;
    const name = userContext.name ? `, ${userContext.name}` : '';
    const hasOrderHistory =
      userContext.purchasedProductIds &&
      userContext.purchasedProductIds.length > 0;

    let products: any[];
    let reply: string;

    if (hasOrderHistory) {
      // ── User has order history → recommend related products they haven't bought ──
      const boughtIds = userContext.purchasedProductIds!;
      const categories = userContext.interests ?? [];
      const brands = userContext.purchasedBrands ?? [];

      // Priority 1: Same categories + same brands (but not already purchased)
      const brandMatches = brands.length
        ? await db
            .select()
            .from(productsTable)
            .where(
              and(
                notInArray(productsTable.id, boughtIds),
                eq(productsTable.inStock, true),
                or(...brands.map((b) => eq(productsTable.brand, b))),
              ),
            )
            .orderBy(desc(productsTable.rating))
            .limit(3)
        : [];

      // Priority 2: Same categories, different brands (discover new brands)
      const catConditions = categories.map((c) =>
        eq(productsTable.category, c),
      );
      const alreadyShown = [...boughtIds, ...brandMatches.map((p) => p.id)];
      const categoryMatches = catConditions.length
        ? await db
            .select()
            .from(productsTable)
            .where(
              and(
                notInArray(
                  productsTable.id,
                  alreadyShown.length ? alreadyShown : [0],
                ),
                eq(productsTable.inStock, true),
                or(...catConditions),
              ),
            )
            .orderBy(desc(productsTable.rating))
            .limit(3)
        : [];

      // Merge: brand-match first, then category-match, cap at 5
      products = [...brandMatches, ...categoryMatches].slice(0, 5);

      // If we still have fewer than 3, fill with top-rated stock
      if (products.length < 3) {
        const excludeIds = [...boughtIds, ...products.map((p) => p.id)];
        const filler = await db
          .select()
          .from(productsTable)
          .where(
            and(
              notInArray(
                productsTable.id,
                excludeIds.length ? excludeIds : [0],
              ),
              eq(productsTable.inStock, true),
            ),
          )
          .orderBy(desc(productsTable.rating))
          .limit(5 - products.length);
        products = [...products, ...filler];
      }

      const brandList = brands.slice(0, 3).join(', ');
      const catList = categories.slice(0, 3).join(', ');
      reply =
        parsed.reply ||
        `Based on your purchase history${name}, I picked these for you! 🎯\nYou seem to love **${brandList}** in **${catList}** — here are similar products you haven't tried yet:`;
    } else if (userContext.interests?.length) {
      // ── Logged in but no orders, has browsing interests ──
      const interestConditions = userContext.interests.map((cat) =>
        eq(productsTable.category, cat),
      );
      products = await db
        .select()
        .from(productsTable)
        .where(and(eq(productsTable.inStock, true), or(...interestConditions)))
        .orderBy(desc(productsTable.rating))
        .limit(5);

      reply =
        parsed.reply ||
        `Based on your interest in **${userContext.interests.join(', ')}**, here are my top picks for you${name}:`;
    } else {
      // ── Guest or no data → default popular picks ──
      products = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.inStock, true))
        .orderBy(desc(productsTable.rating))
        .limit(5);

      const loginHint = !userId
        ? `\n\n💡 **Log in** to get picks personalised to your purchase history!`
        : `\n\nStart shopping and I'll learn your taste for better recommendations next time!`;
      reply =
        parsed.reply ||
        `Here are today's top-rated picks for you${name}:${loginHint}`;
    }

    // Generate follow-up suggestions
    const followUp: string[] = [];
    if (products.length > 0) {
      followUp.push(`Add the top pick to cart`);
      const categories = [...new Set(products.map((p) => p.category))];
      if (categories.length > 0) followUp.push(`More ${categories[0]}`);
      followUp.push(`Show me budget options`);
      if (hasOrderHistory) followUp.push(`Something new I haven't tried`);
    }

    return {
      reply,
      products,
      orders: [],
      followUp: followUp.slice(0, 4),
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
