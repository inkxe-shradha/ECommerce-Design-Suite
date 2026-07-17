import { Router } from "express";
import { eq, and, or } from "drizzle-orm";
import { db, productsTable } from "@workspace/db";
import {
  ListProductsQueryParams,
  GetProductParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/products", async (req, res): Promise<void> => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { category, featured, limit } = parsed.data;
  const conditions = [];
  if (category) conditions.push(eq(productsTable.category, category));
  if (featured === true) conditions.push(eq(productsTable.isFeatured, true));

  const rows = await db
    .select()
    .from(productsTable)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .limit(limit ?? 50);

  res.json(
    rows.map((r) => ({
      ...r,
      price: Number(r.price),
      originalPrice: r.originalPrice != null ? Number(r.originalPrice) : null,
      rating: Number(r.rating),
    }))
  );
});

router.get("/products/deals", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.isDeal, true))
    .limit(8);

  res.json(
    rows.map((r) => ({
      ...r,
      price: Number(r.price),
      originalPrice: r.originalPrice != null ? Number(r.originalPrice) : null,
      rating: Number(r.rating),
    }))
  );
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProductParams.safeParse({ id: parseInt(rawId, 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [product] = await db
    .select()
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.id))
    .limit(1);

  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  res.json({
    ...product,
    price: Number(product.price),
    originalPrice: product.originalPrice != null ? Number(product.originalPrice) : null,
    rating: Number(product.rating),
  });
});

export default router;
