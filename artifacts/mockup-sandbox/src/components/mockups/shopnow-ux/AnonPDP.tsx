export function AnonPDP() {
  const product = { name: "Dell XPS 15 Laptop", brand: "Dell", price: 124999, originalPrice: 145999, discount: 14, rating: 4.6, reviews: 2847, specs: "12th Gen Intel i7, 16GB RAM, 512GB SSD, 15.6\" OLED Display, Windows 11 Pro" };
  const fbt = [
    { id: 2, name: "Logitech MX Master 3S Mouse", brand: "Logitech", price: 8499, img: "/__mockup/images/mouse.jpg" },
    { id: 3, name: "Bellroy Laptop Sleeve 15\"", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg" },
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg" },
  ];
  const trending = [
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg", rating: 4.4 },
    { id: 5, name: "Samsung T7 Portable SSD 1TB", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg", rating: 4.7 },
    { id: 6, name: "Sony WH-1000XM5", brand: "Sony", price: 24990, img: "/__mockup/images/sony-headphones.jpg", rating: 4.8 },
    { id: 7, name: "Apple AirPods Pro (2nd Gen)", brand: "Apple", price: 24900, img: "/__mockup/images/headphones.jpg", rating: 4.9 },
    { id: 8, name: "Bellroy Laptop Sleeve", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg", rating: 4.5 },
  ];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  const savings = product.originalPrice - product.price;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Announcement */}
      <div className="bg-[#1a1a2e] text-[#e0e0ff] text-[13px] py-1.5 text-center">
        🎉 Free shipping on orders over ₹999 &nbsp;|&nbsp; Use code <strong>TECH20</strong> for 20% off
      </div>

      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          <span className="font-extrabold text-[18px] text-[#1a1a2e]">Shop<span className="text-indigo-500">Now</span></span>
          <nav className="flex gap-1 flex-1">
            {["Mobiles ▾", "Laptops ▾", "Accessories", "Audio", "Cameras", "Deals"].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-md text-[12px] font-medium text-gray-700">{c}</button>
            ))}
          </nav>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-[13px] font-semibold">Sign In</button>
        </div>
      </header>

      {/* Guest banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-center">
        <span className="text-amber-800 text-[12px]">You're browsing as a <strong>guest</strong>. <span className="underline font-semibold cursor-pointer">Sign in</span> for personalised recommendations.</span>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center text-xs font-medium text-gray-500 gap-2">
          <span className="hover:text-indigo-600 cursor-pointer">Home</span> › <span>Laptops</span> › <span>Dell</span> › <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Product Hero */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Gallery */}
          <div className="w-full md:w-1/2">
            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 border border-gray-100 overflow-hidden">
              <img src="/__mockup/images/dell-xps-15.jpg" alt="Dell XPS 15" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            <div className="flex gap-3 mt-3">
              {[0,1,2,3].map(i => (
                <div key={i} className={`w-18 h-18 rounded-xl bg-gray-50 border-2 p-2 w-16 h-16 flex items-center justify-center overflow-hidden ${i===0?'border-indigo-600':'border-transparent'}`}>
                  <img src="/__mockup/images/dell-xps-15.jpg" className="w-full h-full object-contain mix-blend-multiply opacity-70" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="text-sm font-bold text-indigo-600 tracking-wider uppercase mb-2">{product.brand}</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{product.name}</h1>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                <span className="text-sm font-bold text-amber-700">{product.rating}</span>
                <span className="text-amber-500 text-sm">★</span>
              </div>
              <span className="text-sm text-blue-600">{product.reviews.toLocaleString()} ratings</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-100">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-gray-900">{fmt(product.price)}</span>
                <span className="text-lg text-gray-400 line-through mb-1">{fmt(product.originalPrice)}</span>
              </div>
              <div className="text-sm text-green-600 font-bold">Save {fmt(savings)} ({product.discount}%) · Inclusive of all taxes</div>
            </div>
            <p className="text-sm text-gray-600 mb-6">{product.specs}</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-3.5 rounded-lg border border-indigo-200">🛒 Add to Cart</button>
              <button className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-lg shadow-md shadow-indigo-200">Buy Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Bought Together */}
      <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Frequently Bought Together</h2>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
            📊 Popular Combo
          </div>
        </div>
        <div className="flex items-center gap-6 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-28 h-28 bg-white rounded-xl border-2 border-indigo-200 flex items-center justify-center p-3 shadow-sm relative">
              <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]">✓</div>
              <img src="/__mockup/images/dell-xps-15.jpg" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            {fbt.map(p => (
              <div key={p.id} className="flex items-center gap-4">
                <div className="text-2xl text-gray-300">+</div>
                <div className="w-28 h-28 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-3 shadow-sm relative hover:border-indigo-300">
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center text-white text-[10px]">✓</div>
                  <img src={p.img} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total price:</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{fmt(product.price + fbt.reduce((a,p) => a+p.price, 0))}</div>
            <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block mb-4">Bundle Savings: ₹1,200</div>
            <button className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-lg">Add All to Cart</button>
          </div>
        </div>
      </div>

      {/* Trending Accessories — no personal AI */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Trending Accessories</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-orange-700 bg-orange-50 border-orange-200">📈 Trending</div>
          </div>
          <p className="text-sm text-gray-500">Top-rated add-ons shoppers are picking up this week</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {trending.map(p => (
            <div key={p.id} className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{p.brand}</div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{p.name}</h3>
              <div className="font-bold text-sm text-gray-900 mb-2">{fmt(p.price)}</div>
              <button className="w-full bg-indigo-50 text-indigo-700 font-semibold text-xs py-2 rounded-lg border border-indigo-100">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* Subtle sign-in nudge */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-4 flex items-center gap-3">
          <span className="text-indigo-500">⚡</span>
          <p className="text-sm text-indigo-800"><strong>Sign in</strong> to see AI-powered picks personalised for you — based on what you browse and buy.</p>
        </div>
      </div>
    </div>
  );
}
