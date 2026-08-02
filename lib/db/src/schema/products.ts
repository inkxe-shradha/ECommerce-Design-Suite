import {
  pgTable,
  serial,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';

// Valid PC component types for the Gaming department
export const COMPONENT_TYPES = [
  'Processor',
  'CPU Cooler',
  'Graphics Card',
  'RAM',
  'Storage',
  'Power Supply',
  'Motherboard',
  'Case',
  'Monitor',
  'Peripheral',
] as const;
export type ComponentType = (typeof COMPONENT_TYPES)[number];

export const productsTable = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    brand: text('brand').notNull(),
    price: numeric('price', { precision: 10, scale: 2 }).notNull(),
    originalPrice: numeric('original_price', { precision: 10, scale: 2 }),
    discountPct: integer('discount_pct'),
    /** Broad shopping category kept for backwards compatibility (Laptops, Mobiles, etc.) */
    category: text('category').notNull(),
    /** Top-level commerce department, e.g. 'Gaming'. Null for non-department products. */
    department: text('department'),
    /** Component type within a department, e.g. 'Processor', 'CPU Cooler' */
    componentType: text('component_type'),
    /** Unique identifier from the supplier/source catalog, used for idempotent imports */
    externalId: text('external_id').unique(),
    /** Supplier product page URL */
    sourceUrl: text('source_url'),
    /** Primary image URL (backwards compatible) */
    imageUrl: text('image_url').notNull(),
    /** JSON array of all product image URLs, e.g. ["https://...", ...] */
    images: text('images'),
    rating: numeric('rating', { precision: 3, scale: 1 })
      .notNull()
      .default('4.0'),
    reviewCount: integer('review_count').notNull().default(0),
    inStock: boolean('in_stock').notNull().default(true),
    stockCount: integer('stock_count'),
    /** Serialized JSON object of product specifications. For PC components includes normalized
     *  compatibility keys: cpuSocket, supportedSockets, ramGeneration, formFactor,
     *  gpuLength, psuWattage, storageInterface, radiatorSize, etc. */
    specs: text('specs'),
    isFeatured: boolean('is_featured').notNull().default(false),
    isDeal: boolean('is_deal').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index('products_department_component_idx').on(
      t.department,
      t.componentType,
    ),
    index('products_external_id_idx').on(t.externalId),
  ],
);

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
