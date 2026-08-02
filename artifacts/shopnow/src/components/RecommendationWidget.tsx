import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'wouter';
import {
  Activity,
  TrendingUp,
  Sparkles,
  ShoppingCart,
  RefreshCcw,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProductCard } from './ProductCard';
import {
  RecommendationWidget as RecommendationWidgetType,
  useAddToCart,
  getGetCartQueryKey,
  getGetHomepageRecommendationsQueryKey,
  getGetPdpRecommendationsQueryKey,
  getGetCartRecommendationsQueryKey,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { useUser } from '../context/UserContext';
import {
  onProductImageError,
  resolveProductImageSrc,
} from '../lib/product-image';

function useCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  const scroll = useCallback(
    (direction: 'left' | 'right') => {
      const el = scrollRef.current;
      if (!el) return;
      const cardWidth = el.querySelector(':scope > *')?.clientWidth ?? 260;
      el.scrollBy({
        left: direction === 'left' ? -cardWidth - 20 : cardWidth + 20,
        behavior: 'smooth',
      });
      setTimeout(checkScroll, 350);
    },
    [checkScroll],
  );

  return { scrollRef, canScrollLeft, canScrollRight, checkScroll, scroll };
}

interface RecommendationWidgetProps {
  widget: RecommendationWidgetType;
  variant: 'content_based' | 'collaborative' | 'hybrid';
}

