import React from "react";
import { Link } from "wouter";
import { Smartphone, Laptop, Headphones, Camera, Home, Gamepad2, Timer, Zap, ChevronRight } from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { RecommendationWidget } from "../components/RecommendationWidget";
import { AnonymousRecommendationWidget } from "../components/AnonymousRecommendationWidget";
import { useListProducts, useListDeals, useGetHomepageRecommendations, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";

export default function HomePage() {
  const queryClient = useQueryClient();
  const addToCart = useAddToCart();
  const { isLoggedIn } = useUser();

  const { data: featuredProducts } = useListProducts({ featured: true });
  const { data: deals } = useListDeals();
  const { data: homepageRecs } = useGetHomepageRecommendations({ userId: 1 });

  // Anonymous: pull mobiles and laptops from product list
  const { data: allProducts } = useListProducts();
  const trendingMobiles = (allProducts ?? []).filter((p) => p.category === "Mobiles").slice(0, 6);
  const laptopDeals = (allProducts ?? []).filter((p) => p.category === "Laptops").slice(0, 6);

  const handleAddToCart = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
      }
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  return (
    <AppLayout activePage="home">
      <div className="bg-white min-h-screen pb-24">

        {/* Category browsing strip */}
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
              <button
                key={cat.name}
                className="flex flex-col items-center gap-2 min-w-max group cursor-pointer"
                data-testid={`category-${cat.name}`}
              >
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
                src={`${import.meta.env.BASE_URL}images/hero-laptop.jpg`}
                alt="Premium Laptop"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent"></div>
            </div>

            <div className="relative z-10 p-12 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 border border-indigo-500/30">
                <Zap size={14} />
                <span>New Arrival</span>
              </div>
              <h1 className="text-5xl font-bold text-white mb-4 leading-tight">
                Power Meets <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                  Precision.
                </span>
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
        {deals && deals.length > 0 && (
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {deals.map((deal) => (
                <Link key={deal.id} href={`/product/${deal.id}`} className="block">
                  <div
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow bg-white relative group cursor-pointer h-full flex flex-col"
                    data-testid={`deal-${deal.id}`}
                  >
                    {deal.discountPct && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                        -{deal.discountPct}%
                      </div>
                    )}
                    <div className="h-40 bg-gray-50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={deal.imageUrl || `${import.meta.env.BASE_URL}images/galaxy-s23.jpg`}
                        alt={deal.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{deal.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold text-lg">{formatPrice(deal.price)}</span>
                      {deal.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">{formatPrice(deal.originalPrice)}</span>
                      )}
                    </div>
                    <div className="mt-auto">
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1">
                        <div className="bg-red-500 h-1.5 rounded-full" style={{ width: "80%" }}></div>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-500 mb-3">
                        <span>80% Claimed</span>
                      </div>
                      <button
                        onClick={(e) => handleAddToCart(e, deal.id)}
                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 rounded transition-colors text-sm"
                        data-testid={`btn-deal-cart-${deal.id}`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── LOGGED-IN: personalised AI widgets ─── */}
        {isLoggedIn && homepageRecs && (
          <>
            <RecommendationWidget widget={homepageRecs.contentBased} variant="content_based" />
            <RecommendationWidget widget={homepageRecs.hybrid} variant="hybrid" />
            <RecommendationWidget widget={homepageRecs.collaborative} variant="collaborative" />
          </>
        )}

        {/* ─── ANONYMOUS: editorial + popularity widgets ─── */}
        {!isLoggedIn && (
          <>
            {trendingMobiles.length > 0 && (
              <AnonymousRecommendationWidget
                title="Top Trending Mobiles"
                subtitle="Most popular handsets this week across India"
                badge="Popularity-Based"
                badgeVariant="trending"
                products={trendingMobiles}
              />
            )}

            {laptopDeals.length > 0 && (
              <AnonymousRecommendationWidget
                title="Best Laptop Deals Right Now"
                subtitle="Handpicked by our editors — top value for your budget"
                badge="Editorial Pick"
                badgeVariant="editorial"
                products={laptopDeals}
              />
            )}

            {/* Sign-in nudge card */}
            <div className="max-w-7xl mx-auto px-6 py-8">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
                <div>
                  <div className="text-white/70 text-sm font-medium mb-1">Unlock Personalised Recommendations</div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Sign in for your AI-powered shopping feed
                  </h3>
                  <p className="text-indigo-200 text-sm max-w-md">
                    Get picks tailored to your browsing history, past purchases, and preferences — powered by Content-Based, Collaborative, and Hybrid AI.
                  </p>
                </div>
                <button
                  className="flex-shrink-0 bg-white text-indigo-700 font-bold px-8 py-3.5 rounded-xl shadow-lg hover:bg-indigo-50 transition-colors whitespace-nowrap"
                  data-testid="btn-signin-nudge"
                  onClick={() => {
                    // trigger context toggle via the nav; scrolling up is UX hint
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  Sign In to ShopNow
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </AppLayout>
  );
}
