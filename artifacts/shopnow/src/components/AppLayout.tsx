import React from "react";
import { Link } from "wouter";
import { ShoppingCart, Search, ChevronDown, Zap, LogOut, LogIn } from "lucide-react";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useUser } from "../context/UserContext";

interface AppLayoutProps {
  children: React.ReactNode;
  activePage?: "home" | "pdp" | "cart";
}

export function AppLayout({ children, activePage = "home" }: AppLayoutProps) {
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey() } });
  const { isLoggedIn, userName, toggleLogin } = useUser();

  const cartCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb] font-sans">
      {/* Top announcement bar */}
      <div className="bg-[#1a1a2e] text-[#e0e0ff] text-[13px] py-1.5 text-center">
        🎉 Free shipping on orders over ₹999 &nbsp;|&nbsp; Use code <strong>TECH20</strong> for 20% off
      </div>

      {/* Nav */}
      <header className="bg-white border-b border-[#e8eaf0] sticky top-0 z-50 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0" data-testid="link-home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap size={18} color="white" />
            </div>
            <span className="font-extrabold text-[20px] text-[#1a1a2e] tracking-tight">
              Shop<span className="text-indigo-500">Now</span>
            </span>
          </Link>

          {/* Category nav */}
          <nav className="flex gap-1 flex-1">
            {["Mobiles", "Laptops", "Accessories", "Audio", "Cameras", "Deals"].map((cat) => (
              <button
                key={cat}
                className="px-3 py-1.5 rounded-md text-[13px] font-medium text-gray-700 flex items-center gap-1 hover:bg-gray-50"
                data-testid={`button-nav-${cat.toLowerCase()}`}
              >
                {cat}
                {(cat === "Mobiles" || cat === "Laptops") && <ChevronDown size={12} />}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div className="flex items-center bg-gray-100 rounded-lg px-3.5 py-2 gap-2 w-[220px] border-[1.5px] border-gray-200">
            <Search size={15} className="text-gray-400" />
            <span className="text-[13px] text-gray-400">Search electronics…</span>
          </div>

          {/* User + Cart */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 cursor-pointer">
                  <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-[13px] font-bold">
                    {userName[0]}
                  </div>
                  <div>
                    <div className="text-[12px] text-gray-500 leading-tight">Hello,</div>
                    <div className="text-[13px] font-semibold text-[#1a1a2e] leading-tight">{userName}</div>
                  </div>
                </div>
                <button
                  onClick={toggleLogin}
                  title="Sign out (demo)"
                  className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-red-500 transition-colors ml-1 border border-gray-200 rounded-md px-2 py-1"
                  data-testid="button-sign-out"
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={toggleLogin}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-semibold transition-colors"
                data-testid="button-sign-in"
              >
                <LogIn size={14} /> Sign In
              </button>
            )}

            {/* Cart icon */}
            <Link href="/cart" className="relative cursor-pointer block" data-testid="link-cart">
              <div
                className={`w-[38px] h-[38px] rounded-lg flex items-center justify-center border-[1.5px] ${
                  activePage === "cart"
                    ? "bg-indigo-500 border-indigo-500 text-white"
                    : "bg-gray-100 border-gray-200 text-gray-700"
                }`}
              >
                <ShoppingCart size={18} />
              </div>
              {cartCount > 0 && (
                <div className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </div>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Anonymous mode banner */}
      {!isLoggedIn && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-center">
          <span className="text-amber-800 text-[13px]">
            You're browsing as a <strong>guest</strong> — showing curated &amp; trending picks.{" "}
            <button
              onClick={toggleLogin}
              className="underline font-semibold text-amber-900 hover:text-indigo-700"
              data-testid="button-sign-in-banner"
            >
              Sign in
            </button>{" "}
            for personalised recommendations.
          </span>
        </div>
      )}

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-gray-400 py-8 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Zap size={14} color="white" />
            </div>
            <span className="text-white font-bold text-base">ShopNow</span>
          </div>
          <div className="text-xs">© 2025 ShopNow Electronics. Trusted by 2M+ customers.</div>
          <div className="flex gap-5 text-[13px]">
            {["Privacy", "Terms", "Support", "Returns"].map((l) => (
              <span key={l} className="cursor-pointer hover:text-white transition-colors">{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
