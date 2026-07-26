import { Router } from "express";
import { db, ordersTable, orderItemsTable, cartItemsTable, productsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export const checkoutRouter = Router();

checkoutRouter.post("/checkout", async (req, res) => {
  const userIdStr = req.cookies?.session_user_id;
  if (!userIdStr) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = parseInt(userIdStr, 10);
  const sessionId = `user_${userId}`;

  const { address, payment } = req.body;
  if (!address || !payment) {
    return res.status(400).json({ message: "Address and payment details are required" });
  }

  try {
    // 1. Get cart items for the user
    const userCartItems = await db
      .select({
        id: cartItemsTable.id,
        productId: cartItemsTable.productId,
        quantity: cartItemsTable.quantity,
        price: productsTable.price,
      })
      .from(cartItemsTable)
      .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .where(eq(cartItemsTable.sessionId, sessionId));

    if (userCartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 2. Calculate total amount
    const totalAmount = userCartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    // 3. Create the Order
    const [newOrder] = await db.insert(ordersTable).values({
      userId,
      totalAmount: totalAmount.toString(),
      status: "Completed", // Dummy payment success immediately
      shippingAddress: address,
      paymentDetails: {
        cardNumber: `**** **** **** ${payment.cardNumber.slice(-4)}`, // mask dummy card
      },
    }).returning();

    // 4. Create Order Items
    for (const item of userCartItems) {
      await db.insert(orderItemsTable).values({
        orderId: newOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      });
    }

    // 5. Clear the user's cart
    await db.delete(cartItemsTable).where(eq(cartItemsTable.sessionId, sessionId));

    return res.status(200).json({ message: "Order successful", orderId: newOrder.id });
  } catch (error) {
    console.error("Checkout error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