export function RecommendationWidget({
  widget,
  variant,
}: RecommendationWidgetProps) {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const { userName } = useUser();

  if (!widget || !widget.products || widget.products.length === 0) return null;

  if (variant === 'hybrid') {
    // Render hybrid as a prominent purple gradient card
    const firstProduct = widget.products[0]?.product;
    const bundlePrice = widget.products.reduce(
      (acc, p) => acc + p.product.price,
      0,
    );
    const bundleOldPrice = widget.products.reduce(
      (acc, p) => acc + (p.product.originalPrice || p.product.price * 1.1),
      0,
    );
    const formattedBundlePrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(bundlePrice);
    const formattedBundleOldPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(bundleOldPrice);

    const [bundleAdding, setBundleAdding] = useState(false);
    const [bundleAdded, setBundleAdded] = useState(false);
    const [resetDone, setResetDone] = useState(false);

    const handleAddBundle = async () => {
      if (bundleAdding || bundleAdded) return;
      setBundleAdding(true);
      try {
        for (const p of widget.products) {
          await addToCart.mutateAsync({
            data: { productId: p.product.id, quantity: 1 },
          });
        }
        queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        setBundleAdded(true);
        setTimeout(() => setBundleAdded(false), 3000);
      } finally {
        setBundleAdding(false);
      }
    };

    const handleResetPreferences = () => {
      setResetDone(true);
      // Invalidate all recommendation caches to force a fresh fetch
      queryClient.invalidateQueries({
        queryKey: getGetHomepageRecommendationsQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getGetPdpRecommendationsQueryKey(firstProduct?.id ?? 0),
      });
      queryClient.invalidateQueries({
        queryKey: getGetCartRecommendationsQueryKey(),
      });
      setTimeout(() => setResetDone(false), 2500);
    };

    const cleanTitle = widget.title.replace(
      /Rahul's|Rahul/g,
      userName ? userName.split(' ')[0] : 'Your',
    );
    const cleanSubtitle = widget.subtitle.replace(
      /Rahul's|Rahul/g,
      userName ? userName.split(' ')[0] : 'your',
    );

    return (
      <div className="max-w-7xl mx-auto px-6 py-8" data-testid="widget-hybrid">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-900 via-[#2e1065] to-[#1e1b4b] p-[1px] relative shadow-2xl">
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

          <div className="bg-[#131127]/80 backdrop-blur-xl rounded-[15px] p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/30 rounded-full blur-[80px]"></div>

            <button
              onClick={handleResetPreferences}
              className={`absolute top-4 right-4 md:top-6 md:right-6 ${resetDone ? 'text-green-300 bg-green-500/20 border-green-500/30' : 'text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/30 border-purple-500/20'} p-2 rounded-full transition-colors flex items-center gap-2 text-xs font-medium border z-20 cursor-pointer`}
              title="Reset AI Preferences"
              data-testid="button-reset-preferences"
              disabled={resetDone}
            >
              {resetDone ? <Check size={14} /> : <RefreshCcw size={14} />}
              <span className="hidden sm:inline">
                {resetDone ? 'Preferences Reset' : 'Reset Preferences'}
              </span>
            </button>

            <div className="flex-1 relative z-10">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/20 px-3 py-1.5 rounded-full border border-purple-400/30 mb-6">
                <Sparkles size={14} /> AI Hybrid • Personalized for{' '}
                {userName ? userName.split(' ')[0] : 'You'}
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                {cleanTitle}
              </h2>
              <p className="text-indigo-200 mb-8 text-lg">{cleanSubtitle}</p>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button
                  onClick={handleAddBundle}
                  disabled={bundleAdding || bundleAdded}
                  className={`w-full sm:w-auto ${bundleAdded ? 'bg-green-600 hover:bg-green-600' : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500'} text-white px-8 py-3.5 rounded-lg font-bold shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-70`}
                  data-testid="button-add-bundle"
                >
                  {bundleAdded ? (
                    <>
                      <Check size={18} /> Bundle Added
                    </>
                  ) : bundleAdding ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{' '}
                      Adding...
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} /> Add Bundle to Cart
                    </>
                  )}
                </button>
                <span className="text-white font-medium">
                  {formattedBundlePrice}
                </span>
                <span className="text-indigo-300 line-through text-sm">
                  {formattedBundleOldPrice}
                </span>
                <span className="bg-green-500/20 text-green-300 text-xs font-bold px-2 py-1 rounded border border-green-500/20">
                  Save 10%
                </span>
              </div>
            </div>

            <div className="w-full md:w-[400px] relative z-10 bg-white/5 border border-white/10 p-6 rounded-xl">
              <div className="text-[11px] text-purple-300 font-semibold uppercase tracking-wider mb-3">
                Bundle includes
              </div>
              <div className="space-y-3">
                {widget.products.slice(0, 3).map((p, idx) => (
                  <Link
                    key={p.product.id}
                    href={`/product/${p.product.id}`}
                    className="flex items-center gap-3 group/item cursor-pointer"
                  >
                    <div className="w-14 h-14 bg-white rounded-lg shadow-lg overflow-hidden flex items-center justify-center p-1.5 shrink-0 group-hover/item:ring-2 group-hover/item:ring-indigo-400 transition-all">
                      <img
                        src={resolveProductImageSrc(p.product.imageUrl)}
                        alt={p.product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                        onError={onProductImageError}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate group-hover/item:text-indigo-300 transition-colors">
                        {p.product.name}
                      </div>
                      <div className="text-xs text-indigo-300">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                          maximumFractionDigits: 0,
                        }).format(p.product.price)}
                      </div>
                    </div>
                    {idx < Math.min(2, widget.products.length - 1) && (
                      <div className="w-5 h-5 bg-indigo-500/30 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-[10px] text-white font-bold">
                          +
                        </span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-purple-300">Bundle total</span>
                <span className="text-white font-bold">
                  {formattedBundlePrice}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isContentBased = variant === 'content_based';
  const headerBadgeClass = isContentBased
    ? 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-100 dark:border-blue-900/50'
    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/50';
  const Icon = isContentBased ? Activity : TrendingUp;
  const label = isContentBased
    ? 'Content-Based Filtering'
    : 'Collaborative Filtering';

  const { scrollRef, canScrollLeft, canScrollRight, checkScroll, scroll } =
    useCarousel();

  return (
    <div
      className="max-w-7xl mx-auto px-6 py-8"
      data-testid={`widget-${variant}`}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-1">
            {widget.title}
          </h2>
          <div
            className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${headerBadgeClass}`}
          >
            <Icon size={12} /> {label}
          </div>
        </div>
        {widget.products.length > 3 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 dark:border-slate-700 flex items-center justify-center text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {widget.products.map((rec) => (
          <div key={rec.product.id} className="snap-start">
            <ProductCard product={rec.product} reason={rec.reason} />
          </div>
        ))}
      </div>
    </div>
  );
}
