// src/pages/Home.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getClothingProducts } from "../lib/api";

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClothingProducts().then((data) => {
      setItems(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  const newArrivals = useMemo(
    () =>
      items
        .filter((p) => (p.tags || []).includes("new"))
        .slice(0, 8),
    [items]
  );

  const bestSellers = useMemo(
    () =>
      [...items]
        .sort((a, b) => (b?.rating?.count || 0) - (a?.rating?.count || 0))
        .slice(0, 8),
    [items]
  );

  const budgetPicks = useMemo(
    () => items.filter((p) => p.price <= 799).slice(0, 8),
    [items]
  );

  return (
    <div className="space-y-12">
      <Hero />

      <CategoryTiles />

      <FeaturedRow
        title="New Arrivals"
        to="/products?sort=new"
        items={newArrivals}
        loading={loading}
      />

      <FeaturedRow
        title="Best Sellers"
        to="/products?tag=bestseller"
        items={bestSellers}
        loading={loading}
      />

      <FeaturedRow
        title="Budget Picks Under ₹799"
        to="/products?priceMax=799"
        items={budgetPicks}
        loading={loading}
      />
    </div>
  );
}

/* ----------------------------- Hero Section ----------------------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-2 md:py-16">
        <div>
          <span className="inline-block rounded-full bg-black/90 px-3 py-1 text-xs font-semibold tracking-wide text-white">
            KGF HUB • Clothing
          </span>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            Everyday fits. <span className="text-gray-500">Premium feel.</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm text-gray-600 md:text-base">
            Tees, denim, ethnic, and more—crafted for comfort and made to last.
            Explore men, women, and kids collections with fresh drops every week.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/products?cat=men" className="btn-primary">
              Shop Men
            </Link>
            <Link
              to="/products?cat=women"
              className="inline-flex items-center rounded-full border px-5 py-2 text-sm hover:bg-gray-50"
            >
              Shop Women
            </Link>
            <Link
              to="/products?cat=kids"
              className="inline-flex items-center rounded-full border px-5 py-2 text-sm hover:bg-gray-50"
            >
              Shop Kids
            </Link>
          </div>
        </div>

        <div className="relative">
          {/* Optional hero image in /public/hero.jpg; falls back to gradient block */}
          <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(0,0,0,0.06)_0,transparent_45%),radial-gradient(circle_at_80%_10%,rgba(0,0,0,0.04)_0,transparent_40%)]">
            <img
              src="/hero.jpg"
              alt="KGF HUB hero"
              className="h-full w-full object-cover"
              onError={(e) => {
                // fallback to pattern if image isn't present
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------- Category Tiles Trio ------------------------- */

function CategoryTiles() {
  const tiles = [
    {
      label: "Men",
      to: "/products?cat=men",
      img: "/img/men/oversized-tee-1.jpg",
      bg: "from-slate-50 to-gray-100",
    },
    {
      label: "Women",
      to: "/products?cat=women",
      img: "/img/women/floral-dress-1.jpg",
      bg: "from-rose-50 to-pink-100",
    },
    {
      label: "Kids",
      to: "/products?cat=kids",
      img: "/img/kids/graphic-tee-1.jpg",
      bg: "from-amber-50 to-yellow-100",
    },
  ];

  return (
    <section className="px-8">
      <h2 className="mb-3 text-xl font-semibold">Shop by Category</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link
              to={t.to}
              className="group block overflow-hidden rounded-3xl border"
            >
              <div
                className={`relative aspect-[4/5] w-full bg-gradient-to-br ${t.bg}`}
              >
                <img
                  src={t.img}
                  alt={t.label}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80"></div>
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <div className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-900 backdrop-blur">
                    {t.label} →
                  </div>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------- Featured Rows UI --------------------------- */

function FeaturedRow({ title, to, items, loading }) {
  return (
    <section className="px-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link
          to={to}
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          View all →
        </Link>
      </div>

      {loading ? (
        <SkeletonRow />
      ) : items.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <li key={it.id} className="card">
              <Link to={`/product/${it.id}`}>
                <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={it.thumbnail}
                    alt={it.name}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
              </Link>

              <Link
                to={`/product/${it.id}`}
                className="card-title mt-2 line-clamp-1"
                title={it.name}
              >
                {it.name}
              </Link>

              <div className="mt-1 flex items-center gap-2">
                <span className="card-price font-semibold">
                  ₹{it.price.toLocaleString("en-IN")}
                </span>
                {it.mrp && it.mrp > it.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{it.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discountOf(it) > 0 && (
                  <span className="text-xs font-semibold text-green-700">
                    {discountOf(it)}% OFF
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No items to show.</p>
      )}
    </section>
  );
}

function discountOf(p) {
  if (!p) return 0;
  if (p.mrp && p.mrp > p.price) {
    return Math.round(((p.mrp - p.price) / p.mrp) * 100);
  }
  return p.discountPct || 0;
}

/* ------------------------------ Skeleton UI ----------------------------- */

function SkeletonRow() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="animate-pulse">
          <div className="aspect-[4/5] w-full rounded-xl bg-gray-200" />
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-2 flex gap-2">
            <div className="h-4 w-20 rounded bg-gray-200" />
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}
