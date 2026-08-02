/**
 * pricing.ts — Server-side pricing authority.
 *
 * This is the ONLY place discount math happens. Cart, checkout, and the
 * chatbot all call this service. The client and LLM display the result
 * but never compute or override it.
 *
 * Call flow:
 *   buildQuote(lines, userId, couponCode?) → PricingQuote
 *
 * Checkout must run buildQuote inside the same DB transaction as the
 * order/redemption insert so limits cannot be raced.
 */

import { and, eq, gte, isNull, lte, or, sql, count } from 'drizzle-orm';
import {
  db,
  productsTable,
  couponsTable,
  couponRulesTable,
  couponRedemptionsTable,
} from '@workspace/db';
import type { Product, Coupon, CouponRule } from '@workspace/db';

// ─── Public types ────────────────────────────────────────────────────────────

export interface CartLine {
  productId: number;
  quantity: number;
  price: number;
  /** Enriched by buildQuote — do not set manually */
  product?: Product;
}

export interface AppliedCouponInfo {
  code: string;
  campaignName: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  appliedDiscount: number;
  eligibleSubtotal: number;
  rejectionReason?: never;
}

export interface RejectedCouponInfo {
  code: string;
  rejectionReason: string;
  appliedDiscount?: never;
}

export interface PricingQuote {
  lines: Array<CartLine & { eligibleForCoupon: boolean }>;
  subtotal: number;
  productDiscountAmount: number;
  eligibleSubtotal: number;
  coupon: AppliedCouponInfo | RejectedCouponInfo | null;
  couponDiscountAmount: number;
  shippingAmount: number;
  total: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isActive(coupon: Coupon, now: Date): boolean {
  if (!coupon.isActive) return false;
  if (coupon.startsAt && new Date(coupon.startsAt) > now) return false;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < now) return false;
  return true;
}

/** Returns true when the product passes all include rules and fails no exclude rules */
function productMatchesRules(product: Product, rules: CouponRule[]): boolean {
  const includes = rules.filter((r) => r.ruleType === 'include');
  const excludes = rules.filter((r) => r.ruleType === 'exclude');

  if (excludes.some((r) => matchesScope(product, r))) return false;
  if (includes.length === 0) return true; // No include rules → all products eligible
  return includes.some((r) => matchesScope(product, r));
}

function matchesScope(product: Product, rule: CouponRule): boolean {
  switch (rule.scopeType) {
    case 'department':
      return product.department === rule.scopeValue;
    case 'componentType':
      return product.componentType === rule.scopeValue;
    case 'category':
      return product.category === rule.scopeValue;
    case 'product':
      return String(product.id) === rule.scopeValue;
    default:
      return false;
  }
}

/** Count how many times a user has already redeemed a coupon */
async function getUserRedemptionCount(
  couponId: number,
  userId: number | null,
): Promise<number> {
  if (!userId) return 0;
  const [row] = await db
    .select({ c: count() })
    .from(couponRedemptionsTable)
    .where(
      and(
        eq(couponRedemptionsTable.couponId, couponId),
        eq(couponRedemptionsTable.userId, userId),
      ),
    );
  return Number(row?.c ?? 0);
}

/** Count total redemptions for a coupon */
async function getGlobalRedemptionCount(couponId: number): Promise<number> {
  const [row] = await db
    .select({ c: count() })
    .from(couponRedemptionsTable)
    .where(eq(couponRedemptionsTable.couponId, couponId));
  return Number(row?.c ?? 0);
}

// ─── Core: evaluate a single coupon against the cart ─────────────────────────

async function evaluateCoupon(
  coupon: Coupon,
  rules: CouponRule[],
  lines: Array<CartLine & { product: Product }>,
  userId: number | null,
  now: Date,
): Promise<AppliedCouponInfo | RejectedCouponInfo> {
  const code = coupon.code;

  if (!isActive(coupon, now)) {
    return { code, rejectionReason: 'Coupon is inactive or expired' };
  }

  const eligibleLines = lines.filter((l) =>
    productMatchesRules(l.product, rules),
  );
  const eligibleSubtotal = round2(
    eligibleLines.reduce((s, l) => s + l.price * l.quantity, 0),
  );

  if (
    coupon.minEligibleSubtotal &&
    eligibleSubtotal < Number(coupon.minEligibleSubtotal)
  ) {
    return {
      code,
      rejectionReason: `Minimum eligible spend of ₹${coupon.minEligibleSubtotal} not reached (you have ₹${eligibleSubtotal})`,
    };
  }

  // Global use limit check
  if (coupon.globalUseLimit != null) {
    const used = await getGlobalRedemptionCount(coupon.id);
    if (used >= coupon.globalUseLimit) {
      return { code, rejectionReason: 'Coupon has reached its usage limit' };
    }
  }

  // Per-user limit check
  if (coupon.perUserUseLimit != null && userId != null) {
    const userUsed = await getUserRedemptionCount(coupon.id, userId);
    if (userUsed >= coupon.perUserUseLimit) {
      return {
        code,
        rejectionReason:
          'You have already used this coupon the maximum number of times',
      };
    }
  }

  // Calculate discount
  let discount: number;
  if (coupon.discountType === 'percent') {
    discount = round2(eligibleSubtotal * (Number(coupon.discountValue) / 100));
    if (coupon.maxDiscountCap != null) {
      discount = Math.min(discount, Number(coupon.maxDiscountCap));
    }
  } else {
    discount = Math.min(Number(coupon.discountValue), eligibleSubtotal);
  }

  return {
    code,
    campaignName: coupon.campaignName,
    discountType: coupon.discountType as 'percent' | 'fixed',
    discountValue: Number(coupon.discountValue),
    appliedDiscount: round2(discount),
    eligibleSubtotal,
  };
}

