export function AnonHomePage() {
  const products = [
    { id: 1, name: "Samsung Galaxy S23 Ultra", brand: "Samsung", price: 89999, originalPrice: 124999, discount: 28, img: "/__mockup/images/galaxy-s23.jpg", rating: 4.7, reviews: 18723 },
    { id: 2, name: "Apple iPhone 15 Pro", brand: "Apple", price: 134900, originalPrice: 149900, discount: 10, img: "/__mockup/images/ipad-air.jpg", rating: 4.8, reviews: 12400 },
    { id: 3, name: "OnePlus 12", brand: "OnePlus", price: 64999, originalPrice: 74999, discount: 13, img: "/__mockup/images/galaxy-s23.jpg", rating: 4.5, reviews: 7812 },
    { id: 4, name: "Xiaomi 13 Pro", brand: "Xiaomi", price: 59999, originalPrice: 79999, discount: 25, img: "/__mockup/images/galaxy-s23.jpg", rating: 4.4, reviews: 5234 },
    { id: 5, name: "Google Pixel 8 Pro", brand: "Google", price: 84999, originalPrice: 99999, discount: 15, img: "/__mockup/images/galaxy-s23.jpg", rating: 4.6, reviews: 9102 },
  ];
  const laptops = [
    { id: 6, name: "Dell XPS 15 Laptop", brand: "Dell", price: 124999, originalPrice: 145999, discount: 14, img: "/__mockup/images/dell-xps-15.jpg", rating: 4.6, reviews: 2847 },
    { id: 7, name: "Lenovo ThinkPad X1 Carbon", brand: "Lenovo", price: 149999, originalPrice: 179999, discount: 17, img: "/__mockup/images/hero-laptop.jpg", rating: 4.6, reviews: 1893 },
    { id: 8, name: "MacBook Pro 14\"", brand: "Apple", price: 199900, originalPrice: 219900, discount: 9, img: "/__mockup/images/hero-laptop.jpg", rating: 4.9, reviews: 31200 },
    { id: 9, name: "HP Spectre x360", brand: "HP", price: 114999, originalPrice: 134999, discount: 15, img: "/__mockup/images/hero-laptop.jpg", rating: 4.5, reviews: 3421 },
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
          {/* No user — Sign In button */}
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold">
            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In
          </button>
          <div className="relative">
            <div className="w-[38px] h-[38px] rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-700">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Guest banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-center">
        <span className="text-amber-800 text-[13px]">
          You're browsing as a <strong>guest</strong> — showing curated &amp; trending picks.{" "}
          <span className="underline font-semibold text-amber-900 cursor-pointer">Sign in</span> for personalised recommendations.
        </span>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative rounded-2xl overflow-hidden bg-[#0f1115] h-[340px] flex items-center">
          <img src="/__mockup/images/hero-laptop.jpg" alt="hero" className="absolute inset-0 w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="relative z-10 p-12 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-5 border border-indigo-500/30">
              ⚡ New Arrival
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 leading-tight">Power Meets <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Precision.</span></h1>
            <p className="text-gray-300 mb-6 text-base">The all-new Pro Series is here. Unmatched performance for creators and professionals.</p>
            <div className="flex gap-4">
              <button className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">Shop Now →</button>
              <button className="bg-white/10 text-white px-6 py-2.5 rounded-lg font-semibold text-sm">View Specs</button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Mobiles — Popularity-Based */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Top Trending Mobiles</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-orange-700 bg-orange-50 border-orange-200">
              📈 Popularity-Based
            </div>
          </div>
          <p className="text-sm text-gray-500">Most popular handsets this week across India</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {products.map(p => (
            <div key={p.id} className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="relative mb-3">
                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">-{p.discount}%</div>
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{p.brand}</div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{p.name}</h3>
              <div className="flex items-center gap-1 mb-2">
                <span className="text-amber-500 text-xs">★</span>
                <span className="text-xs font-medium text-gray-700">{p.rating}</span>
                <span className="text-[10px] text-gray-400">({p.reviews.toLocaleString()})</span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-bold text-sm text-gray-900">{fmt(p.price)}</span>
                <span className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>
              </div>
              <button className="w-full bg-indigo-50 text-indigo-700 font-semibold text-xs py-2 rounded-lg border border-indigo-100">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* Best Laptop Deals — Editorial */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Best Laptop Deals Right Now</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border text-teal-700 bg-teal-50 border-teal-200">
              📖 Editorial Pick
            </div>
          </div>
          <p className="text-sm text-gray-500">Handpicked by our editors — top value for your budget</p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {laptops.map(p => (
            <div key={p.id} className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="relative mb-3">
                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">-{p.discount}%</div>
                <div className="h-32 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
                  <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
              </div>
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{p.brand}</div>
              <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{p.name}</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-bold text-sm text-gray-900">{fmt(p.price)}</span>
                <span className="text-xs text-gray-400 line-through">{fmt(p.originalPrice)}</span>
              </div>
              <button className="w-full bg-indigo-50 text-indigo-700 font-semibold text-xs py-2 rounded-lg border border-indigo-100">Add to Cart</button>
            </div>
          ))}
        </div>
      </div>

      {/* Sign-in nudge */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <div className="text-white/70 text-sm font-medium mb-1">Unlock Personalised Recommendations</div>
            <h3 className="text-2xl font-bold text-white mb-2">Sign in for your AI-powered shopping feed</h3>
            <p className="text-indigo-200 text-sm max-w-md">Get picks tailored to your browsing history, past purchases, and preferences — powered by Content-Based, Collaborative, and Hybrid AI.</p>
          </div>
          <button className="flex-shrink-0 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 whitespace-nowrap">Sign In to ShopNow</button>
        </div>
      </div>
    </div>
  );
}
