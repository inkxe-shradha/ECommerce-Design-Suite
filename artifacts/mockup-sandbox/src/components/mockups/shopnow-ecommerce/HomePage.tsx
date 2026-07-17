import React from "react";
import { AppLayout } from "./_shared/AppLayout";
import { 
  Star, ShoppingCart, Smartphone, Laptop, Headphones, 
  Camera, Home, Gamepad2, Timer, Zap, ChevronRight,
  TrendingUp, Activity, Sparkles, Cpu
} from "lucide-react";

export function HomePage() {
  return (
    <AppLayout activePage="home" cartCount={2} isLoggedIn={true} userName="Rahul">
      <div className="bg-white min-h-screen pb-24">
        
        {/* Category browsing strips */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between overflow-x-auto gap-8">
            {[
              { name: "Mobiles", icon: Smartphone },
              { name: "Laptops", icon: Laptop },
              { name: "Audio", icon: Headphones },
              { name: "Cameras", icon: Camera },
              { name: "Smart Home", icon: Home },
              { name: "Gaming", icon: Gamepad2 },
            ].map((cat) => (
              <button key={cat.name} className="flex flex-col items-center gap-2 min-w-max group cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-gray-100">
                  <cat.icon size={20} className="text-gray-600 group-hover:text-indigo-600" />
                </div>
                <span className="text-xs font-medium text-gray-600 group-hover:text-indigo-600">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="relative rounded-2xl overflow-hidden bg-[#0f1115] h-[400px] flex items-center">
            <div className="absolute inset-0 z-0">
              <img 
                src="/__mockup/images/hero-laptop.jpg" 
                alt="Premium Laptop" 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            </div>
            
            <div className="relative z-10 p-12 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 border border-indigo-500/30">
                <Sparkles size={14} />
                <span>New Arrival</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Power Meets <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Precision.</span>
              </h1>
              <p className="text-gray-300 mb-8 text-lg">
                The all-new Pro Series is here. Unmatched performance for creators and professionals.
              </p>
              <div className="flex items-center gap-4">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-500/25">
                  Shop Now <ChevronRight size={18} />
                </button>
                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-lg font-semibold transition-colors backdrop-blur-sm">
                  View Specs
                </button>
              </div>
              
              <div className="flex items-center gap-6 mt-10 text-xs text-gray-400 font-medium">
                <div className="flex items-center gap-1.5"><Zap size={14} className="text-green-400" /> Free delivery</div>
                <div className="flex items-center gap-1.5"><Zap size={14} className="text-green-400" /> 1-year warranty</div>
                <div className="flex items-center gap-1.5"><Zap size={14} className="text-green-400" /> Easy returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Deals */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Timer size={24} className="text-red-500" /> 
              Top Deals in Electronics
            </h2>
            <div className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-md">
              Ends in: 04h 23m 15s
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: "Galaxy S23 Ultra", price: "₹89,999", old: "₹1,24,999", off: "28%", img: "Smartphone" },
              { name: "Sony WH-1000XM5", price: "₹24,990", old: "₹34,990", off: "29%", img: "Headphones" },
              { name: "iPad Air (M1)", price: "₹49,900", old: "₹59,900", off: "16%", img: "Laptop" },
              { name: "Smart TV 4K 55\"", price: "₹36,990", old: "₹54,990", off: "32%", img: "MonitorPlay" },
            ].map((deal, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white relative group cursor-pointer">
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                  -{deal.off}
                </div>
                <div className="h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
                  <Cpu size={48} className="text-gray-300" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{deal.name}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg">{deal.price}</span>
                  <span className="text-xs text-gray-400 line-through">{deal.old}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                  <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "80%" }}></div>
                </div>
                <div className="text-[10px] text-gray-500">80% Claimed</div>
              </div>
            ))}
          </div>
        </div>

        {/* Based on Your Interests (Content-Based) */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Based on Your Interests</h2>
              <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                <Activity size={12} /> AI-Powered • Content-Based
              </div>
            </div>
            <button className="text-indigo-600 text-sm font-semibold hover:underline">View all</button>
          </div>
          
          <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar">
            {[
              { name: "Dell XPS 15 Laptop", brand: "Dell", price: "₹1,24,999", rating: 4.6, img: "/__mockup/images/dell-xps-15.jpg", reason: "Similar to your browsing" },
              { name: "Logitech MX Master 3S", brand: "Logitech", price: "₹8,499", rating: 4.8, img: "/__mockup/images/mouse.jpg", reason: "Matches Laptops" },
              { name: "Premium Laptop Sleeve", brand: "Bellroy", price: "₹4,299", rating: 4.5, img: "/__mockup/images/sleeve.jpg", reason: "Frequently viewed" },
              { name: "Anker USB-C Hub 8-in-1", brand: "Anker", price: "₹3,999", rating: 4.4, img: "/__mockup/images/usb-hub.jpg", reason: "Accessory match" },
              { name: "Keychron K2 V2", brand: "Keychron", price: "₹7,499", rating: 4.7, img: "kb", reason: "Similar to your browsing" },
            ].map((product, i) => (
              <div key={i} className="min-w-[240px] border border-gray-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all bg-white group cursor-pointer flex flex-col">
                <div className="h-40 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden relative">
                  {product.img.startsWith('/') ? (
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover mix-blend-multiply" />
                  ) : (
                    <Laptop size={40} className="text-gray-300" />
                  )}
                  <button className="absolute bottom-2 right-2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50">
                    <ShoppingCart size={14} className="text-gray-700" />
                  </button>
                </div>
                <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">{product.brand}</div>
                <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1 line-clamp-2">{product.name}</h3>
                
                <div className="flex items-center gap-1 mb-2">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span className="text-xs font-medium text-gray-700">{product.rating}</span>
                </div>
                
                <div className="mt-auto">
                  <div className="font-bold text-lg mb-3">{product.price}</div>
                  <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
                    {product.reason}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended For You AI Card (Hybrid) */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-[#2e1065] to-[#1e1b4b] p-[1px] relative shadow-2xl">
            {/* Glossy overlay */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
            
            <div className="bg-[#131127]/80 backdrop-blur-xl rounded-[15px] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
              {/* Decorative blur */}
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]"></div>
              
              <div className="flex-1 relative z-10">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30 mb-6">
                  <Sparkles size={14} /> AI Hybrid • Personalized for Rahul
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Complete Your Work-From-Home Setup
                </h2>
                <p className="text-indigo-200 mb-8 text-lg">
                  Based on your recent search for performance laptops, we built this tailored ecosystem for maximum productivity.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <button className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2">
                    <ShoppingCart size={18} />
                    Add Bundle to Cart
                  </button>
                  <span className="text-white font-medium">₹1,34,997</span>
                  <span className="text-indigo-300 line-through text-sm">₹1,50,000</span>
                  <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded border border-green-500/20">Save 10%</span>
                </div>
              </div>
              
              <div className="w-full md:w-[400px] relative z-10 bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-center gap-4">
                <div className="flex flex-col gap-2 items-center">
                  <div className="w-20 h-20 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-2">
                    <img src="/__mockup/images/dell-xps-15.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="w-4 h-4 bg-indigo-500/30 rounded-full flex items-center justify-center"><span className="text-[10px] text-white font-bold">+</span></div>
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-2">
                    <img src="/__mockup/images/mouse.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                  <div className="w-4 h-4 bg-indigo-500/30 rounded-full flex items-center justify-center"><span className="text-[10px] text-white font-bold">+</span></div>
                  <div className="w-16 h-16 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-2">
                    <img src="/__mockup/images/sleeve.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                  </div>
                </div>
                <div className="flex-1 bg-black/40 rounded-lg p-4 border border-white/5">
                  <ul className="text-xs text-gray-300 space-y-3">
                    <li className="flex justify-between border-b border-white/5 pb-2"><span>Dell XPS 15</span> <span className="text-white">₹1,24,999</span></li>
                    <li className="flex justify-between border-b border-white/5 pb-2"><span>MX Master 3S</span> <span className="text-white">₹8,499</span></li>
                    <li className="flex justify-between"><span>Premium Sleeve</span> <span className="text-white">₹4,299</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Among Similar Shoppers (Collaborative Filtering) */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Trending Among Similar Shoppers</h2>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <TrendingUp size={12} /> Collaborative Filtering
                </div>
                <span className="text-xs text-gray-500 font-medium">Based on shoppers like you</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Samsung T7 1TB Portable SSD", price: "₹7,499", img: "/__mockup/images/ssd.jpg", stock: "Only 4 left" },
              { name: "Apple Watch SE (Gen 2)", price: "₹24,900", img: "smartwatch", stock: "" },
              { name: "Sony WH-1000XM5 Headphones", price: "₹24,990", img: "/__mockup/images/headphones.jpg", stock: "" },
              { name: "Razer DeathAdder V3", price: "₹6,999", img: "mouse", stock: "High demand" },
            ].map((product, i) => (
              <div key={i} className="flex gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center p-2 relative">
                  {product.img.startsWith('/') ? (
                    <img src={product.img} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <Zap size={24} className="text-gray-300" />
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{product.name}</h3>
                  <div className="font-bold text-gray-900 mb-2">{product.price}</div>
                  {product.stock && (
                    <div className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded self-start">
                      {product.stock}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
