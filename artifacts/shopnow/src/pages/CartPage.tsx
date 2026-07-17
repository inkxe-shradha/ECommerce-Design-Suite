import React from "react";
import { Link } from "wouter";
import {
  Trash2, Heart, ShieldCheck, Truck, ChevronRight,
  Sparkles, Activity, TrendingUp, ShoppingBag,
  ShoppingCart
} from "lucide-react";
import { AppLayout } from "../components/AppLayout";
import { AnonymousRecommendationWidget } from "../components/AnonymousRecommendationWidget";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, useGetCartRecommendations, useAddToCart, useListProducts, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "../context/UserContext";

export default function CartPage() {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useUser();
  const { data: cart, isLoading: isCartLoading } = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const { data: cartRecs } = useGetCartRecommendations();

  const updateCartItem = useUpdateCartItem();
  const removeFromCart = useRemoveFromCart();
  const addToCart = useAddToCart();

  // For anonymous cross-sell: chargers, headphones, accessories
  const { data: allProducts } = useListProducts();
  const crossSellProducts = (allProducts ?? [])
    .filter((p) => ["Accessories", "Audio"].includes(p.category))
    .slice(0, 6);
  const popularAccessories = (allProducts ?? [])
    .filter((p) => p.category === "Accessories")
    .slice(0, 4);

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    updateCartItem.mutate(
      { productId, data: { quantity } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleRemove = (productId: number) => {
    removeFromCart.mutate(
      { productId },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleAddToCart = (productId: number) => {
    addToCart.mutate(
      { data: { productId, quantity: 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  if (isCartLoading) {
    return (
      <AppLayout activePage="cart">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Skeleton className="w-full h-[300px]" />
        </div>
      </AppLayout>
    );
  }

  const hasItems = cart && cart.items.length > 0;

  return (
    <AppLayout activePage="cart">
      <div className="bg-[#f8f9fb] min-h-screen pb-24">

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

          {hasItems ? (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Left: Cart Items */}
              <div className="flex-1 flex flex-col gap-4">
                {cart.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="bg-white rounded-xl border border-gray-200 p-5 flex gap-5 shadow-sm"
                    data-testid={`cart-item-${item.product.id}`}
                  >
                    <div className="w-32 h-32 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center p-2">
                      <img
                        src={item.product.imageUrl || `${import.meta.env.BASE_URL}images/dell-xps-15.jpg`}
                        alt={item.product.name}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-semibold text-lg text-gray-900 leading-tight hover:text-indigo-600 cursor-pointer">
                            {item.product.name}
                          </h3>
                        </Link>
                        <div className="font-bold text-xl text-gray-900 text-right">{formatPrice(item.product.price)}</div>
                      </div>
                      <div className="text-sm text-gray-500 mb-2">Category: {item.product.category}</div>
                      <div className="text-xs text-green-700 font-bold mb-4 bg-green-50 px-2 py-1 rounded inline-flex self-start">
                        In Stock
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-1">
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                            data-testid={`btn-decrease-${item.product.id}`}
                          >
                            -
                          </button>
                          <span className="font-semibold w-4 text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors"
                            data-testid={`btn-increase-${item.product.id}`}
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium">
                          <button className="text-indigo-600 hover:underline flex items-center gap-1">
                            <Heart size={14} /> Save for Later
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleRemove(item.product.id)}
                            className="text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                            data-testid={`btn-remove-${item.product.id}`}
                          >
                            <Trash2 size={14} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                      <Truck size={18} className="text-indigo-600" />
                    </div>
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
                        <span>Subtotal ({cart.items.length} items)</span>
                        <span className="font-medium text-gray-900">{formatPrice(cart.subtotal)}</span>
                      </div>
                      {cart.discount > 0 && (
                        <div className="flex justify-between">
                          <span>Discount {cart.couponApplied ? `(${cart.couponApplied})` : ""}</span>
                          <span className="font-medium text-green-600">−{formatPrice(cart.discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span className="font-medium text-green-600">
                          {cart.deliveryFee === 0 ? "FREE" : formatPrice(cart.deliveryFee)}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 pb-1 mb-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total Amount</span>
                        <span className="font-bold text-2xl text-gray-900">{formatPrice(cart.total)}</span>
                      </div>
                    </div>
                    {cart.discount > 0 && (
                      <div className="text-xs font-bold text-green-700 bg-green-50 p-2 rounded-lg text-center mb-6 border border-green-100">
                        You're saving {formatPrice(cart.discount)} on this order!
                      </div>
                    )}

                    <button
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                      data-testid="btn-checkout"
                    >
                      Proceed to Checkout <ChevronRight size={18} />
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4">
                    <div className="text-xs text-gray-500 font-medium mb-3 text-center">Accepted Payment Methods</div>
                    <div className="flex justify-center gap-2 mb-4">
                      {["EMI", "UPI", "Cards", "NetBanking"].map((method) => (
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
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
              <Link href="/">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                  Continue Shopping
                </button>
              </Link>
            </div>
          )}

          {/* ─── LOGGED-IN: Personalised AI recommendations ─── */}
          {cartRecs && isLoggedIn && (
            <div className="mt-16 space-y-12">

              {/* Hybrid AI Picks */}
              <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <h2 className="text-xl font-bold text-white">{cartRecs.hybrid.title}</h2>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-200 bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/30">
                    <Sparkles size={12} /> Hybrid AI • Personalized
                  </div>
                </div>
                <p className="text-indigo-200 text-sm mb-6 relative z-10 max-w-2xl">
                  {cartRecs.hybrid.subtitle}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 relative z-10">
                  {cartRecs.hybrid.products.map((rec) => (
                    <div
                      key={rec.product.id}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover:bg-white/15 transition-colors cursor-pointer group flex items-center gap-4"
                    >
                      <div className="w-20 h-20 bg-white rounded-lg p-2 flex-shrink-0 flex items-center justify-center">
                        <img
                          src={rec.product.imageUrl || `${import.meta.env.BASE_URL}images/headphones.jpg`}
                          className="w-full h-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] text-purple-200 bg-purple-900/50 px-2 py-0.5 rounded inline-block mb-1 border border-purple-400/20 truncate max-w-full">
                          {rec.reason}
                        </div>
                        <h3 className="font-semibold text-white text-sm leading-tight mb-1 group-hover:text-purple-200 transition-colors line-clamp-2">
                          {rec.product.name}
                        </h3>
                        <div className="font-bold text-white">{formatPrice(rec.product.price)}</div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(rec.product.id)}
                        className="w-8 h-8 rounded-full bg-white text-indigo-900 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        data-testid={`btn-add-hybrid-${rec.product.id}`}
                      >
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

                {/* Complete Your Setup (Content-Based / Cross-sell) */}
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-lg font-bold text-gray-900">{cartRecs.crossSell.title}</h2>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      <Activity size={10} /> Content-Based
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">{cartRecs.crossSell.subtitle}</div>

                  <div className="grid grid-cols-2 gap-4">
                    {cartRecs.crossSell.products.map((rec) => (
                      <div
                        key={rec.product.id}
                        className="bg-white border border-gray-200 rounded-xl p-3 flex gap-3 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center p-1">
                          <img
                            src={rec.product.imageUrl || `${import.meta.env.BASE_URL}images/usb-hub.jpg`}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <h3 className="font-semibold text-gray-900 text-xs leading-tight mb-1 line-clamp-2">{rec.product.name}</h3>
                          <div className="font-bold text-sm text-gray-900 mb-2">{formatPrice(rec.product.price)}</div>
                          <button
                            onClick={() => handleAddToCart(rec.product.id)}
                            className="text-xs text-indigo-600 font-semibold border border-indigo-200 rounded py-1 hover:bg-indigo-50 transition-colors w-full"
                            data-testid={`btn-crosssell-${rec.product.id}`}
                          >
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
                    <h2 className="text-lg font-bold text-gray-900">{cartRecs.collaborative.title}</h2>
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      <TrendingUp size={10} /> Collaborative
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mb-4">{cartRecs.collaborative.subtitle}</div>

                  <div className="flex flex-col gap-3">
                    {cartRecs.collaborative.products.map((rec) => (
                      <div
                        key={rec.product.id}
                        className="bg-white border border-gray-200 rounded-xl p-3 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className="w-16 h-16 bg-gray-50 rounded flex items-center justify-center p-1">
                          <img
                            src={rec.product.imageUrl || `${import.meta.env.BASE_URL}images/ssd.jpg`}
                            className="w-full h-full object-contain mix-blend-multiply"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">{rec.product.name}</h3>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-gray-900">{formatPrice(rec.product.price)}</span>
                            {rec.reason && (
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded max-w-[120px] truncate">
                                {rec.reason}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddToCart(rec.product.id)}
                          className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                          data-testid={`btn-collab-${rec.product.id}`}
                        >
                          <span className="font-bold">+</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─── ANONYMOUS: Cross-sell opportunities, no personal AI ─── */}
          {!isLoggedIn && (
            <div className="mt-16 space-y-10">

              {/* Cross-Sell header */}
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-gray-900">Complete Your Setup</h2>
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
                    <TrendingUp size={12} /> Cross-Sell Opportunities
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                  Shoppers frequently add these alongside their cart items
                </p>

                {crossSellProducts.length > 0 && (
                  <AnonymousRecommendationWidget
                    title="Chargers, Headphones & More"
                    subtitle="Popular accessories to go with your purchase"
                    badge="Frequently Added"
                    badgeVariant="trending"
                    products={crossSellProducts}
                  />
                )}
              </div>

              {/* Popular accessories */}
              {popularAccessories.length > 0 && (
                <AnonymousRecommendationWidget
                  title="Top-Rated Accessories"
                  subtitle="Highest-rated picks from our electronics collection"
                  badge="Editorial Pick"
                  badgeVariant="editorial"
                  products={popularAccessories}
                />
              )}

              {/* Sign-in nudge */}
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
                <div>
                  <div className="text-white/70 text-xs font-medium mb-1">For Logged-In Shoppers</div>
                  <h3 className="text-lg font-bold text-white mb-1">
                    Get AI picks tailored just for you
                  </h3>
                  <p className="text-indigo-200 text-sm">
                    Sign in to unlock Hybrid AI recommendations based on your browsing and purchase history.
                  </p>
                </div>
                <button
                  className="flex-shrink-0 bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors whitespace-nowrap"
                  data-testid="btn-signin-cart-nudge"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
