import React from "react";
import { Link } from "wouter";
import { TrendingUp, BookOpen, Star, ShoppingCart } from "lucide-react";
import { Product, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AnonymousWidgetProps {
  title: string;
  subtitle: string;
  badge: string;
  badgeVariant: "trending" | "editorial";
  products: Product[];
}

export function AnonymousRecommendationWidget({
  title,
  subtitle,
  badge,
  badgeVariant,
  products,
}: AnonymousWidgetProps) {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();

  if (!products || products.length === 0) return null;

  const isTrending = badgeVariant === "trending";
  const badgeClass = isTrending
    ? "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/60 border-orange-200 dark:border-orange-900/50"
    : "text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-900/50";
  const Icon = isTrending ? TrendingUp : BookOpen;

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8" data-testid={`anon-widget-${badgeVariant}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">{title}</h2>
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${badgeClass}`}
          >
            <Icon size={12} /> {badge}
          </div>
        </div>
        <p className="text-sm text-gray-500 dark:text-slate-400 hidden md:block">{subtitle}</p>
      </div>

      <div className="flex gap-5 overflow-x-auto pb-4" style={{ scrollbarWidth: "none" }}>
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex-shrink-0 w-52 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-lg dark:hover:shadow-indigo-500/5 transition-all cursor-pointer group flex flex-col"
            data-testid={`anon-product-${product.id}`}
          >
            <div className="relative mb-3">
              {product.discountPct && (
                <div className="absolute top-1 left-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded z-10">
                  -{product.discountPct}%
                </div>
              )}
              <div className="h-36 bg-gray-50 dark:bg-slate-800/80 rounded-lg flex items-center justify-center overflow-hidden p-2">
                <img
                  src={product.imageUrl || `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`}
                  alt={product.name}
                  className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            <div className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              {product.brand}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100 leading-tight mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center gap-1 mb-2">
              <Star size={11} className="text-amber-500 fill-amber-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-slate-300">{product.rating}</span>
              <span className="text-[10px] text-gray-400 dark:text-slate-500">({product.reviewCount.toLocaleString()})</span>
            </div>

            <div className="flex items-baseline gap-2 mb-3 mt-auto">
              <span className="font-bold text-gray-900 dark:text-indigo-400">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 dark:text-slate-500 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            <button
              onClick={(e) => handleAddToCart(e, product.id)}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold text-xs py-2 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/50"
              data-testid={`btn-add-anon-${product.id}`}
            >
              <ShoppingCart size={12} /> Add to Cart
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
