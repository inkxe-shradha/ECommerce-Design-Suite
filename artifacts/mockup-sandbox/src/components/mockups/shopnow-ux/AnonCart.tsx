export function AnonCart() {
  const cartItems = [
    { id: 1, name: "Dell XPS 15 Laptop", brand: "Dell", category: "Laptops", price: 124999, qty: 1, img: "/__mockup/images/dell-xps-15.jpg" },
    { id: 2, name: "Logitech MX Master 3S Mouse", brand: "Logitech", category: "Accessories", price: 8499, qty: 1, img: "/__mockup/images/mouse.jpg" },
  ];
  const crossSell = [
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg" },
    { id: 6, name: "Sony WH-1000XM5 Headphones", brand: "Sony", price: 24990, img: "/__mockup/images/sony-headphones.jpg" },
    { id: 5, name: "Samsung T7 Portable SSD", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg" },
    { id: 7, name: "Apple AirPods Pro", brand: "Apple", price: 24900, img: "/__mockup/images/headphones.jpg" },
    { id: 3, name: "Bellroy Laptop Sleeve 15\"", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg" },
    { id: 8, name: "Anker USB-C Charger 100W", brand: "Anker", price: 2999, img: "/__mockup/images/usb-hub.jpg" },
  ];
  const topRated = [
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg", rating: 4.4 },
    { id: 5, name: "Samsung T7 SSD 1TB", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg", rating: 4.7 },
    { id: 3, name: "Bellroy Laptop Sleeve", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg", rating: 4.5 },
    { id: 8, name: "USB-C Charger 100W", brand: "Anker", price: 2999, img: "/__mockup/images/usb-hub.jpg", rating: 4.3 },
  ];
  const subtotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const discount = Math.round(subtotal * 0.2);
  const total = subtotal - discount;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart items */}
          <div className="flex-1 flex flex-col gap-4">
            {cartItems.map(item => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-5 flex gap-5 shadow-sm">
                <div className="w-28 h-28 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                  <img src={item.img} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1">{item.name}</h3>
                  <div className="text-sm text-gray-500 mb-2">Category: {item.category}</div>
                  <div className="text-xs text-green-700 font-bold bg-green-50 px-2 py-1 rounded inline-block mb-4">In Stock</div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-md">-</button>
                      <span className="font-semibold w-4 text-center text-sm">{item.qty}</span>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-200 rounded-md">+</button>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <button className="text-indigo-600">♡ Save for Later</button>
                      <button className="text-gray-400 hover:text-red-600">🗑 Remove</button>
                    </div>
                    <div className="font-bold text-xl text-gray-900">{fmt(item.price)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-[360px]">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-20">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm text-gray-600 mb-4">
                  <div className="flex justify-between"><span>Subtotal ({cartItems.length} items)</span><span className="font-medium text-gray-900">{fmt(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Discount (TECH20)</span><span className="font-medium text-green-600">−{fmt(discount)}</span></div>
                  <div className="flex justify-between"><span>Delivery</span><span className="font-medium text-green-600">FREE</span></div>
                </div>
                <div className="border-t border-gray-100 pt-3 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="font-bold text-2xl text-gray-900">{fmt(total)}</span>
                  </div>
                </div>
                <div className="text-xs font-bold text-green-700 bg-green-50 p-2 rounded-lg text-center mb-4 border border-green-100">
                  You're saving {fmt(discount)} on this order!
                </div>
                <button className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
                  Proceed to Checkout →
                </button>
              </div>
              <div className="bg-gray-50 p-4">
                <div className="text-xs text-gray-500 font-medium mb-3 text-center">Accepted Payment Methods</div>
                <div className="flex justify-center gap-2 mb-3">
                  {["EMI", "UPI", "Cards", "NetBanking"].map(m => (
                    <div key={m} className="bg-white border border-gray-200 text-[10px] font-bold text-gray-600 px-2 py-1 rounded">{m}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Anonymous recommendations — Cross-sell + Top-rated, NO personal AI */}
        <div className="mt-14">
          {/* Cross-sell header */}
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-gray-900">Complete Your Setup</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              📈 Cross-Sell Opportunities
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6">Shoppers frequently add these alongside their cart items</p>

          {/* Chargers, Headphones & More */}
          <div className="mb-2">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Chargers, Headphones &amp; More</h3>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">📈 Frequently Added</div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {crossSell.map(p => (
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

          {/* Top-Rated Accessories */}
          <div className="mt-8 mb-2">
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Top-Rated Accessories</h3>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">📖 Editorial Pick</div>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {topRated.map(p => (
                <div key={p.id} className="flex-shrink-0 w-48 bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{p.brand}</div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-tight mb-2 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center gap-1 mb-2"><span className="text-amber-500 text-xs">★</span><span className="text-xs font-medium text-gray-700">{p.rating}</span></div>
                  <div className="font-bold text-sm text-gray-900 mb-2">{fmt(p.price)}</div>
                  <button className="w-full bg-indigo-50 text-indigo-700 font-semibold text-xs py-2 rounded-lg border border-indigo-100">Add to Cart</button>
                </div>
              ))}
            </div>
          </div>

          {/* Sign-in nudge */}
          <div className="mt-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div>
              <div className="text-white/70 text-xs font-medium mb-1">For Logged-In Shoppers</div>
              <h3 className="text-lg font-bold text-white mb-1">Get AI picks tailored just for you</h3>
              <p className="text-indigo-200 text-sm">Sign in to unlock Hybrid AI recommendations based on your browsing and purchase history.</p>
            </div>
            <button className="flex-shrink-0 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 whitespace-nowrap">Sign In</button>
          </div>
        </div>
      </div>
    </div>
  );
}
