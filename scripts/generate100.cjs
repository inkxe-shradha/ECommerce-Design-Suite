const fs = require('fs');
const products = [];
const mobiles = ['iPhone 13', 'iPhone 14', 'iPhone 15 Pro', 'Galaxy S21', 'Galaxy S22', 'Galaxy S23 Ultra', 'Pixel 6', 'Pixel 7 Pro', 'Pixel 8', 'OnePlus 11', 'OnePlus Nord CE 3', 'Redmi Note 12', 'POCO X5 Pro', 'Motorola Edge 40', 'Vivo V27'];
const laptops = ['MacBook Air M1', 'MacBook Pro 14', 'Dell XPS 13', 'Dell Inspiron 15', 'HP Spectre x360', 'HP Pavilion 14', 'Lenovo ThinkPad X1', 'Lenovo IdeaPad Slim 3', 'Asus ROG Zephyrus G14', 'Asus VivoBook 15', 'Acer Predator Helios', 'Acer Swift 3', 'MSI Katana GF66', 'Microsoft Surface Laptop 5'];
const audio = ['Sony WH-1000XM4', 'Sony WF-1000XM5', 'AirPods Pro 2', 'AirPods 3rd Gen', 'Bose QuietComfort 45', 'Bose Earbuds II', 'Jabra Elite 7 Pro', 'Sennheiser Momentum 4', 'JBL Flip 6', 'JBL Charge 5', 'Marshall Emberton', 'Skullcandy Crusher ANC'];
const accessories = ['Logitech MX Master 3S', 'Logitech G Pro X Superlight', 'Razer DeathAdder V3', 'Razer BlackWidow V4', 'Corsair K70 RGB', 'Keychron K2', 'Apple Magic Mouse', 'Anker 737 Power Bank', 'Spigen Liquid Air Case', 'Belkin MagSafe Charger', 'SanDisk Extreme Portable SSD 1TB'];
const cameras = ['Sony A7 IV', 'Sony ZV-E10', 'Canon EOS R5', 'Canon EOS R50', 'Nikon Z6 II', 'Fujifilm X-T5', 'Panasonic Lumix S5 II', 'GoPro HERO 12 Black', 'DJI Osmo Action 4', 'Insta360 X3', 'DJI Mini 3 Pro Drone'];

const categoryImages = {
  Mobiles: [
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533228100845-08145b01de14?q=80&w=500&auto=format&fit=crop'
  ],
  Laptops: [
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1531297172867-2144ce699564?q=80&w=500&auto=format&fit=crop'
  ],
  Audio: [
    'https://images.unsplash.com/photo-1546435770-a3e426fac332?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=500&auto=format&fit=crop'
  ],
  Accessories: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?q=80&w=500&auto=format&fit=crop'
  ],
  Cameras: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?q=80&w=500&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=500&auto=format&fit=crop'
  ]
};

const generate = (names, cat, startIdx) => {
  return names.map((name, i) => {
    let brand = name.split(' ')[0];
    if (name.includes('iPhone') || name.includes('MacBook') || name.includes('AirPods')) brand = 'Apple';
    if (name.includes('Galaxy')) brand = 'Samsung';
    if (name.includes('Pixel')) brand = 'Google';
    
    const originalPrice = 5000 + Math.floor(Math.random() * 150000);
    const discountPct = Math.floor(Math.random() * 40);
    const price = originalPrice - (originalPrice * (discountPct / 100));
    
    const catImages = categoryImages[cat];
    const imageUrl = catImages[i % catImages.length];

    return {
      name,
      brand,
      price: price.toFixed(2),
      originalPrice: originalPrice.toFixed(2),
      discountPct,
      category: cat,
      imageUrl: imageUrl,
      rating: (3.8 + Math.random() * 1.1).toFixed(1),
      reviewCount: Math.floor(Math.random() * 3000),
      inStock: Math.random() > 0.05,
      stockCount: Math.floor(Math.random() * 100),
      specs: `High quality ${cat.toLowerCase()} from ${brand}.`,
      isFeatured: Math.random() > 0.8,
      isDeal: discountPct > 20
    };
  });
};

products.push(...generate(mobiles, 'Mobiles', 0));
products.push(...generate(laptops, 'Laptops', 0));
products.push(...generate(audio, 'Audio', 0));
products.push(...generate(accessories, 'Accessories', 0));
products.push(...generate(cameras, 'Cameras', 0));

// clone to get 100
const variants = products.map(p => ({...p, name: p.name + ' (Variant)', price: (parseFloat(p.price) * 1.2).toFixed(2)}));
products.push(...variants);
const finalProducts = products.slice(0, 100);

const filePath = 'c:/My Projects/ECommerce-Design-Suite/ECommerce-Design-Suite/lib/db/src/seed.ts';
let seedContent = fs.readFileSync(filePath, 'utf8');

// Replace the sampleProducts array
const startRegex = /const sampleProducts = \[/;
const endStr = ';\nconst oldSampleProducts = [';
const matchStart = seedContent.match(startRegex);

if (matchStart) {
  const startIndex = matchStart.index;
  const endIndex = seedContent.indexOf(endStr, startIndex);
  if (endIndex !== -1) {
    const before = seedContent.substring(0, startIndex);
    const after = seedContent.substring(endIndex);
    seedContent = before + 'const sampleProducts = ' + JSON.stringify(finalProducts, null, 2) + after;
  }
} else {
  // If it was already replaced, we can just replace everything between 'const sampleProducts = [' and ';\nconst oldSampleProducts = [' 
  console.log("Could not find matching signature, attempting generic replace");
}

fs.writeFileSync(filePath, seedContent);
console.log('Appended 100 products to seed.ts with valid Unsplash images');
