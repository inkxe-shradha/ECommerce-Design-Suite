import { Router, Request } from "express";
import { eq, and } from "drizzle-orm";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import {
  AddToCartBody,
  UpdateCartItemParams,
  UpdateCartItemBody,
  RemoveFromCartParams,
} from "@workspace/api-zod";

const router = Router();
const COUPON_CODE = "TECH20";
const DISCOUNT_RATE = 0.2;

function getSessionId(req: Request): string {
  const cookieUser = req.cookies?.session_user_id;
  return cookieUser ? `user_${cookieUser}` : "default";
}

async function buildCartResponse(sessionId: string) {
  const cartRows = await db
    .select()
    .from(cartItemsTable)
    .where(eq(cartItemsTable.sessionId, sessionId));

  const items = await Promise.all(
    cartRows.map(async (row) => {
      const [product] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, row.productId))
        .limit(1);
      return product
        ? {
            product: {
              ...product,
              price: Number(product.price),
              originalPrice:
                product.originalPrice != null
                  ? Number(product.originalPrice)
                  : null,
              rating: Number(product.rating),
            },
            quantity: row.quantity,
          }
        : null;
    })
  );

  const validItems = items.filter(Boolean) as {
    product: { price: number; [key: string]: unknown };
    quantity: number;
  }[];

  const subtotal = validItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discount = subtotal * DISCOUNT_RATE;
  const deliveryFee = 0;
  const total = subtotal - discount + deliveryFee;

  return {
    items: validItems,
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    deliveryFee,
    total: Math.round(total * 100) / 100,
    couponApplied: validItems.length > 0 ? COUPON_CODE : null,
  };
}

router.get("/cart", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const cart = await buildCartResponse(sessionId);
  res.json(cart);
});

router.post("/cart/items", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const parsed = AddToCartBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { productId, quantity } = parsed.data;

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, productId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({
      sessionId,
      productId,
      quantity,
    });
  }

  const cart = await buildCartResponse(sessionId);
  res.json(cart);
});

router.patch("/cart/items/:productId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const rawId = Array.isArray(req.params.productId)
    ? req.params.productId[0]
    : req.params.productId;
  const paramsParsed = UpdateCartItemParams.safeParse({
    productId: parseInt(rawId, 10),
  });
  const bodyParsed = UpdateCartItemBody.safeParse(req.body);

  if (!paramsParsed.success || !bodyParsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { productId } = paramsParsed.data;
  const { quantity } = bodyParsed.data;

  if (quantity <= 0) {
    await db
      .delete(cartItemsTable)
      .where(
        and(
          eq(cartItemsTable.sessionId, sessionId),
          eq(cartItemsTable.productId, productId)
        )
      );
  } else {
    await db
      .update(cartItemsTable)
      .set({ quantity })
      .where(
        and(
          eq(cartItemsTable.sessionId, sessionId),
          eq(cartItemsTable.productId, productId)
        )
      );
  }

  const cart = await buildCartResponse(sessionId);
  res.json(cart);
});

router.delete("/cart/items/:productId", async (req, res): Promise<void> => {
  const sessionId = getSessionId(req);
  const rawId = Array.isArray(req.params.productId)
    ? req.params.productId[0]
    : req.params.productId;
  const parsed = RemoveFromCartParams.safeParse({
    productId: parseInt(rawId, 10),
  });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db
    .delete(cartItemsTable)
    .where(
      and(
        eq(cartItemsTable.sessionId, sessionId),
        eq(cartItemsTable.productId, parsed.data.productId)
      )
    );

  const cart = await buildCartResponse(sessionId);
  res.json(cart);
});

export default router;
