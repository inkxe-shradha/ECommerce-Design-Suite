import { Router } from "express";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";

export const ordersRouter = Router();

ordersRouter.get("/orders", async (req, res) => {
  const userIdStr = req.cookies?.session_user_id;
  if (!userIdStr) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = parseInt(userIdStr, 10);

  try {
    const userOrders = await db
      .select()
      .from(ordersTable)
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt));

    // Map to API response format
    const formattedOrders = userOrders.map((o) => ({
      id: o.id,
      totalAmount: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
      shippingAddress: o.shippingAddress,
      paymentDetails: o.paymentDetails,
    }));

    return res.status(200).json(formattedOrders);
  } catch (error) {
    console.error("Orders error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
