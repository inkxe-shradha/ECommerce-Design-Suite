export function LoggedInHomePage() {
  const contentBased = [
    { id: 1, name: "Dell XPS 15 Laptop", brand: "Dell", price: 124999, img: "/__mockup/images/dell-xps-15.jpg", rating: 4.6, reason: "Similar to your browsing" },
    { id: 2, name: "Logitech MX Master 3S", brand: "Logitech", price: 8499, img: "/__mockup/images/mouse.jpg", rating: 4.8, reason: "Matches Accessories" },
    { id: 3, name: "Bellroy Laptop Sleeve", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg", rating: 4.5, reason: "Frequently viewed" },
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg", rating: 4.4, reason: "Accessory match" },
    { id: 5, name: "Samsung T7 SSD 1TB", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg", rating: 4.7, reason: "Similar to your browsing" },
  ];
  const collaborative = [
    { id: 6, name: "Sony WH-1000XM5", brand: "Sony", price: 24990, img: "/__mockup/images/sony-headphones.jpg", rating: 4.8, reason: "Trending in your segment" },
    { id: 7, name: "Samsung Galaxy S23 Ultra", brand: "Samsung", price: 89999, img: "/__mockup/images/galaxy-s23.jpg", rating: 4.7, reason: "Popular this week" },
    { id: 8, name: "Apple iPad Air", brand: "Apple", price: 49900, img: "/__mockup/images/ipad-air.jpg", rating: 4.8, reason: "High demand — only 4 left" },
    { id: 9, name: "Apple AirPods Pro", brand: "Apple", price: 24900, img: "/__mockup/images/headphones.jpg", rating: 4.9, reason: "People like you bought this" },
  ];
  const hybrid = [
    { id: 1, name: "Dell XPS 15", brand: "Dell", price: 124999, img: "/__mockup/images/dell-xps-15.jpg", reason: "Editorial pick + your history" },
    { id: 6, name: "Sony Headphones", brand: "Sony", price: 24990, img: "/__mockup/images/sony-headphones.jpg", reason: "Trending + personalized" },
    { id: 7, name: "Galaxy S23 Ultra", brand: "Samsung", price: 89999, img: "/__mockup/images/galaxy-s23.jpg", reason: "Top rated for your profile" },
    { id: 8, name: "iPad Air", brand: "Apple", price: 49900, img: "/__mockup/images/ipad-air.jpg", reason: "Curated for Rahul" },
  ];
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      {/* Announcement */}
      <div className="bg-[#1a1a2e] text-[#e0e0ff] text-[13px] py-1.5 text-center">
        🎉 Free shipping on orders over ₹999 &nbsp;|&nbsp; Use code <strong>TECH20</strong> for 20% off
      </div>

      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <span className="font-extrabold text-[20px] text-[#1a1a2e]">Shop<span className="text-indigo-500">Now</span></span>
          </div>
          <nav className="flex gap-1 flex-1">
            {["Mobiles ▾", "Laptops ▾", "Accessories", "Audio", "Cameras", "Deals"].map(c => (
              <button key={c} className="px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-700 hover:bg-gray-50">{c}</button>
            ))}
          </nav>
          <div className="flex items-center bg-gray-100 rounded-lg px-3.5 py-2 gap-2 w-[200px] border border-gray-200">
            <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <span className="text-[13px] text-gray-400">Search electronics…</span>
          </div>
          {/* Logged-in user */}
          <div className="flex items-center gap-2">
            <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold">R</div>
            <div>
              <div className="text-[12px] text-gray-500 leading-tight">Hello,</div>
              <div className="text-[13px] font-semibold text-[#1a1a2e] leading-tight">Rahul</div>
            </div>
          </div>
          <div className="relative">
            <div className="w-[38px] h-[38px] rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
            <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative rounded-2xl overflow-hidden bg-[#0f1115] h-[340px] flex items-center">
          <img src="/__mockup/images/hero-laptop.jpg" alt="hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="relative z-10 p-12 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-5 border border-indigo-500/30">⚡ New Arrival</div>
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">Power Meets <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Precision.</span></h1>
            <p className="text-gray-300 mb-6 text-base">The all-new Pro Series is here. Unmatched performance for creators and professionals.</p>
            <div className="flex gap-4">
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">Shop Now →</button>
              <button className="bg-white/10 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">View Specs</button>
            </div>
          </div>
        </div>
      </div>

      {/* Content-Based widget */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Based on Your Interests</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-blue-700 bg-blue-50 border-blue-100">
              ⚡ Content-Based Filtering
            </div>
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

      {/* Hybrid AI — Purple gradient card */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-[#2e1065] to-[#1e1b4b] p-[1px] shadow-2xl">
          <div className="bg-[#131127]/80 backdrop-blur-xl rounded-[15px] p-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]" />
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30 mb-6">
                ✨ AI Hybrid • Personalized for Rahul
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Recommended For You</h2>
              <p className="text-indigo-200 mb-8 text-base">Curated mix of trending picks and your preferences</p>
              <button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                🛒 Add Bundle to Cart &nbsp; <span className="text-white/70 font-normal text-sm">₹2,89,789</span>
              </button>
            </div>
            <div className="w-full md:w-[380px] relative z-10 bg-white/5 border border-white/10 p-6 rounded-xl flex gap-4">
              <div className="flex flex-col gap-2 items-center">
                {hybrid.slice(0, 3).map((p, i) => (
                  <div key={p.id}>
                    <div className="w-14 h-14 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-1.5">
                      <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    {i < 2 && <div className="w-4 h-4 bg-indigo-500/30 rounded-full flex items-center justify-center mt-2 ml-5"><span className="text-[10px] text-white font-bold">+</span></div>}
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-black/40 rounded-lg p-4 border border-white/5">
                <ul className="text-xs text-gray-300 space-y-3">
                  {hybrid.slice(0, 3).map((p, i) => (
                    <li key={p.id} className={`flex justify-between ${i < 2 ? 'border-b border-white/5 pb-2' : ''}`}>
                      <span className="truncate w-24">{p.name}</span>
                      <span className="text-white whitespace-nowrap">{fmt(p.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collaborative widget */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Trending Among Similar Shoppers</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-emerald-700 bg-emerald-50 border-emerald-100">
              📊 Collaborative Filtering
            </div>
          </div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {collaborative.map(p => (
            <div key={p.id} className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{p.brand}</div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-1 line-clamp-2">{p.name}</h3>
              <div className="bg-emerald-50 text-emerald-700 text-[10px] font-medium px-2 py-0.5 rounded-full mb-2 inline-block">{p.reason}</div>
              <div className="font-bold text-sm text-gray-900 mb-2">{fmt(p.price)}</div>
              <button className="w-full bg-indigo-50 text-indigo-700 font-semibold text-xs py-2 rounded-lg border border-indigo-100">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
