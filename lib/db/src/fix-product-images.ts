import { db, productsTable } from './index.js';
import { sql } from 'drizzle-orm';

const BRAND_AND_MODEL_IMAGE_MAP: Array<{
  condition: string;
  imageUrl: string;
  description: string;
}> = [
  // Processors
  {
    condition: `component_type = 'Processor' AND (name ILIKE '%ryzen%' OR name ILIKE '%amd%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
    description: 'AMD Ryzen Processor',
  },
  {
    condition: `component_type = 'Processor' AND (name ILIKE '%intel%' OR name ILIKE '%core%' OR name ILIKE '%i7%' OR name ILIKE '%i9%' OR name ILIKE '%i5%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80',
    description: 'Intel Core Processor',
  },
  {
    condition: `component_type = 'Processor'`,
    imageUrl:
      'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
    description: 'General CPU Processor',
  },

  // Graphics Cards
  {
    condition: `component_type = 'Graphics Card' AND (name ILIKE '%rtx%' OR name ILIKE '%geforce%' OR name ILIKE '%nvidia%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    description: 'NVIDIA GeForce RTX GPU',
  },
  {
    condition: `component_type = 'Graphics Card' AND (name ILIKE '%radeon%' OR name ILIKE '%rx%' OR name ILIKE '%amd%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600&auto=format&fit=crop&q=80',
    description: 'AMD Radeon RX GPU',
  },
  {
    condition: `component_type = 'Graphics Card'`,
    imageUrl:
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    description: 'General Gaming GPU',
  },

  // Motherboards
  {
    condition: `component_type = 'Motherboard' AND (name ILIKE '%asus%' OR name ILIKE '%strix%' OR name ILIKE '%tuf%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80',
    description: 'ASUS Gaming Motherboard',
  },
  {
    condition: `component_type = 'Motherboard'`,
    imageUrl:
      'https://images.unsplash.com/photo-1563770660941-20978e870e26?w=600&auto=format&fit=crop&q=80',
    description: 'ATX Gaming Motherboard',
  },

  // RAM
  {
    condition: `component_type = 'RAM' AND (name ILIKE '%rgb%' OR name ILIKE '%spectrix%' OR name ILIKE '%trident%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80',
    description: 'RGB Desktop RAM',
  },
  {
    condition: `component_type = 'RAM'`,
    imageUrl:
      'https://images.unsplash.com/photo-1541029071515-84cc54f84dc5?w=600&auto=format&fit=crop&q=80',
    description: 'DDR4/DDR5 Desktop RAM',
  },

  // Storage
  {
    condition: `component_type = 'Storage'`,
    imageUrl:
      'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
    description: 'M.2 NVMe SSD Storage',
  },

  // CPU Coolers
  {
    condition: `component_type = 'CPU Cooler' AND (name ILIKE '%liquid%' OR name ILIKE '%aio%' OR name ILIKE '%360%' OR name ILIKE '%240%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80',
    description: 'Liquid AIO Cooler',
  },
  {
    condition: `component_type = 'CPU Cooler'`,
    imageUrl:
      'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80',
    description: 'CPU Cooling Heatsink',
  },

  // Cases / Cabinets
  {
    condition: `component_type = 'Case' AND (name ILIKE '%lian li%' OR name ILIKE '%nzxt%' OR name ILIKE '%rgb%')`,
    imageUrl:
      'https://images.unsplash.com/photo-1587202372616-b43abea06c2a?w=600&auto=format&fit=crop&q=80',
    description: 'Glass RGB PC Tower Case',
  },
  {
    condition: `component_type = 'Case'`,
    imageUrl:
      'https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?w=600&auto=format&fit=crop&q=80',
    description: 'Mid Tower Gaming Cabinet',
  },

  // Power Supplies
  {
    condition: `component_type = 'Power Supply'`,
    imageUrl:
      'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80',
    description: '80+ Gold Power Supply SMPS',
  },
];

async function updateAllProductImageUrls() {
  console.log('Mapping high-resolution authentic images for all products in PostgreSQL database...');

  for (const item of BRAND_AND_MODEL_IMAGE_MAP) {
    await db
      .update(productsTable)
      .set({ imageUrl: item.imageUrl })
      .where(sql.raw(item.condition));
    console.log(`✅ Assigned crisp authentic image for ${item.description}`);
  }

  console.log('🎉 Successfully updated all product images in PostgreSQL.');
}

updateAllProductImageUrls().catch(console.error);
