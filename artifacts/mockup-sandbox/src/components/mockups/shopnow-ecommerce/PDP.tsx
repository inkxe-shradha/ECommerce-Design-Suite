import React, { useState } from "react";
import { AppLayout } from "./_shared/AppLayout";
import { 
  Star, ShoppingCart, ChevronRight, Check,
  ShieldCheck, Truck, RotateCcw, CreditCard, Heart, Share2, 
  Sparkles, TrendingUp, Activity
} from "lucide-react";

export function PDP() {
  const [activeImage, setActiveImage] = useState("/__mockup/images/dell-xps-15.jpg");
  const [activeColor, setActiveColor] = useState("Silver");
  
  const images = [
    "/__mockup/images/dell-xps-15.jpg",
    "placeholder-1",
    "placeholder-2",
    "placeholder-3"
  ];

  return (
    <AppLayout activePage="pdp" cartCount={2} isLoggedIn={true} userName="Rahul">
      <div className="bg-white min-h-screen pb-24">
        
        {/* Breadcrumb */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center text-xs font-medium text-gray-500 gap-2">
            <span className="hover:text-indigo-600 cursor-pointer">Home</span>
            <ChevronRight size={12} />
            <span className="hover:text-indigo-600 cursor-pointer">Laptops</span>
            <ChevronRight size={12} />
            <span className="hover:text-indigo-600 cursor-pointer">Dell</span>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-semibold">Dell XPS 15</span>
          </div>
        </div>

        {/* Product Hero */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Left: Gallery */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 border border-gray-100 relative group overflow-hidden">
                <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                  Best Seller
                </div>
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm z-10 transition-colors">
                  <Heart size={20} />
                </button>
                {activeImage.startsWith('/') ? (
                  <img src={activeImage} alt="Dell XPS 15" className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="text-gray-300 font-bold">Image Placeholder</div>
                )}
              </div>
              <div className="flex gap-4">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 rounded-xl bg-gray-50 border-2 flex items-center justify-center p-2 overflow-hidden ${activeImage === img ? 'border-indigo-600' : 'border-transparent hover:border-gray-200'}`}
                  >
                    {img.startsWith('/') ? (
                      <img src={img} className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Thumb</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="mb-2">
                <span className="text-sm font-bold text-indigo-600 tracking-wider uppercase">Dell</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                Dell XPS 15 (2023) - 15.6" OLED 3.5K Touch, 12th Gen Intel Core i7, 16GB RAM, 512GB SSD
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                  <span className="text-sm font-bold text-amber-700">4.6</span>
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                </div>
                <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">2,847 ratings</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-medium text-gray-600">89 answered questions</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-bold text-gray-900">₹1,24,999</span>
                  <span className="text-lg text-gray-400 line-through mb-1">₹1,45,999</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-bold">Save ₹21,000 (14%)</span>
                  <span className="text-gray-500">Inclusive of all taxes</span>
                </div>
                <div className="mt-4 flex items-start gap-3 pt-4 border-t border-gray-200">
                  <CreditCard size={18} className="text-indigo-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">No Cost EMI starts at ₹10,416/month.</div>
                    <div className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">View EMI options</div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Color: <span className="text-gray-500">{activeColor}</span></h3>
                <div className="flex gap-3">
                  {['Silver', 'Black'].map(color => (
                    <button 
                      key={color}
                      onClick={() => setActiveColor(color)}
                      className={`w-12 h-12 rounded-full border-2 p-1 ${activeColor === color ? 'border-indigo-600' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-full h-full rounded-full ${color === 'Silver' ? 'bg-gray-200' : 'bg-gray-800'}`}></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8 bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-4">
                  <Truck size={20} className="text-gray-700" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">Deliver to <span className="font-bold">Mumbai 400001</span></div>
                    <div className="text-sm text-green-600 font-bold mt-1">FREE Delivery by Tomorrow, 11 AM</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-green-700 mb-4">In Stock</div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 border border-indigo-200">
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-md shadow-indigo-200 transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>

              <div className="flex gap-6 border-t border-gray-100 pt-6">
                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                  <ShieldCheck size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium leading-tight">1 Year<br/>Warranty</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                  <RotateCcw size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium leading-tight">7 Days<br/>Replacement</span>
                </div>
                <div className="flex flex-col items-center gap-2 flex-1 text-center">
                  <Truck size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-500 font-medium leading-tight">ShopNow<br/>Delivered</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Rahul's AI Bundle Suggestion card */}
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="bg-gradient-to-r from-[#1e1b4b] to-[#312e81] rounded-2xl p-1 relative overflow-hidden shadow-lg">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
            <div className="bg-[#1e1b4b] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
              
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 mb-3">
                  <Sparkles size={14} /> Hybrid AI Recommendation
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Upgrading for work, Rahul? Here's your kit.</h3>
                <p className="text-indigo-200 text-sm">We noticed you usually buy premium accessories. Complete your XPS setup with these top-rated matches.</p>
              </div>

              <div className="flex items-center gap-3 bg-black/30 p-4 rounded-xl border border-white/5">
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2"><img src="/__mockup/images/dell-xps-15.jpg" className="w-full h-full object-contain" /></div>
                <span className="text-white font-bold">+</span>
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2"><img src="/__mockup/images/mouse.jpg" className="w-full h-full object-contain" /></div>
                <span className="text-white font-bold">+</span>
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center p-2"><img src="/__mockup/images/sleeve.jpg" className="w-full h-full object-contain" /></div>
                
                <div className="ml-4 pl-4 border-l border-white/10 flex flex-col items-center">
                  <div className="text-white font-bold text-lg">₹1,36,797</div>
                  <div className="text-green-400 text-xs font-bold mb-2">Save ₹5,000</div>
                  <button className="bg-white text-indigo-900 text-xs font-bold py-2 px-4 rounded-md hover:bg-gray-100 transition-colors whitespace-nowrap shadow-md">
                    Add Bundle
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Frequently Bought Together (Collaborative) */}
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-100 mt-4">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Frequently Bought Together</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              <TrendingUp size={12} /> Collaborative Filtering
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
              
              <div className="w-32 flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center p-4 relative shadow-sm">
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center"><Check size={12} color="white" /></div>
                  <img src="/__mockup/images/dell-xps-15.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="text-xs text-gray-500 font-medium mb-1">This item</div>
                <div className="text-sm font-bold text-gray-900">₹1,24,999</div>
              </div>
              
              <div className="text-2xl text-gray-300 font-light">+</div>

              <div className="w-32 flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center p-4 relative shadow-sm cursor-pointer hover:border-indigo-300">
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center"><Check size={12} color="white" /></div>
                  <img src="/__mockup/images/mouse.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer mb-1 truncate">Dell Wireless Mouse</div>
                <div className="text-sm font-bold text-gray-900">₹2,499</div>
              </div>

              <div className="text-2xl text-gray-300 font-light">+</div>

              <div className="w-32 flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center p-4 relative shadow-sm cursor-pointer hover:border-indigo-300">
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center"><Check size={12} color="white" /></div>
                  <img src="/__mockup/images/sleeve.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer mb-1 truncate">Dell Laptop Sleeve</div>
                <div className="text-sm font-bold text-gray-900">₹1,299</div>
              </div>

              <div className="text-2xl text-gray-300 font-light">+</div>

              <div className="w-32 flex-shrink-0">
                <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center p-4 relative shadow-sm cursor-pointer hover:border-indigo-300">
                  <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center"><Check size={12} color="white" /></div>
                  <img src="/__mockup/images/ssd.jpg" className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer mb-1 truncate">External SSD 1TB</div>
                <div className="text-sm font-bold text-gray-900">₹7,499</div>
              </div>

            </div>

            <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
              <div className="text-sm text-gray-500 font-medium mb-1">Total price:</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">₹1,36,296</div>
              <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block mb-4">Bundle Savings: ₹1,200</div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors">
                Add All 4 to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Complete Your Mobile Setup (Content-Based) */}
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900">Complete Your Setup</h2>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              <Activity size={12} /> Content-Based • Matching attributes
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Anker USB-C Hub 8-in-1", price: "₹3,999", img: "/__mockup/images/usb-hub.jpg", match: "Matches USB-C ports" },
              { name: "Ergonomic Aluminum Stand", price: "₹2,199", img: "placeholder-stand", match: "Fits 15.6\" Laptops" },
              { name: "Keychron K2 Wireless", price: "₹7,499", img: "placeholder-kb", match: "Matches Bluetooth 5.2" },
              { name: "Screen Cleaner Kit", price: "₹499", img: "placeholder-cleaner", match: "For OLED screens" },
            ].map((product, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow cursor-pointer group">
                <div className="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center p-2">
                  {product.img.startsWith('/') ? (
                    <img src={product.img} className="w-full h-full object-contain mix-blend-multiply" />
                  ) : (
                    <div className="text-gray-300 text-xs font-bold">Accessory</div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1 leading-tight group-hover:text-indigo-600">{product.name}</h3>
                <div className="font-bold text-gray-900 mb-2">{product.price}</div>
                <div className="text-[10px] text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-3">
                  {product.match}
                </div>
                <button className="w-full border border-gray-300 hover:border-indigo-600 hover:text-indigo-600 text-gray-700 font-semibold py-1.5 rounded transition-colors text-sm">
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
