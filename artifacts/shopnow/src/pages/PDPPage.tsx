import React, { useState } from "react";
import { Link, useParams } from "wouter";
import { 
  Star, ShoppingCart, ChevronRight, Check,
  ShieldCheck, Truck, RotateCcw, CreditCard, Heart, 
  Sparkles, TrendingUp, Activity
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { RecommendationWidget } from "../components/RecommendationWidget";
import { useGetProduct, useGetPdpRecommendations, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function PDPPage() {
  const { id } = useParams();
  const productId = Number(id);
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  const { data: product, isLoading: isProductLoading } = useGetProduct(productId, { 
    query: { enabled: !!productId } 
  });
  
  const { data: pdpRecs, isLoading: isRecsLoading } = useGetPdpRecommendations(productId, {
    query: { enabled: !!productId }
  });

  const [activeColor, setActiveColor] = useState("Silver");
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (isProductLoading || !product) {
    return (
      <AppLayout activePage="pdp">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton className="w-full h-[500px]" />
        </div>
      </AppLayout>
    );
  }

  const images = [
    product.imageUrl || `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`,
    `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`,
    `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`,
    `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`,
  ];
  const activeImage = images[activeImageIdx];

  const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.price);
  const formattedOldPrice = product.originalPrice ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(product.originalPrice) : null;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const formattedSavings = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(savings);

  const handleAddToCart = () => {
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        }
      }
    );
  };

  return (
    <AppLayout activePage="pdp">
      <div className="bg-white min-h-screen pb-24">
        
        {/* Breadcrumb */}
        <div className="border-b border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center text-xs font-medium text-gray-500 gap-2">
            <Link href="/" className="hover:text-indigo-600 cursor-pointer">Home</Link>
            <ChevronRight size={12} />
            <span className="hover:text-indigo-600 cursor-pointer">{product.category}</span>
            <ChevronRight size={12} />
            <span className="hover:text-indigo-600 cursor-pointer">{product.brand}</span>
            <ChevronRight size={12} />
            <span className="text-gray-900 font-semibold">{product.name}</span>
          </div>
        </div>

        {/* Product Hero */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row gap-12">
            
            {/* Left: Gallery */}
            <div className="w-full md:w-1/2 flex flex-col gap-4">
              <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 border border-gray-100 relative group overflow-hidden">
                {product.isFeatured && (
                  <div className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-sm">
                    Best Seller
                  </div>
                )}
                <button className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 shadow-sm z-10 transition-colors">
                  <Heart size={20} />
                </button>
                <img src={activeImage.startsWith('http') || activeImage.startsWith('/') ? activeImage : `${import.meta.env.BASE_URL}${activeImage}`} alt={product.name} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="flex gap-4">
                {images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImageIdx(i)}
                    className={`w-20 h-20 rounded-xl bg-gray-50 border-2 flex items-center justify-center p-2 overflow-hidden ${activeImageIdx === i ? 'border-indigo-600' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img.startsWith('http') || img.startsWith('/') ? img : `${import.meta.env.BASE_URL}${img}`} className="w-full h-full object-contain mix-blend-multiply" />
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Info */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="mb-2">
                <span className="text-sm font-bold text-indigo-600 tracking-wider uppercase">{product.brand}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded">
                  <span className="text-sm font-bold text-amber-700">{product.rating}</span>
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                </div>
                <span className="text-sm font-medium text-blue-600 hover:underline cursor-pointer">{product.reviewCount} ratings</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-medium text-gray-600">89 answered questions</span>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100">
                <div className="flex items-end gap-3 mb-1">
                  <span className="text-3xl font-bold text-gray-900">{formattedPrice}</span>
                  {formattedOldPrice && (
                    <span className="text-lg text-gray-400 line-through mb-1">{formattedOldPrice}</span>
                  )}
                </div>
                {savings > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-green-600 font-bold">Save {formattedSavings} ({product.discountPct}%)</span>
                    <span className="text-gray-500">Inclusive of all taxes</span>
                  </div>
                )}
                <div className="mt-4 flex items-start gap-3 pt-4 border-t border-gray-200">
                  <CreditCard size={18} className="text-indigo-600 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">No Cost EMI starts at ₹10,416/month.</div>
                    <div className="text-xs text-blue-600 mt-1 cursor-pointer hover:underline">View EMI options</div>
                  </div>
                </div>
              </div>

              {product.specs && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Key Specs</h3>
                  <p className="text-sm text-gray-600">{product.specs}</p>
                </div>
              )}

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
                <div className={`text-sm font-bold mb-4 ${product.inStock ? 'text-green-700' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    className="flex-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-3.5 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 border border-indigo-200 disabled:opacity-50"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>
                  <button 
                    disabled={!product.inStock}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-lg shadow-md shadow-indigo-200 transition-colors disabled:opacity-50"
                  >
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

        {/* Product Tabs */}
        <div className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-100 mt-4">
          <div className="flex gap-8 border-b border-gray-200 mb-6">
            <button className="pb-3 border-b-2 border-indigo-600 text-indigo-600 font-bold text-sm">Description</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-500 font-medium text-sm hover:text-gray-900">Specifications</button>
            <button className="pb-3 border-b-2 border-transparent text-gray-500 font-medium text-sm hover:text-gray-900">Reviews</button>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600">
            <p>Experience unmatched performance with the {product.name}. Designed for professionals and creators, it features top-tier components ensuring smooth multitasking and rendering.</p>
            {product.specs && <p>{product.specs}</p>}
          </div>
        </div>

        {/* Recommendations */}
        {!isRecsLoading && pdpRecs && (
          <>
            <div className="max-w-7xl mx-auto px-6 pt-8">
               <RecommendationWidget widget={pdpRecs.hybrid} variant="hybrid" />
            </div>
            
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-xl font-bold text-gray-900">{pdpRecs.frequentlyBoughtTogether.title}</h2>
                <div className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  <TrendingUp size={12} /> Collaborative Filtering
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto">
                  
                  <div className="w-32 flex-shrink-0">
                    <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center p-4 relative shadow-sm">
                      <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center"><Check size={12} color="white" /></div>
                      <img src={product.imageUrl || `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div className="text-xs text-gray-500 font-medium mb-1">This item</div>
                    <div className="text-sm font-bold text-gray-900">{formattedPrice}</div>
                  </div>
                  
                  {pdpRecs.frequentlyBoughtTogether.products.slice(0,3).map((rec, i) => (
                    <React.Fragment key={rec.product.id}>
                      <div className="text-2xl text-gray-300 font-light">+</div>
                      <div className="w-32 flex-shrink-0">
                        <Link href={`/product/${rec.product.id}`}>
                          <div className="w-32 h-32 bg-white rounded-xl border border-gray-200 mb-3 flex items-center justify-center p-4 relative shadow-sm cursor-pointer hover:border-indigo-300">
                            <div className="absolute top-2 right-2 w-5 h-5 bg-indigo-600 rounded flex items-center justify-center"><Check size={12} color="white" /></div>
                            <img src={rec.product.imageUrl || `${import.meta.env.BASE_URL}images/mouse.jpg`} className="w-full h-full object-contain mix-blend-multiply" />
                          </div>
                        </Link>
                        <Link href={`/product/${rec.product.id}`}>
                          <div className="text-xs font-medium text-indigo-600 hover:underline cursor-pointer mb-1 truncate">{rec.product.name}</div>
                        </Link>
                        <div className="text-sm font-bold text-gray-900">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(rec.product.price)}</div>
                      </div>
                    </React.Fragment>
                  ))}
                </div>

                <div className="flex-1 bg-white p-5 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
                  <div className="text-sm text-gray-500 font-medium mb-1">Total price:</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
                      product.price + pdpRecs.frequentlyBoughtTogether.products.slice(0,3).reduce((acc, p) => acc + p.product.price, 0)
                    )}
                  </div>
                  <div className="text-xs text-green-600 font-bold bg-green-50 px-2 py-1 rounded inline-block mb-4">Bundle Savings: ₹1,200</div>
                  <button 
                    onClick={() => {
                      handleAddToCart();
                      pdpRecs.frequentlyBoughtTogether.products.slice(0,3).forEach(p => {
                        addToCart.mutate({ data: { productId: p.product.id, quantity: 1 } });
                      });
                      setTimeout(() => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }), 500);
                    }}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors"
                  >
                    Add All to Cart
                  </button>
                </div>
              </div>
            </div>

            <RecommendationWidget widget={pdpRecs.contentBased} variant="content_based" />
          </>
        )}

      </div>
    </AppLayout>
  );
}
