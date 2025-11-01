import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getClothingProducts } from "../lib/api";
import HeroSlider from "../components/hero/HeroSlider";

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
    () => items.filter((p) => (p.tags || []).includes("new")).slice(0, 8),
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
    () => items.filter((p) => (p.price ?? 0) <= 799).slice(0, 8),
    [items]
  );

  return (
    <div className="space-y-12">
      {/* Hero Slider */}
      <HeroSlider
        slides={[
          { src: "/hero/1.jpg", to: "/products?cat=women", label: "Women • New Season" },
          { src: "/hero/2.jpg", to: "/products?cat=men", label: "Men • Daily Essentials" },
          { src: "/hero/3.jpg", to: "/products?cat=kids", label: "Kids • Play Ready" },
        ]}
        aspect="aspect-[21/9]"   // tall/short control from the reference image
        interval={4500}
      />

      <CategoryTiles />

      <FeaturedRow
        title="New Arrivals"
        to="/products?sort=new"
        items={newArrivals}
        loading={loading}
      />

      <FeaturedRow
        title="Best Sellers"
        to="/products?sort=relevance"
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

/* -------------------------- Category Tiles Trio ------------------------- */

function CategoryTiles() {
  const tiles = [
    {
      label: "Men",
      to: "/products?cat=men",
      img: "/img/men/CASHMERE LIMITED EDITION CARDIGAN.jpg",
      bg: "from-slate-50 to-gray-100",
    },
    {
      label: "Women",
      to: "/products?cat=women",
      img: "/img/women/kurta-set-12.jpg",
      bg: "from-rose-50 to-pink-100",
    },
    {
      label: "Kids",
      to: "/products?cat=kids",
      img: "/img/kids/SPORTY LOGO SWEATSHIRT.jpg",
      bg: "from-amber-50 to-yellow-100",
    },
  ];

  return (
    <section className="p-2">
      <h2 className="mb-3 text-xl font-semibold">Shop by Category</h2>
      <ul className="grid gap-4 sm:grid-cols-3">
        {tiles.map((t) => (
          <li key={t.label}>
            <Link className="group block overflow-hidden rounded-3xl border" to={t.to}>
              <div className={`relative ${"aspect-[4/5]"} w-full bg-gradient-to-br ${t.bg}`}>
                <img
                  src={t.img}
                  alt={t.label}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
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
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link to={to} className="text-sm font-medium text-gray-700 hover:text-gray-900">
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
                    src={it.thumbnail?.startsWith("/") ? it.thumbnail.slice(1) : it.thumbnail}
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
                  ₹{(it.price ?? 0).toLocaleString("en-IN")}
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
