import React from "react";
import { AppLayout } from "./_shared/AppLayout";
import { 
  Trash2, Heart, ShieldCheck, Truck, ChevronRight, 
  Sparkles, Activity, TrendingUp, ShoppingBag
} from "lucide-react";

export function Cart() {
  return (
    <AppLayout activePage="cart" cartCount={2} isLoggedIn={true} userName="Rahul">
      <div className="bg-[#f8f9fb] min-h-screen pb-24">
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Left: Cart Items */}
            <div className="flex-1 flex flex-col gap-4">
              
              {/* Item 1 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex gap-5 shadow-sm">
                <div className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                  <img src="/__mockup/images/dell-xps-15.jpg" alt="Dell XPS 15" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">Dell XPS 15 (2023) - 15.6" OLED, i7, 16GB</h3>
                    <div className="font-bold text-xl text-gray-900 text-right">₹1,24,999</div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">Color: Silver | 512GB SSD</div>
                  <div className="text-xs text-green-700 font-bold mb-4 bg-green-50 px-2 py-1 rounded inline-flex self-start">In Stock</div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors">-</button>
                      <span className="font-semibold w-4 text-center text-sm">1</span>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors">+</button>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <button className="text-indigo-600 hover:underline flex items-center gap-1"><Heart size={14} /> Save for Later</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 size={14} /> Remove</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 flex gap-5 shadow-sm">
                <div className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                  <img src="/__mockup/images/mouse.jpg" alt="Logitech MX Master 3" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-lg text-gray-900 leading-tight">Logitech MX Master 3S Wireless Mouse</h3>
                    <div className="font-bold text-xl text-gray-900 text-right">₹8,499</div>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">Color: Graphite</div>
                  <div className="text-xs text-green-700 font-bold mb-4 bg-green-50 px-2 py-1 rounded inline-flex self-start">In Stock</div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors">-</button>
                      <span className="font-semibold w-4 text-center text-sm">1</span>
                      <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors">+</button>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                      <button className="text-indigo-600 hover:underline flex items-center gap-1"><Heart size={14} /> Save for Later</button>
                      <span className="text-gray-300">|</span>
                      <button className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"><Trash2 size={14} /> Remove</button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center"><Truck size={18} className="text-indigo-600" /></div>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Delivery to Mumbai 400001</div>
                    <div className="text-xs text-green-600 font-medium">Expected delivery: Tomorrow, 11 AM</div>
                  </div>
                </div>
                <button className="text-sm font-semibold text-indigo-600 hover:underline">Change</button>
              </div>

            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-[380px]">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-24">
                <div className="p-5 border-b border-gray-100">
                  <h2 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h2>
                  
                  <div className="space-y-3 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal (2 items)</span>
                      <span className="font-medium text-gray-900">₹1,33,498</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Discount (TECH20)</span>
                      <span className="font-medium text-green-600">−₹26,699</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-3 pb-1 mb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="font-bold text-2xl text-gray-900">₹1,06,799</span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-green-700 bg-green-50 p-2 rounded-lg text-center mb-6 border border-green-100">
                    🎉 You're saving ₹26,699 on this order!
                  </div>

                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200">
                    Proceed to Checkout <ChevronRight size={18} />
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4">
                  <div className="text-xs text-gray-500 font-medium mb-3 text-center">Accepted Payment Methods</div>
                  <div className="flex justify-center gap-2 mb-4">
                    {['EMI', 'UPI', 'Cards', 'NetBanking'].map(method => (
                      <div key={method} className="bg-white border border-gray-200 text-[10px] font-bold text-gray-600 px-2 py-1 rounded">
                        {method}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <ShieldCheck size={14} className="text-green-600" /> Secure Checkout
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                      <Truck size={14} className="text-indigo-600" /> Free Returns within 7 days
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Recommendations Section */}
          <div className="mt-16 space-y-12">
            
            {/* Rahul's Personal AI Picks (Hybrid) */}
            <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-2xl p-6 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white">Rahul's Personal AI Picks</h2>
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/30">
                  <Sparkles size={12} /> Hybrid AI • Personalized
                </div>
              </div>
              <p className="text-indigo-200 text-sm mb-6 relative z-10 max-w-2xl">
                Based on your browsing history and the items in your cart, we've curated these specific additions that perfectly match your tech profile.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                {[
                  { name: "Sony WH-1000XM5 Headset", price: "₹24,990", img: "/__mockup/images/headphones.jpg", reason: "Trending in your segment" },
                  { name: "Belkin 3-in-1 Wireless Charger", price: "₹12,499", img: "placeholder-charger", reason: "You viewed this recently" },
                  { name: "Moleskine Smart Notebook", price: "₹3,499", img: "placeholder-notebook", reason: "Editorial pick for professionals" },
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors cursor-pointer group flex items-center gap-4">
                    <div className="w-20 h-20 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center">
                      {item.img.startsWith('/') ? (
                        <img src={item.img} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="text-[10px] text-gray-400 font-bold text-center">Tech</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-purple-200 bg-purple-900/50 px-2 py-0.5 rounded inline-block mb-1 border border-purple-400/20">
                        {item.reason}
                      </div>
                      <h3 className="font-semibold text-white text-sm leading-tight mb-1 group-hover:text-purple-200 transition-colors">{item.name}</h3>
                      <div className="font-bold text-white">{item.price}</div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              
              {/* Complete Your Setup (Content-Based) */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Complete Your Setup</h2>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    <Activity size={10} /> Content-Based
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">Matched specifically to the Dell XPS 15 in your cart.</div>
                
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Anker USB-C Hub", price: "₹3,999", img: "/__mockup/images/usb-hub.jpg" },
                    { name: "Dell Pro Backpack 15", price: "₹2,499", img: "placeholder-bag" },
                    { name: "Aluminum Laptop Stand", price: "₹1,899", img: "placeholder-stand" },
                    { name: "Premium Screen Protector", price: "₹999", img: "placeholder-screen" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center p-1">
                        {item.img.startsWith('/') ? (
                          <img src={item.img} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <div className="text-[8px] text-gray-400 font-bold">Item</div>
                        )}
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="font-semibold text-gray-900 text-xs leading-tight mb-1 line-clamp-2">{item.name}</h3>
                        <div className="font-bold text-sm text-gray-900 mb-2">{item.price}</div>
                        <button className="text-xs text-indigo-600 font-semibold border border-indigo-200 rounded py-1 hover:bg-indigo-50 transition-colors w-full">
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequently Bought Together (Collaborative) */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Frequently Bought Together</h2>
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <TrendingUp size={10} /> Collaborative
                  </div>
                </div>
                <div className="text-xs text-gray-500 mb-4">Shoppers with a similar cart also bought these.</div>
                
                <div className="flex flex-col gap-3">
                  {[
                    { name: "Samsung T7 1TB Portable SSD", price: "₹7,499", img: "/__mockup/images/ssd.jpg", badge: "Limited Stock" },
                    { name: "Logitech Brio 4K Webcam", price: "₹14,995", img: "placeholder-webcam", badge: "" },
                    { name: "Leather Desk Mat & Cable Organizer", price: "₹2,299", img: "placeholder-mat", badge: "" }
                  ].map((item, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center p-1">
                        {item.img.startsWith('/') ? (
                          <img src={item.img} className="w-full h-full object-contain mix-blend-multiply" />
                        ) : (
                          <div className="text-[8px] text-gray-400 font-bold">Item</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">{item.name}</h3>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-900">{item.price}</span>
                          {item.badge && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded">{item.badge}</span>
                          )}
                        </div>
                      </div>
                      <button className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                        <span className="font-bold">+</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
