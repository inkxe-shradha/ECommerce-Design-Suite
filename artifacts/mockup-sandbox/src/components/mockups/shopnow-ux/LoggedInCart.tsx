export function LoggedInCart() {
  const cartItems = [
    { id: 1, name: "Dell XPS 15 Laptop", brand: "Dell", category: "Laptops", price: 124999, qty: 1, img: "/__mockup/images/dell-xps-15.jpg" },
    { id: 2, name: "Logitech MX Master 3S Mouse", brand: "Logitech", category: "Accessories", price: 8499, qty: 1, img: "/__mockup/images/mouse.jpg" },
  ];
  const hybrid = [
    { id: 6, name: "Sony WH-1000XM5", price: 24990, img: "/__mockup/images/sony-headphones.jpg", reason: "You viewed this" },
    { id: 8, name: "iPad Air (M1)", price: 49900, img: "/__mockup/images/ipad-air.jpg", reason: "Trending in your segment" },
    { id: 11, name: "AirPods Pro (2nd Gen)", price: 24900, img: "/__mockup/images/headphones.jpg", reason: "Editorial pick" },
  ];
  const crossSell = [
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg", reason: "Pairs with Dell XPS 15" },
    { id: 5, name: "Samsung T7 SSD 1TB", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg", reason: "Compatible accessory" },
    { id: 3, name: "Bellroy Laptop Sleeve", brand: "Bellroy", price: 4299, img: "/__mockup/images/sleeve.jpg", reason: "Great with your laptop" },
    { id: 7, name: "Apple AirPods Pro", brand: "Apple", price: 24900, img: "/__mockup/images/headphones.jpg", reason: "Often added to similar carts" },
  ];
  const collaborative = [
    { id: 4, name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: 3999, img: "/__mockup/images/usb-hub.jpg", reason: "Trending in your segment" },
    { id: 5, name: "Samsung T7 SSD 1TB", brand: "Samsung", price: 7499, img: "/__mockup/images/ssd.jpg", reason: "Popular with similar carts" },
    { id: 6, name: "Sony WH-1000XM5", brand: "Sony", price: 24990, img: "/__mockup/images/sony-headphones.jpg", reason: "Limited stock — popular item" },
  ];
  const subtotal = cartItems.reduce((a, i) => a + i.price * i.qty, 0);
  const discount = Math.round(subtotal * 0.2);
  const total = subtotal - discount;
  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-[#f8f9fb] font-sans">
      <div className="bg-[#1a1a2e] text-[#e0e0ff] text-[13px] py-1.5 text-center">
        🎉 Free shipping on orders over ₹999 &nbsp;|&nbsp; Use code <strong>TECH20</strong> for 20% off
      </div>
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
            <div className="w-[36px] h-[36px] rounded-lg bg-indigo-500 border border-indigo-500 flex items-center justify-center text-white">🛒</div>
            <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">2</div>
          </div>
        </div>
      </header>

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
                <div className="flex justify-center gap-2 mb-2">
                  {["EMI", "UPI", "Cards", "NetBanking"].map(m => (
                    <div key={m} className="bg-white border border-gray-200 text-[10px] font-bold text-gray-600 px-2 py-1 rounded">{m}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Logged-in recommendations */}
        <div className="mt-14 space-y-10">

          {/* Hybrid AI Picks — purple banner */}
          <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="flex items-center gap-3 mb-5 relative z-10">
              <h2 className="text-xl font-bold text-white">Rahul's Personal AI Picks</h2>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/30">
                ✨ Hybrid AI • Personalized
              </div>
            </div>
            <p className="text-indigo-200 text-sm mb-6 relative z-10">Based on your browsing and purchase history</p>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              {hybrid.map(p => (
                <div key={p.id} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center gap-3 group hover:bg-white/15 transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center">
                    <img src={p.img} alt={p.name} className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-purple-200 bg-purple-900/50 px-2 py-0.5 rounded inline-block mb-1 border border-purple-400/20 truncate max-w-full">{p.reason}</div>
                    <h3 className="font-semibold text-white text-xs leading-tight mb-1 line-clamp-2">{p.name}</h3>
                    <div className="font-bold text-white text-sm">{fmt(p.price)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Content-Based + Collaborative side by side */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Complete Your Setup (Content-Based) */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Complete Your Setup</h2>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">⚡ Content-Based</div>
              </div>
              <p className="text-xs text-gray-500 mb-4">You might also need these with your cart</p>
              <div className="grid grid-cols-2 gap-3">
                {crossSell.map(p => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-3 flex gap-2 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gray-50 rounded flex items-center justify-center p-1 flex-shrink-0">
                      <img src={p.img} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <h3 className="font-semibold text-gray-900 text-xs leading-tight mb-1 line-clamp-2">{p.name}</h3>
                      <div className="font-bold text-xs text-gray-900 mb-1">{fmt(p.price)}</div>
                      <div className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded truncate">{p.reason}</div>
                      <button className="mt-2 text-xs text-indigo-600 font-semibold border border-indigo-200 rounded py-1 hover:bg-indigo-50 w-full">Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Frequently Bought Together (Collaborative) */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-lg font-bold text-gray-900">Frequently Bought Together</h2>
                <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">📊 Collaborative</div>
              </div>
              <p className="text-xs text-gray-500 mb-4">Shoppers with a similar cart also bought these</p>
              <div className="flex flex-col gap-3">
                {collaborative.map(p => (
                  <div key={p.id} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="w-14 h-14 bg-gray-50 rounded flex items-center justify-center p-1 flex-shrink-0">
                      <img src={p.img} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{p.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">{fmt(p.price)}</span>
                        <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded truncate max-w-[100px]">{p.reason}</span>
                      </div>
                    </div>
                    <button className="bg-indigo-50 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-indigo-100 flex-shrink-0 font-bold">+</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
