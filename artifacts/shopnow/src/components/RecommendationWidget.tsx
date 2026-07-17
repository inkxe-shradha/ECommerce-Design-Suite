import React from "react";
import { Link } from "wouter";
import { Activity, TrendingUp, Sparkles, ShoppingCart } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { RecommendationWidget as RecommendationWidgetType, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface RecommendationWidgetProps {
  widget: RecommendationWidgetType;
  variant: 'content_based' | 'collaborative' | 'hybrid';
}

export function RecommendationWidget({ widget, variant }: RecommendationWidgetProps) {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  if (!widget || !widget.products || widget.products.length === 0) return null;

  if (variant === 'hybrid') {
    // Render hybrid as a prominent purple gradient card
    const firstProduct = widget.products[0]?.product;
    const bundlePrice = widget.products.reduce((acc, p) => acc + p.product.price, 0);
    const bundleOldPrice = widget.products.reduce((acc, p) => acc + (p.product.originalPrice || p.product.price * 1.1), 0);
    const formattedBundlePrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bundlePrice);
    const formattedBundleOldPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(bundleOldPrice);

    const handleAddBundle = () => {
      widget.products.forEach(p => {
        addToCart.mutate(
          { data: { productId: p.product.id, quantity: 1 } },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
            }
          }
        );
      });
    };

    return (
      <div className="max-w-7xl mx-auto px-6 py-8" data-testid="widget-hybrid">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-[#2e1065] to-[#1e1b4b] p-[1px] relative shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>
          
          <div className="bg-[#131127]/80 backdrop-blur-xl rounded-[15px] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]"></div>
            
            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30 mb-6">
                <Sparkles size={14} /> AI Hybrid • Personalized for Rahul
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {widget.title}
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">
                {widget.subtitle}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button 
                  onClick={handleAddBundle}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
                  data-testid="button-add-bundle"
                >
                  <ShoppingCart size={18} />
                  Add Bundle to Cart
                </button>
                <span className="text-white font-medium">{formattedBundlePrice}</span>
                <span className="text-indigo-300 line-through text-sm">{formattedBundleOldPrice}</span>
                <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded border border-green-500/20">Save 10%</span>
              </div>
            </div>
            
            <div className="w-full md:w-[400px] relative z-10 bg-white/5 border border-white/10 p-6 rounded-xl flex items-center justify-center gap-4">
              <div className="flex flex-col gap-2 items-center">
                {widget.products.slice(0, 3).map((p, idx) => (
                  <React.Fragment key={p.product.id}>
                    <div className="w-16 h-16 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-2">
                      <img src={p.product.imageUrl || `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`} alt={p.product.name} className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    {idx < Math.min(2, widget.products.length - 1) && (
                      <div className="w-4 h-4 bg-indigo-500/30 rounded-full flex items-center justify-center"><span className="text-[10px] text-white font-bold">+</span></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex-1 bg-black/40 rounded-lg p-4 border border-white/5">
                <ul className="text-xs text-gray-300 space-y-3">
                  {widget.products.slice(0, 3).map((p, idx) => (
                    <li key={p.product.id} className={`flex justify-between ${idx < 2 ? 'border-b border-white/5 pb-2' : ''}`}>
                      <span className="truncate w-32">{p.product.name}</span> 
                      <span className="text-white whitespace-nowrap">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p.product.price)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isContentBased = variant === 'content_based';
  const headerBadgeClass = isContentBased 
    ? "text-blue-700 bg-blue-50 border-blue-100" 
    : "text-emerald-700 bg-emerald-50 border-emerald-100";
  const Icon = isContentBased ? Activity : TrendingUp;
  const label = isContentBased ? "Content-Based Filtering" : "Collaborative Filtering";

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" data-testid={`widget-${variant}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{widget.title}</h2>
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${headerBadgeClass}`}>
            <Icon size={12} /> {label}
          </div>
        </div>
      </div>
      
      <div className="flex gap-5 overflow-x-auto pb-4 hide-scrollbar">
        {widget.products.map((rec) => (
          <ProductCard 
            key={rec.product.id} 
            product={rec.product} 
            reason={rec.reason} 
          />
        ))}
      </div>
    </div>
  );
}
