import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

/**
 * couponsTable — source of truth for all coupon campaigns.
 * Never mutate a row after redemptions exist; disable instead.
 */
export const couponsTable = pgTable(
  'coupons',
  {
    id: serial('id').primaryKey(),
    /** Unique, case-insensitive code customers enter at cart (stored uppercase) */
    code: text('code').notNull().unique(),
    campaignName: text('campaign_name').notNull(),
    description: text('description'),

    // ── Lifecycle ──────────────────────────────────────────────────────
    isActive: boolean('is_active').notNull().default(true),
    startsAt: timestamp('starts_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),

    // ── Discount definition ────────────────────────────────────────────
    /** 'percent' = percentOff % off eligible subtotal; 'fixed' = flat currency off */
    discountType: text('discount_type').notNull(), // 'percent' | 'fixed'
    discountValue: numeric('discount_value', {
      precision: 10,
      scale: 2,
    }).notNull(),
    /** For 'percent' coupons: max INR the coupon can reduce (null = uncapped) */
    maxDiscountCap: numeric('max_discount_cap', { precision: 10, scale: 2 }),

    // ── Eligibility thresholds ─────────────────────────────────────────
    /** Minimum eligible subtotal before this coupon activates */
    minEligibleSubtotal: numeric('min_eligible_subtotal', {
      precision: 10,
      scale: 2,
    }),

    // ── Usage limits ───────────────────────────────────────────────────
    /** Total redemptions allowed across all users (null = unlimited) */
    globalUseLimit: integer('global_use_limit'),
    /** How many times a single user may redeem (null = unlimited) */
    perUserUseLimit: integer('per_user_use_limit'),

    // ── Auto-apply & priority ──────────────────────────────────────────
    /** If true the pricing engine considers this without user entering the code */
    autoApply: boolean('auto_apply').notNull().default(false),
    /** Higher number = selected first when multiple eligible auto-apply coupons exist */
    priority: integer('priority').notNull().default(0),
    /** Currently always false — stacking is not supported in v1 */
    stackable: boolean('stackable').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('coupons_code_unique_idx').on(t.code),
    index('coupons_active_idx').on(t.isActive, t.startsAt, t.expiresAt),
    index('coupons_auto_apply_idx').on(t.autoApply, t.isActive),
  ],
);

export const insertCouponSchema = createInsertSchema(couponsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof couponsTable.$inferSelect;

// ─── Coupon Rules ────────────────────────────────────────────────────────────

/**
 * couponRulesTable — normalized eligibility rules for coupons.
 *
 * Rows with ruleType 'include' restrict the coupon to those items.
 * Rows with ruleType 'exclude' block those items even if the coupon
 * would otherwise apply.
 *
 * A coupon with NO include rules applies to all products
 * (subject to other constraints).
 *
 * ruleType examples:
 *   { ruleType: 'include', scopeType: 'department', scopeValue: 'Gaming' }
 *   { ruleType: 'include', scopeType: 'componentType', scopeValue: 'Processor' }
 *   { ruleType: 'include', scopeType: 'category', scopeValue: 'Laptops' }
 *   { ruleType: 'include', scopeType: 'product', scopeValue: '42' }
 *   { ruleType: 'exclude', scopeType: 'category', scopeValue: 'Cameras' }
 */
export const couponRulesTable = pgTable(
  'coupon_rules',
  {
    id: serial('id').primaryKey(),
    couponId: integer('coupon_id')
      .notNull()
      .references(() => couponsTable.id, { onDelete: 'cascade' }),
    /** 'include' or 'exclude' */
    ruleType: text('rule_type').notNull(),
    /** 'department' | 'componentType' | 'category' | 'product' */
    scopeType: text('scope_type').notNull(),
    /** The actual value: department name, componentType name, category name, or product id string */
    scopeValue: text('scope_value').notNull(),
  },
  (t) => [
    index('coupon_rules_coupon_idx').on(t.couponId),
    index('coupon_rules_scope_idx').on(t.scopeType, t.scopeValue),
  ],
);

export const insertCouponRuleSchema = createInsertSchema(couponRulesTable).omit(
  { id: true },
);
export type InsertCouponRule = z.infer<typeof insertCouponRuleSchema>;
export type CouponRule = typeof couponRulesTable.$inferSelect;