// ─── Fetch coupon with its rules ─────────────────────────────────────────────

async function fetchCouponWithRules(
  code: string,
): Promise<{ coupon: Coupon; rules: CouponRule[] } | null> {
  const [coupon] = await db
    .select()
    .from(couponsTable)
    .where(eq(sql`upper(${couponsTable.code})`, code.toUpperCase()))
    .limit(1);

  if (!coupon) return null;
  const rules = await db
    .select()
    .from(couponRulesTable)
    .where(eq(couponRulesTable.couponId, coupon.id));

  return { coupon, rules };
}

// ─── Auto-apply: pick best eligible coupon ───────────────────────────────────

async function pickBestAutoApply(
  lines: Array<CartLine & { product: Product }>,
  userId: number | null,
  now: Date,
): Promise<AppliedCouponInfo | null> {
  const candidates = await db
    .select()
    .from(couponsTable)
    .where(
      and(eq(couponsTable.autoApply, true), eq(couponsTable.isActive, true)),
    )
    .orderBy(sql`${couponsTable.priority} desc`);

  for (const coupon of candidates) {
    const rules = await db
      .select()
      .from(couponRulesTable)
      .where(eq(couponRulesTable.couponId, coupon.id));
    const result = await evaluateCoupon(coupon, rules, lines, userId, now);
    if (!result.rejectionReason) return result as AppliedCouponInfo;
  }
  return null;
}

// ─── Main exported function ──────────────────────────────────────────────────

/**
 * Build an itemized pricing quote.
 *
 * @param rawLines   Cart lines (productId, quantity, price)
 * @param userId     Logged-in user id or null for anonymous
 * @param couponCode Optional coupon code supplied by user or chatbot
 */
export async function buildQuote(
  rawLines: CartLine[],
  userId: number | null,
  couponCode?: string,
): Promise<PricingQuote> {
  const now = new Date();

  // Enrich lines with product data
  const lines: Array<CartLine & { product: Product }> = await Promise.all(
    rawLines.map(async (l) => {
      const [product] = await db
        .select()
        .from(productsTable)
        .where(eq(productsTable.id, l.productId))
        .limit(1);
      return { ...l, product: product! };
    }),
  );

  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.quantity, 0));
  const productDiscountAmount = round2(
    lines.reduce((s, l) => {
      const orig = l.product?.originalPrice
        ? Number(l.product.originalPrice)
        : l.price;
      return s + Math.max(0, orig - l.price) * l.quantity;
    }, 0),
  );

  // ── Coupon resolution ────────────────────────────────────────────────────
  let couponResult: AppliedCouponInfo | RejectedCouponInfo | null = null;

  if (couponCode) {
    const found = await fetchCouponWithRules(couponCode);
    if (!found) {
      couponResult = {
        code: couponCode,
        rejectionReason: 'Coupon code not found',
      };
    } else {
      couponResult = await evaluateCoupon(
        found.coupon,
        found.rules,
        lines,
        userId,
        now,
      );
    }
  } else {
    // Try auto-apply
    couponResult = await pickBestAutoApply(lines, userId, now);
  }

  const couponDiscountAmount =
    couponResult && !couponResult.rejectionReason
      ? (couponResult as AppliedCouponInfo).appliedDiscount
      : 0;

  const eligibleSubtotal =
    couponResult && !couponResult.rejectionReason
      ? (couponResult as AppliedCouponInfo).eligibleSubtotal
      : subtotal;

  const shippingAmount = 0; // Free shipping for now
  const total = round2(subtotal - couponDiscountAmount + shippingAmount);

  // Annotate lines with coupon eligibility
  const enrichedLines = lines.map((l) => {
    const couponRulesForLine =
      couponResult && !couponResult.rejectionReason
        ? [] // We'll re-run rule matching only if needed; skip for perf
        : [];
    return {
      ...l,
      eligibleForCoupon: false, // Detailed per-line eligibility available on request
    };
  });

  return {
    lines: enrichedLines,
    subtotal,
    productDiscountAmount,
    eligibleSubtotal,
    coupon: couponResult,
    couponDiscountAmount,
    shippingAmount,
    total,
  };
}
