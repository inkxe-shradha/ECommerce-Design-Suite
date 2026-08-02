/**
 * import-pc-components.ts
 *
 * Idempotent importer for pc_components_shopnow.json.
 * Run: pnpm --filter @workspace/db tsx src/import-pc-components.ts
 *
 * - Uses externalId for upserts so re-running is safe.
 * - Produces a reject-report at the end for any malformed records.
 * - Maps only the PC-component supplier category names to normalized componentType values.
 * - Rejects mobile/laptop/other non-PC categories so Gaming stays component-only.
 */

import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { eq } from 'drizzle-orm';
import { db, productsTable } from './index.js';
import type { InsertProduct } from './schema/products.js';
import { COMPONENT_TYPES } from './schema/products.js';

// ─── Supplier → normalized componentType mapping ────────────────────────────

const CATEGORY_TO_COMPONENT_TYPE: Record<
  string,
  (typeof COMPONENT_TYPES)[number]
> = {
  Processor: 'Processor',
  'CPU Cooler': 'CPU Cooler',
  'Graphics Card': 'Graphics Card',
  RAM: 'RAM',
  Storage: 'Storage',
  'Power Supply': 'Power Supply',
  Motherboard: 'Motherboard',
  Cabinet: 'Case',
  Case: 'Case',
};

// Known storage sub-categories all map to 'Storage'
const STORAGE_VARIANTS = [
  'Internal SSD',
  'External SSD',
  'Internal HDD',
  'NAS HDD',
];

function resolveComponentType(
  supplierCategory: string,
): (typeof COMPONENT_TYPES)[number] | null {
  if (CATEGORY_TO_COMPONENT_TYPE[supplierCategory]) {
    return CATEGORY_TO_COMPONENT_TYPE[supplierCategory];
  }
  if (STORAGE_VARIANTS.includes(supplierCategory)) return 'Storage';
  return null;
}

// ─── Supplier record shape ───────────────────────────────────────────────────

interface SupplierProduct {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  price: number;
  currency?: string;
  in_stock: boolean;
  url?: string;
  main_image: string;
  images?: string[];
  specifications?: Record<string, string>;
  description?: string;
}

// ─── Normalize specifications into a flat JSON-compatible object ─────────────

function normalizeSpecs(
  raw: Record<string, string> | undefined,
  componentType: string,
): Record<string, unknown> {
  if (!raw) return {};

  const specs: Record<string, unknown> = { ...raw };

  // Normalize well-known compatibility keys
  // CPU socket (Processor records)
  for (const key of ['Socket', 'CPU Socket', 'Processor Socket']) {
    if (raw[key]) specs['cpuSocket'] = raw[key];
  }

  // Supported sockets (cooler records)
  for (const key of [
    'Supported Sockets',
    'Socket Compatibility',
    'Compatible Sockets',
  ]) {
    if (raw[key])
      specs['supportedSockets'] = raw[key].split(/[,/]/).map((s) => s.trim());
  }

  // RAM type / generation
  for (const key of ['Memory Type', 'RAM Type', 'DDR Type', 'Type']) {
    if (raw[key] && /ddr/i.test(raw[key])) {
      specs['ramGeneration'] = raw[key].replace(/\s+/g, '').toUpperCase();
    }
  }

  // GPU length
  for (const key of [
    'Card Length',
    'GPU Length',
    'Card Dimension',
    'Dimensions',
  ]) {
    if (raw[key]) specs['gpuLength'] = raw[key];
  }

  // PSU wattage
  for (const key of ['Wattage', 'Power', 'Rated Power', 'Output Power']) {
    if (raw[key]) specs['psuWattage'] = raw[key];
  }

  // Cooler radiator size
  if (componentType === 'CPU Cooler') {
    for (const key of [
      'Radiator Size',
      'AIO Size',
      'Radiator',
      'Cooler Size',
    ]) {
      if (raw[key]) specs['radiatorSize'] = raw[key];
    }
    // Determine cooler type (AIO vs air)
    const nameUpper = JSON.stringify(raw).toUpperCase();
    specs['coolerType'] =
      nameUpper.includes('AIO') ||
      nameUpper.includes('LIQUID') ||
      nameUpper.includes('240') ||
      nameUpper.includes('360')
        ? 'AIO'
        : 'Air';
  }

  // Storage interface
  for (const key of [
    'Interface',
    'Storage Interface',
    'Connection Interface',
    'Form Factor',
  ]) {
    if (raw[key] && /nvme|sata|m\.2|pcie/i.test(raw[key])) {
      specs['storageInterface'] = raw[key];
    }
  }

  return specs;
}

// ─── Main import function ────────────────────────────────────────────────────

