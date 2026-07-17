import { Router } from "express";
import { ne, eq } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import { GetPdpRecommendationsParams } from "@workspace/api-zod";

const router = Router();

function formatProduct(r: typeof productsTable.$inferSelect) {
  return {
    ...r,
    price: Number(r.price),
    originalPrice: r.originalPrice != null ? Number(r.originalPrice) : null,
    rating: Number(r.rating),
  };
}

function makeWidget(
  type: "content_based" | "collaborative" | "hybrid",
  title: string,
  subtitle: string,
  products: typeof productsTable.$inferSelect[],
  reasons: string[]
) {
  return {
    type,
    title,
    subtitle,
    products: products.map((p, i) => ({
      product: formatProduct(p),
      reason: reasons[i] ?? "Recommended for you",
    })),
  };
}

router.get("/recommendations/homepage", async (req, res): Promise<void> => {
  const allProducts = await db.select().from(productsTable).limit(30);

  const laptopsAndAccessories = allProducts.filter((p) =>
    ["Laptops", "Accessories"].includes(p.category)
  );
  const trending = allProducts.filter((p) =>
    ["Mobiles", "Audio", "Accessories"].includes(p.category)
  );
  const hybrid = allProducts.filter((p) => p.isFeatured);

  res.json({
    contentBased: makeWidget(
      "content_based",
      "Based on Your Interests",
      "Electronics matching your browsing history",
      laptopsAndAccessories.slice(0, 5),
      [
        "Similar to your browsing",
        "Matches Laptops",
        "Frequently viewed",
        "Accessory match",
        "Similar to your browsing",
      ]
    ),
    collaborative: makeWidget(
      "collaborative",
      "Trending Among Similar Shoppers",
      "What people like you are buying this week",
      trending.slice(0, 4),
      [
        "Trending in your segment",
        "Popular this week",
        "High demand — only 4 left",
        "People like you bought this",
      ]
    ),
    hybrid: makeWidget(
      "hybrid",
      "Recommended For You",
      "Curated mix of trending picks and your preferences",
      hybrid.slice(0, 4),
      [
        "Editorial pick + your history",
        "Trending + personalized",
        "Top rated for your profile",
        "Curated for Rahul",
      ]
    ),
  });
});

router.get("/recommendations/pdp/:productId", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.productId)
    ? req.params.productId[0]
    : req.params.productId;
  const parsed = GetPdpRecommendationsParams.safeParse({
    productId: parseInt(rawId, 10),
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const allProducts = await db
    .select()
    .from(productsTable)
    .where(ne(productsTable.id, parsed.data.productId))
    .limit(20);

  const accessories = allProducts.filter((p) =>
    ["Accessories", "Audio"].includes(p.category)
  );
  const similar = allProducts.filter((p) => p.category === "Laptops");
  const featured = allProducts.filter((p) => p.isFeatured);

  res.json({
    frequentlyBoughtTogether: makeWidget(
      "collaborative",
      "Frequently Bought Together",
      "Customers who bought this also bought",
      accessories.slice(0, 3),
      [
        "Often bought together",
        "Popular add-on",
        "Frequently paired with this",
      ]
    ),
    contentBased: makeWidget(
      "content_based",
      "Complete Your Setup",
      "Accessories matching this product's specs and color",
      accessories.slice(0, 4),
      [
        "USB-C compatible",
        "Color matched",
        "Spec compatible",
        "Frequently used together",
      ]
    ),
    hybrid: makeWidget(
      "hybrid",
      "Rahul's AI Bundle Suggestion",
      "Upgrading for work? Here's your kit",
      featured.slice(0, 3),
      [
        "Editorial pick + your history",
        "Trending + your preferences",
        "Curated for your work style",
      ]
    ),
  });
});

router.get("/recommendations/cart", async (req, res): Promise<void> => {
  const allProducts = await db.select().from(productsTable).limit(20);

  const crossSell = allProducts.filter((p) =>
    ["Accessories", "Audio"].includes(p.category)
  );
  const collaborative = allProducts.filter((p) => p.category === "Accessories");
  const hybrid = allProducts.filter((p) => p.isFeatured);

  res.json({
    crossSell: makeWidget(
      "content_based",
      "Complete Your Setup",
      "You might also need these with your cart",
      crossSell.slice(0, 4),
      [
        "Pairs with Dell XPS 15",
        "Compatible accessory",
        "Great with your laptop",
        "Often added to similar carts",
      ]
    ),
    collaborative: makeWidget(
      "collaborative",
      "Frequently Bought Together",
      "Shoppers with a similar cart also bought these",
      collaborative.slice(0, 3),
      [
        "Trending in your segment",
        "Popular with similar carts",
        "Limited stock — popular item",
      ]
    ),
    hybrid: makeWidget(
      "hybrid",
      "Rahul's Personal AI Picks",
      "Based on your browsing and purchase history",
      hybrid.slice(0, 3),
      ["You viewed this", "Trending in your segment", "Editorial pick"]
    ),
  });
});

export default router;
