import {
  pgTable,
  serial,
  integer,
  numeric,
  text,
  timestamp,
  unique,
  index,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { couponsTable } from './coupons';
import { ordersTable } from './orders';
import { usersTable } from './users';

/**
 * couponRedemptionsTable — immutable audit log and usage counter.
 *
 * A row is inserted inside the checkout transaction, after the order is
 * created.  Checking global_use_limit and per_user_use_limit must be done
 * with a SELECT FOR UPDATE on the coupon row to avoid races.
 */
export const couponRedemptionsTable = pgTable(
  'coupon_redemptions',
  {
    id: serial('id').primaryKey(),
    couponId: integer('coupon_id')
      .notNull()
      .references(() => couponsTable.id),
    orderId: integer('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    /** Null for anonymous checkout (guest order) */
    userId: integer('user_id').references(() => usersTable.id),
    /** Snapshot of the code at redemption time (for audit even if coupon.code changes) */
    codeSnapshot: text('code_snapshot').notNull(),
    /** Coupon discount amount that was actually applied */
    discountApplied: numeric('discount_applied', {
      precision: 10,
      scale: 2,
    }).notNull(),
    /** Eligible cart subtotal that the coupon was applied against */
    eligibleSubtotal: numeric('eligible_subtotal', {
      precision: 10,
      scale: 2,
    }).notNull(),
    redeemedAt: timestamp('redeemed_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    /** One redemption per order */
    unique('coupon_redemptions_order_unique').on(t.orderId),
    index('coupon_redemptions_coupon_idx').on(t.couponId),
    index('coupon_redemptions_user_idx').on(t.userId),
  ],
);

export const insertCouponRedemptionSchema = createInsertSchema(
  couponRedemptionsTable,
).omit({
  id: true,
  redeemedAt: true,
});
export type InsertCouponRedemption = z.infer<
  typeof insertCouponRedemptionSchema
>;
export type CouponRedemption = typeof couponRedemptionsTable.$inferSelect;