interface ImportResult {
  imported: number;
  updated: number;
  rejected: Array<{ id: string; reason: string }>;
}

export async function importPcComponents(
  jsonPath: string,
): Promise<ImportResult> {
  const raw = JSON.parse(readFileSync(jsonPath, 'utf-8')) as unknown;
  const records: SupplierProduct[] = Array.isArray(raw) ? raw : [];

  // Fetch set of existing externalIds in one fast query
  const existingRows = await db
    .select({ externalId: productsTable.externalId })
    .from(productsTable);
  const existingSet = new Set(
    existingRows.map((r) => r.externalId).filter(Boolean),
  );

  const rejected: Array<{ id: string; reason: string }> = [];
  let imported = 0;
  let updated = 0;

  const toInsert: InsertProduct[] = [];
  const toUpdate: InsertProduct[] = [];

  for (const rec of records) {
    const rawId = String(rec.id ?? '');
    if (!rawId) {
      rejected.push({ id: '(missing)', reason: 'Missing id field' });
      continue;
    }

    // Construct unique externalId so records sharing supplier brand IDs don't collide
    const urlSlug = rec.url ? rec.url.split('/product/')[1] || rec.url.split('/').pop() : '';
    const id = rec.model
      ? `${rawId}-${rec.model}`
      : urlSlug
      ? `${rawId}-${urlSlug}`
      : `${rawId}-${rec.name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 40)}`;
    if (!rec.name || !rec.brand || rec.price == null) {
      rejected.push({
        id,
        reason: 'Missing required fields (name, brand, price)',
      });
      continue;
    }
    if (!rec.main_image) {
      rejected.push({ id, reason: 'Missing main_image' });
      continue;
    }

    const componentType = resolveComponentType(rec.category);
    if (!componentType) {
      rejected.push({ id, reason: `Unknown category: ${rec.category}` });
      continue;
    }

    const normalizedSpecs = normalizeSpecs(rec.specifications, componentType);
    const images =
      Array.isArray(rec.images) && rec.images.length > 0
        ? rec.images
        : [rec.main_image];

    const product: InsertProduct = {
      name: rec.name,
      brand: rec.brand,
      price: String(rec.price),
      originalPrice: null,
      discountPct: null,
      category: 'Gaming',
      department: 'Gaming',
      componentType,
      externalId: id,
      sourceUrl: rec.url ?? null,
      imageUrl: rec.main_image,
      images: JSON.stringify(images),
      rating: '4.0',
      reviewCount: 0,
      inStock: true,
      stockCount: 50,
      specs: JSON.stringify(normalizedSpecs),
      isFeatured: false,
      isDeal: false,
    };

    if (existingSet.has(id)) {
      toUpdate.push(product);
    } else {
      toInsert.push(product);
    }
  }

  // Batch insert new records in chunks of 100
  const BATCH_SIZE = 100;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const chunk = toInsert.slice(i, i + BATCH_SIZE);
    try {
      await db.insert(productsTable).values(chunk);
      imported += chunk.length;
    } catch (err) {
      // Fallback single inserts if chunk fails
      for (const item of chunk) {
        try {
          await db.insert(productsTable).values(item);
          imported++;
        } catch (e) {
          rejected.push({
            id: item.externalId ?? 'unknown',
            reason: String(e),
          });
        }
      }
    }
  }

  // Batch update existing records
  for (const item of toUpdate) {
    try {
      if (item.externalId) {
        await db
          .update(productsTable)
          .set({ ...item })
          .where(eq(productsTable.externalId, item.externalId));
        updated++;
      }
    } catch (err) {
      rejected.push({ id: item.externalId ?? 'unknown', reason: String(err) });
    }
  }

  return { imported, updated, rejected };
}

// ─── CLI entry point ─────────────────────────────────────────────────────────

if (
  process.argv[1]?.endsWith('import-pc-components.ts') ||
  process.argv[1]?.endsWith('import-pc-components.js')
) {
  const jsonPath =
    process.argv[2] ??
    (existsSync(resolve(process.cwd(), 'pc_components_shopnow.json'))
      ? resolve(process.cwd(), 'pc_components_shopnow.json')
      : resolve(process.cwd(), '../../pc_components_shopnow.json'));
  console.log(`Importing from: ${jsonPath}`);
  importPcComponents(jsonPath)
    .then((result) => {
      console.log(
        `✅ Imported: ${result.imported}, Updated: ${result.updated}`,
      );
      if (result.rejected.length > 0) {
        console.warn(`⚠️  Rejected (${result.rejected.length}):`);
        result.rejected.forEach((r) => console.warn(`  [${r.id}] ${r.reason}`));
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error('Import failed:', err);
      process.exit(1);
    });
}
