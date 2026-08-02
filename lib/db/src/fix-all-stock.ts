import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { db, productsTable } from './index.js';

export async function fixAllStock() {
  console.log('Updating all products in database to inStock = true, stockCount = 50...');
  await db.update(productsTable).set({
    inStock: true,
    stockCount: 50,
  });
  console.log('✅ ALL products in database updated to inStock = true!');
}

if (
  process.argv[1]?.endsWith('fix-all-stock.ts') ||
  process.argv[1]?.endsWith('fix-all-stock.js')
) {
  fixAllStock()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Failed to update stock:', err);
      process.exit(1);
    });
}
