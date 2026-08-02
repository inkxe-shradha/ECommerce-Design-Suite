export function LoggedInPDP() {
  const product = { name: "Dell XPS 15 Laptop", brand: "Dell", price: 124999, originalPrice: 145999, discount: 14, rating: 4.6, reviews: 2847, specs: "12th Gen Intel i7, 16GB RAM, 512GB SSD, 15.6\" OLED Display, Windows 11 Pro" };
  const fbt = [
    { id: 2, name: "Logitech MX Master 3S Mouse", brand: "Logitech", price: 8499, img: "/__mockup/images/mouse.jpg" },
    { id: 3, name: "Bellroy Laptop Sleeve 15\"", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg" },
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg" },
  ];
  const contentBased = [
    { id: 4, name: "Anker USB-C Hub", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg", reason: "USB-C compatible" },
    { id: 5, name: "Samsung T7 SSD 1TB", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg", reason: "Spec compatible" },
    { id: 6, name: "Sony WH-1000XM5", brand: "Sony", price: 24990, img: "/__mockup/images/sony-headphones.jpg", reason: "Frequently used together" },
    { id: 7, name: "Apple AirPods Pro", brand: "Apple", price: 24900, img: "/__mockup/images/headphones.jpg", reason: "Color matched" },
  ];
  const hybrid = [
    { id: 1, name: "Dell XPS 15", price: 124999, img: "/__mockup/images/dell-xps-15.jpg", reason: "Editorial pick + your history" },
    { id: 6, name: "Sony Headphones", price: 24990, img: "/__mockup/images/sony-headphones.jpg", reason: "Trending + your preferences" },
    { id: 5, name: "Samsung SSD 1TB", price: 7499, img: "/__mockup/images/ssd.jpg", reason: "Curated for your work style" },
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
          <div className="flex items-center gap-2">
            <div className="w-[32px] h-[32px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[12px] font-bold">R</div>
            <div>
              <div className="text-[11px] text-gray-500">Hello,</div>
              <div className="text-[12px] font-semibold text-[#1a1a2e]">Rahul</div>
            </div>
          </div>
          <div className="relative">
            <div className="w-[36px] h-[36px] rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">🛒</div>
            <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center text-xs font-medium text-gray-500 gap-2">
          <span className="hover:text-indigo-600 cursor-pointer">Home</span> › <span>Laptops</span> › <span>Dell</span> › <span className="text-gray-900 font-semibold">{product.name}</span>
        </div>
      </div>

      {/* Product Hero */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 border border-gray-100 overflow-hidden">
              <img src="/__mockup/images/dell-xps-15.jpg" alt="Dell XPS 15" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          </div>
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
              <div className="text-sm text-green-600 font-bold">Save {fmt(savings)} ({product.discount}%)</div>
            </div>
            <p className="text-sm text-gray-600 mb-6">{product.specs}</p>
            <div className="flex gap-3">
              <button className="flex-1 bg-indigo-50 text-indigo-700 font-bold py-3.5 rounded-lg border border-indigo-200">🛒 Add to Cart</button>
              <button className="flex-1 bg-indigo-600 text-white font-bold py-3.5 rounded-lg shadow-md shadow-indigo-200">Buy Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* Hybrid AI Bundle — personal purple card */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-[#2e1065] to-[#1e1b4b] p-[1px] shadow-2xl">
          <div className="bg-[#131127]/80 backdrop-blur-xl rounded-[15px] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30 mb-4">
                ✨ AI Hybrid • Personalized for Rahul
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Rahul's AI Bundle Suggestion</h2>
              <p className="text-indigo-200 mb-6 text-sm">Upgrading for work? Here's your kit</p>
              <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2 text-sm">
                🛒 Add Bundle to Cart <span className="text-white/70 font-normal">{fmt(hybrid.reduce((a,p)=>a+p.price,0))}</span>
              </button>
            </div>
            <div className="w-full md:w-[320px] relative z-10 bg-white/5 border border-white/10 p-5 rounded-xl flex gap-3">
              <div className="flex flex-col gap-2 items-center">
                {hybrid.map((p, i) => (
                  <div key={p.id}>
                    <div className="w-12 h-12 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-1.5">
                      <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    {i < 2 && <div className="w-4 h-4 bg-indigo-500/30 rounded-full flex items-center justify-center mt-1.5 ml-4"><span className="text-[10px] text-white">+</span></div>}
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-black/40 rounded-lg p-3 border border-white/5">
                <ul className="text-xs text-gray-300 space-y-2">
                  {hybrid.map((p, i) => (
                    <li key={p.id} className={`flex justify-between ${i < 2 ? 'border-b border-white/5 pb-2' : ''}`}>
                      <span className="truncate w-20 text-[11px]">{p.name}</span>
                      <span className="text-white whitespace-nowrap text-[11px]">{fmt(p.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FBT */}
      <div className="max-w-7xl mx-auto px-6 py-6 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-lg font-bold text-gray-900">Frequently Bought Together</h2>
          <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">📊 Collaborative Filtering</div>
        </div>
        <div className="flex items-center gap-5 bg-gray-50/50 rounded-xl p-5 border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-24 h-24 bg-white rounded-xl border-2 border-indigo-200 flex items-center justify-center p-2 shadow-sm relative">
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded text-white text-[8px] flex items-center justify-center">✓</div>
              <img src="/__mockup/images/dell-xps-15.jpg" className="w-full h-full object-contain mix-blend-multiply" />
            </div>
            {fbt.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="text-xl text-gray-300">+</div>
                <div className="w-24 h-24 bg-white rounded-xl border border-gray-200 flex items-center justify-center p-2 shadow-sm relative hover:border-indigo-300">
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-indigo-600 rounded text-white text-[8px] flex items-center justify-center">✓</div>
                  <img src={p.img} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Total price:</div>
            <div className="text-xl font-bold text-gray-900 mb-1">{fmt(product.price + fbt.reduce((a,p) => a+p.price, 0))}</div>
            <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block mb-3">Bundle Savings: ₹1,200</div>
            <button className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg text-sm">Add All to Cart</button>
          </div>
        </div>
      </div>

      {/* Content-Based — Complete Your Setup */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Complete Your Setup</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-blue-700 bg-blue-50 border-blue-100">⚡ Content-Based Filtering</div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {contentBased.map(p => (
            <div key={p.id} className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{p.brand}</div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">{p.name}</h3>
              <div className="bg-blue-50 text-blue-700 text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 inline-block">{p.reason}</div>
              <div className="font-bold text-sm text-gray-900 mb-2">{fmt(p.price)}</div>
              <button className="w-full bg-indigo-50 text-indigo-700 font-semibold text-xs py-2 rounded-lg border border-indigo-100">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
