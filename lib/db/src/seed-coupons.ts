import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { db, couponsTable, couponRulesTable } from './index.js';
import { eq, sql } from 'drizzle-orm';

interface SeedCoupon {
  code: string;
  campaignName: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: string;
  maxDiscountCap?: string;
  minEligibleSubtotal?: string;
  globalUseLimit?: number;
  perUserUseLimit?: number;
  autoApply?: boolean;
  priority?: number;
  rules?: Array<{
    ruleType: 'include' | 'exclude';
    scopeType: 'department' | 'componentType' | 'category' | 'product';
    scopeValue: string;
  }>;
}

const couponsToSeed: SeedCoupon[] = [
  {
    code: 'TECH20',
    campaignName: 'Tech Deals 20% Off',
    description: '20% off general eligible items',
    discountType: 'percent',
    discountValue: '20.00',
    maxDiscountCap: '10000.00',
    minEligibleSubtotal: '0.00',
    autoApply: false,
    priority: 10,
  },
  {
    code: 'GAMING10',
    campaignName: 'Gaming Festival 10% Off',
    description: '10% off Gaming department items',
    discountType: 'percent',
    discountValue: '10.00',
    minEligibleSubtotal: '0.00',
    autoApply: false,
    priority: 5,
    rules: [
      { ruleType: 'include', scopeType: 'department', scopeValue: 'Gaming' },
    ],
  },
  {
    code: 'CPU15',
    campaignName: 'Processor Upgrade Sale',
    description: '15% off processors',
    discountType: 'percent',
    discountValue: '15.00',
    minEligibleSubtotal: '0.00',
    rules: [
      {
        ruleType: 'include',
        scopeType: 'componentType',
        scopeValue: 'Processor',
      },
    ],
  },
  {
    code: 'COOLER10',
    campaignName: 'CPU Coolers Discount',
    description: '10% off CPU coolers',
    discountType: 'percent',
    discountValue: '10.00',
    minEligibleSubtotal: '0.00',
    rules: [
      {
        ruleType: 'include',
        scopeType: 'componentType',
        scopeValue: 'CPU Cooler',
      },
    ],
  },
  {
    code: 'GPU5K',
    campaignName: 'Graphics Card Super Savings',
    description: 'Flat ₹5,000 off graphics cards',
    discountType: 'fixed',
    discountValue: '5000.00',
    rules: [
      {
        ruleType: 'include',
        scopeType: 'componentType',
        scopeValue: 'Graphics Card',
      },
    ],
  },
  {
    code: 'BUILD50K',
    campaignName: 'High Budget PC Build Discount',
    description: '₹5,000 off carts over ₹50,000',
    discountType: 'fixed',
    discountValue: '5000.00',
    minEligibleSubtotal: '50000.00',
  },
  {
    code: 'WELCOME10',
    campaignName: 'Welcome First Purchase Discount',
    description: '10% off first order',
    discountType: 'percent',
    discountValue: '10.00',
    perUserUseLimit: 1,
  },
  {
    code: 'FREESHIP',
    campaignName: 'Free Shipping Promo',
    description: 'Shipping discount or free-shipping promo',
    discountType: 'fixed',
    discountValue: '0.00',
    minEligibleSubtotal: '0.00',
  },
];

export async function seedCoupons() {
  console.log('Seeding coupon campaigns...');
  for (const c of couponsToSeed) {
    const codeUpper = c.code.toUpperCase();
    const [existing] = await db
      .select({ id: couponsTable.id })
      .from(couponsTable)
      .where(eq(sql`upper(${couponsTable.code})`, codeUpper))
      .limit(1);

    let couponId: number;

    const couponPayload = {
      code: codeUpper,
      campaignName: c.campaignName,
      description: c.description,
      isActive: true,
      discountType: c.discountType,
      discountValue: c.discountValue,
      maxDiscountCap: c.maxDiscountCap ?? null,
      minEligibleSubtotal: c.minEligibleSubtotal ?? null,
      globalUseLimit: c.globalUseLimit ?? null,
      perUserUseLimit: c.perUserUseLimit ?? null,
      autoApply: c.autoApply ?? false,
      priority: c.priority ?? 0,
    };

    if (existing) {
      await db
        .update(couponsTable)
        .set(couponPayload)
        .where(eq(couponsTable.id, existing.id));
      couponId = existing.id;
      // Delete old rules to re-insert
      await db
        .delete(couponRulesTable)
        .where(eq(couponRulesTable.couponId, couponId));
    } else {
      const [inserted] = await db
        .insert(couponsTable)
        .values(couponPayload)
        .returning({ id: couponsTable.id });
      couponId = inserted.id;
    }

    if (c.rules && c.rules.length > 0) {
      for (const rule of c.rules) {
        await db.insert(couponRulesTable).values({
          couponId,
          ruleType: rule.ruleType,
          scopeType: rule.scopeType,
          scopeValue: rule.scopeValue,
        });
      }
    }
    console.log(`  ✓ Coupon ${codeUpper} (${c.campaignName}) seeded`);
  }
  console.log('✅ Coupons seeded successfully!');
}

if (
  process.argv[1]?.endsWith('seed-coupons.ts') ||
  process.argv[1]?.endsWith('seed-coupons.js')
) {
  seedCoupons()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding coupons:', err);
      process.exit(1);
    });
}
