import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { usersTable } from './users';
import { productsTable } from './products';

export const reviewsTable = pgTable(
  'reviews',
  {
    id: serial('id').primaryKey(),
    productId: integer('product_id')
      .notNull()
      .references(() => productsTable.id),
    userId: integer('user_id')
      .notNull()
      .references(() => usersTable.id),
    userName: text('user_name').notNull(),
    rating: integer('rating').notNull(), // 1-5 stars
    title: text('title').notNull(),
    comment: text('comment').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userProductUnique: uniqueIndex('reviews_user_product_unique').on(
      table.userId,
      table.productId,
    ),
  }),
);

export const insertReviewSchema = createInsertSchema(reviewsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviewsTable.$inferSelect;
