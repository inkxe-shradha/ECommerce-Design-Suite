import {
  db,
  usersTable,
  ordersTable,
  orderItemsTable,
  productsTable,
} from '@workspace/db';
import { eq, desc } from 'drizzle-orm';
import type { UserContext } from './types.js';

export async function loadUserContext(
  userId: number | null,
): Promise<UserContext> {
  const userContext: UserContext = {};

  if (!userId) return userContext;

  try {
    const [user] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, userId));
    if (user) userContext.name = user.name.split(' ')[0];

    const orderMap: Record<number, any> = {};
    const categorySet = new Set<string>();
    const brandSet = new Set<string>();
    const purchasedIds = new Set<number>();

    // Also fetch product IDs and brands for recommendation engine
    const detailedOrders = await db
      .select({
        orderId: ordersTable.id,
        totalAmount: ordersTable.totalAmount,
        status: ordersTable.status,
        createdAt: ordersTable.createdAt,
        shippingAddress: ordersTable.shippingAddress,
        productId: productsTable.id,
        productName: productsTable.name,
        category: productsTable.category,
        brand: productsTable.brand,
      })
      .from(ordersTable)
      .innerJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
      .innerJoin(productsTable, eq(productsTable.id, orderItemsTable.productId))
      .where(eq(ordersTable.userId, userId))
      .orderBy(desc(ordersTable.createdAt))
      .limit(20);

    detailedOrders.forEach((row) => {
      categorySet.add(row.category);
      brandSet.add(row.brand);
      purchasedIds.add(row.productId);
      if (!orderMap[row.orderId]) {
        orderMap[row.orderId] = {
          id: row.orderId,
          totalAmount: row.totalAmount,
          status: row.status,
          createdAt: row.createdAt,
          address: row.shippingAddress,
          products: [],
        };
        userContext.lastAddress =
          userContext.lastAddress ?? row.shippingAddress;
      }
      orderMap[row.orderId].products.push(row.productName);
    });
    userContext.recentOrders = Object.values(orderMap).slice(0, 3);
    userContext.interests = Array.from(categorySet);
    userContext.purchasedProductIds = Array.from(purchasedIds);
    userContext.purchasedBrands = Array.from(brandSet);
  } catch (e) {
    console.warn('Could not fetch user context:', e);
  }

  return userContext;
}
