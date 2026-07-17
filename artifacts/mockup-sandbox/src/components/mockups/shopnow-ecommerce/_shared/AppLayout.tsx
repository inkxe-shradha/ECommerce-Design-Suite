import React from "react";
import { ShoppingCart, Search, User, ChevronDown, Menu, Zap } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  cartCount?: number;
  isLoggedIn?: boolean;
  userName?: string;
  activePage?: "home" | "pdp" | "cart";
}

export function AppLayout({
  children,
  cartCount = 0,
  isLoggedIn = true,
  userName = "Rahul",
  activePage = "home",
}: AppLayoutProps) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ fontFamily: "'Inter', sans-serif", background: "#f8f9fb" }}
    >
      {/* Top announcement bar */}
      <div
        style={{ background: "#1a1a2e", color: "#e0e0ff", fontSize: 13, padding: "6px 0", textAlign: "center" }}
      >
        🎉 Free shipping on orders over ₹999 &nbsp;|&nbsp; Use code <strong>TECH20</strong> for 20% off
      </div>

      {/* Nav */}
      <header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #e8eaf0",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 24px",
            height: 64,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} color="white" />
            </div>
            <span style={{ fontWeight: 800, fontSize: 20, color: "#1a1a2e", letterSpacing: "-0.5px" }}>
              Shop<span style={{ color: "#6366f1" }}>Now</span>
            </span>
          </div>

          {/* Category nav */}
          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            {["Mobiles", "Laptops", "Accessories", "Audio", "Cameras", "Deals"].map((cat) => (
              <button
                key={cat}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: "none",
                  background: "none",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#374151",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {cat}
                {cat === "Mobiles" || cat === "Laptops" ? <ChevronDown size={12} /> : null}
              </button>
            ))}
          </nav>

          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#f3f4f6",
              borderRadius: 10,
              padding: "8px 14px",
              gap: 8,
              width: 220,
              border: "1.5px solid #e5e7eb",
            }}
          >
            <Search size={15} color="#9ca3af" />
            <span style={{ fontSize: 13, color: "#9ca3af" }}>Search electronics…</span>
          </div>

          {/* User + Cart */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isLoggedIn ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {userName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#6b7280" }}>Hello,</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{userName}</div>
                </div>
              </div>
            ) : (
              <button
                style={{
                  padding: "7px 16px",
                  borderRadius: 8,
                  border: "1.5px solid #6366f1",
                  background: "none",
                  color: "#6366f1",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Sign In
              </button>
            )}

            {/* Cart icon */}
            <div style={{ position: "relative", cursor: "pointer" }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: activePage === "cart" ? "#6366f1" : "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1.5px solid",
                  borderColor: activePage === "cart" ? "#6366f1" : "#e5e7eb",
                }}
              >
                <ShoppingCart size={18} color={activePage === "cart" ? "white" : "#374151"} />
              </div>
              {cartCount > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background: "#ef4444",
                    color: "white",
                    fontSize: 10,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {cartCount}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Footer */}
      <footer style={{ background: "#1a1a2e", color: "#9ca3af", padding: "32px 24px", marginTop: 40 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={14} color="white" />
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 16 }}>ShopNow</span>
          </div>
          <div style={{ fontSize: 12 }}>© 2025 ShopNow Electronics. Trusted by 2M+ customers.</div>
          <div style={{ display: "flex", gap: 20, fontSize: 13 }}>
            {["Privacy", "Terms", "Support", "Returns"].map((l) => (
              <span key={l} style={{ cursor: "pointer" }}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
