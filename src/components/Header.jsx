// src/components/Header.jsx
import { NavLink, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import SearchBar from "./SearchBar";
import { useCart } from "../context/CartContext";

export default function Header() {
  const { count } = useCart();
  const [bump, setBump] = useState(false);

  useEffect(() => {
    if (count <= 0) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 380);
    return () => clearTimeout(t);
  }, [count]);

  const items = [
    { to: "/", label: "HOME" },
    { to: "/new", label: "NEW" },
    { to: "/products", label: "SHOP" },
    { to: "/products?cat=men", label: "MEN" },
    { to: "/products?cat=women", label: "WOMEN" },
    { to: "/products?cat=kids", label: "KIDS" },
  ];

  return (
    <header className="sticky top-0 z-30 border-t border-b bg-white/95 backdrop-blur">
      <div className="container-outer flex h-16 items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center text-2xl font-extrabold tracking-tight">
          <span className="mr-1">KGF</span><span className="text-yellow-500">Hub</span>
        </Link>

        {/* Center: Nav */}
        <nav className="hidden md:flex items-center gap-8 uppercase tracking-[0.35em] text-[12px] text-gray-800" aria-label="Primary">
          {items.map((it) => (
            <NavItem key={it.label} to={it.to}>{it.label}</NavItem>
          ))}
        </nav>

        {/* Right: Icons + Search */}
        <div className="hidden md:block">
          <SearchBar />
        </div>
        <div className="flex items-center gap-5 text-gray-800">
          <Link to="/account" aria-label="Account" className="hover:opacity-80"><UserIcon className="h-6 w-6" /></Link>
          <Link to="/cart" aria-label="Cart" className="relative hover:opacity-80">
            <CartIcon className="h-6 w-6" />
            {count > 0 && (
              <span className={`absolute -right-2 -top-2 rounded-full bg-gray-900 px-1.5 py-0.5 text-[10px] leading-none text-white ${bump ? "badge-bump" : ""}`}>
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile: slim horizontal nav + search box below */}
      <div className="md:hidden border-t bg-white">
        <div className="container-outer no-scrollbar flex gap-6 overflow-x-auto py-3 uppercase tracking-[0.3em] text-[12px] text-gray-800">
          {items.map((it) => (
            <NavItem key={it.label} to={it.to}>{it.label}</NavItem>
          ))}
        </div>
        <div className="border-t px-4 py-2">
          <SearchBar className="w-full" />
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `relative pb-1 hover:opacity-80 ${isActive ? "nav-underline-active" : "nav-underline-hover"}`
      }
      end
    >
      {children}
    </NavLink>
  );
}

/* Minimal outline icons */
function UserIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 20c0-3.314 2.686-6 6-6h4c3.314 0 6 2.686 6 6" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  );
}
function CartIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8.5" cy="19" r="1.6" />
      <circle cx="17.5" cy="19" r="1.6" />
      <path strokeLinecap="round" d="M3 4h2l2.2 10.5a2 2 0 0 0 2 1.6h7.3a2 2 0 0 0 2-1.6L21 8H7" />
    </svg>
  );
}
