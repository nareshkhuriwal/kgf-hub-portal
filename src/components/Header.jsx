import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";

export default function Header() {
  const [open, setOpen] = useState(false);
  const { count, toggleCart } = useCart();

  const nav = useMemo(
    () => [
      { label: "Home", to: "/" },
      { label: "Products", to: "/products" },
      { label: "Services", to: "/services" },
    ],
    []
  );

  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
      <div className="container-outer flex h-16 items-center justify-between">
        <Link to="/" className="text-xl font-extrabold tracking-tight">
          KGF <span className="text-brand-600">Hub</span>
        </Link>

        <nav className="hidden md:flex items-center gap-2">
          {nav.map((item) => (
            <Link key={item.label} to={item.to} className="nav-link">{item.label}</Link>
          ))}
          <button className="nav-link relative" onClick={toggleCart} aria-label="Open cart">
            Cart
            {count > 0 && (
              <span className="absolute -top-2 -right-3 rounded-full bg-gray-900 text-white text-[10px] px-1.5 py-0.5">
                {count}
              </span>
            )}
          </button>
        </nav>

        <button className="md:hidden btn-outline" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">☰</button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="container-outer py-2 flex flex-col gap-1">
            {nav.map((item) => (
              <Link key={item.label} to={item.to} onClick={() => setOpen(false)} className="nav-link">{item.label}</Link>
            ))}
            <button className="nav-link text-left" onClick={() => { setOpen(false); toggleCart(); }}>
              Cart {count > 0 ? `(${count})` : ""}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
