// src/pages/Products.jsx  (sidebar layout + URL sync with new facets)
import { useEffect, useMemo, useState } from "react";
import { getClothingProducts } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SidebarFilters from "../components/filters/SidebarFilters";
import MobileFiltersSheet from "../components/filters/MobileFiltersSheet";

export default function Products() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [doneId, setDoneId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ------- Filters / Sort (PLP) -------
  const loc = useLocation();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");
  const [sub, setSub] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [brand, setBrand] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStock, setInStock] = useState(false);
  const [rating, setRating] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [sort, setSort] = useState("relevance");

  // read initial params
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    setQ(p.get("search") || "");
    setGender((p.get("cat") || "all").toLowerCase());
    setSub(p.get("sub") || "");
    setSize(p.get("size") || "");
    setColor(p.get("color") || "");
    setBrand(p.get("brand") || "");
    setPriceMin(p.get("priceMin") || "");
    setPriceMax(p.get("priceMax") || "");
    setInStock(p.get("inStock") === "1");
    setRating(Number(p.get("rating") || 0));
    setDiscount(Number(p.get("discount") || 0));
    setSort(p.get("sort") || "relevance");
  }, [loc.search]);

  // push state to URL (replace)
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (gender && gender !== "all") p.set("cat", gender);
    if (sub) p.set("sub", sub);
    if (size) p.set("size", size);
    if (color) p.set("color", color);
    if (brand) p.set("brand", brand);
    if (priceMin) p.set("priceMin", priceMin);
    if (priceMax) p.set("priceMax", priceMax);
    if (inStock) p.set("inStock", "1");
    if (rating) p.set("rating", String(rating));
    if (discount) p.set("discount", String(discount));
    if (sort && sort !== "relevance") p.set("sort", sort);
    const next = p.toString();
    nav({ pathname: "/products", search: next ? `?${next}` : "" }, { replace: true });
  }, [q, gender, sub, size, color, brand, priceMin, priceMax, inStock, rating, discount, sort, nav]);

  const { add } = useCart();

  useEffect(() => {
    getClothingProducts().then((data) => setItems(Array.isArray(data) ? data : []));
  }, []);

  // facets from current catalog
  const facets = useMemo(() => {
    // scope items by gender for subCats/sizes/colors/brands
    const scope = items.filter((p) =>
      gender === "all" ? true : (p.gender || "").toLowerCase() === gender
    );
    const sizes = new Set();
    const colors = new Map(); // name -> code
    const subCategories = new Set();
    const brands = new Set();

    scope.forEach((p) => {
      (p.sizes || []).forEach((s) => sizes.add(s));
      (p.colors || []).forEach((c) => {
        if (!colors.has(c.name)) colors.set(c.name, c.code);
      });
      if (p.subCategory) subCategories.add(p.subCategory);
      if (p.brand) brands.add(p.brand);
    });

    return {
      sizes: Array.from(sizes),
      colors: Array.from(colors, ([name, code]) => ({ name, code })),
      subCategories: Array.from(subCategories),
      brands: Array.from(brands),
      priceMin: Math.min(...items.map((x) => x.price || 0), 0) || 0,
      priceMax: Math.max(...items.map((x) => x.price || 0), 0) || 0,
    };
  }, [items, gender]);

  const filtered = useMemo(() => {
    const ql = (q || "").toLowerCase();
    const min = priceMin ? Number(priceMin) : -Infinity;
    const max = priceMax ? Number(priceMax) : Infinity;

    let list = items.filter((p) => {
      const okGender =
        gender === "all" ||
        (p.gender || "").toLowerCase() === gender ||
        (p.category || "").toLowerCase() === gender;

      const okSub = !sub || (p.subCategory || "").toLowerCase() === sub.toLowerCase();
      const okSize = !size || (p.sizes || []).includes(size);
      const okColor = !color || (p.colors || []).some((c) =>
        (c.name || "").toLowerCase() === color.toLowerCase()
      );
      const okBrand = !brand || (p.brand || "").toLowerCase() === brand.toLowerCase();

      const price = p.price ?? 0;
      const okPrice = price >= min && price <= max;

      const okQ =
        !ql ||
        (p.name || "").toLowerCase().includes(ql) ||
        (p.brand || "").toLowerCase().includes(ql) ||
        (p.category || "").toLowerCase().includes(ql) ||
        (p.subCategory || "").toLowerCase().includes(ql) ||
        (p.tags || []).some((t) => (t || "").toLowerCase().includes(ql));

      const okRating = (p?.rating?.avg || 0) >= (rating || 0);
      const itemDiscount = p.mrp && p.mrp > p.price
        ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
        : (p.discountPct || 0);
      const okDiscount = itemDiscount >= (discount || 0);

      const okStock = !inStock || Object.values(p.stock || {}).some((q) => (q || 0) > 0);

      return okGender && okSub && okSize && okColor && okBrand && okPrice && okQ && okRating && okDiscount && okStock;
    });

    switch (sort) {
      case "priceAsc":
        list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "priceDesc":
        list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "rating":
        list = [...list].sort((a, b) => (b?.rating?.avg || 0) - (a?.rating?.avg || 0));
        break;
      case "new":
        list = [...list].sort((a, b) => {
          const an = (a.tags || []).includes("new") ? 1 : 0;
          const bn = (b.tags || []).includes("new") ? 1 : 0;
          if (bn !== an) return bn - an;
          return (b?.rating?.count || 0) - (a?.rating?.count || 0);
        });
        break;
      default:
        const score = (p) => {
          let s = 0;
          if (q) {
            const l = q.toLowerCase();
            if ((p.name || "").toLowerCase().includes(l)) s += 3;
            if ((p.brand || "").toLowerCase().includes(l)) s += 2;
            if ((p.category || "").toLowerCase().includes(l)) s += 1;
          }
          s += (p?.rating?.count || 0) / 1000;
          return s;
        };
        list = [...list].sort((a, b) => score(b) - score(a));
    }
    return list;
  }, [items, q, gender, sub, size, color, brand, priceMin, priceMax, inStock, rating, discount, sort]);

  const resultCount = filtered.length;

  const onAdd = async (p) => {
    setBusyId(p.id);
    try {
      await add({ productId: p.id, name: p.name, price: p.price, qty: 1 });
      setDoneId(p.id);
      setTimeout(() => setDoneId(null), 1200);
    } finally {
      setBusyId(null);
    }
  };

  const clearAll = () => {
    setQ(""); setGender("all"); setSub(""); setSize(""); setColor(""); setBrand("");
    setPriceMin(""); setPriceMax(""); setInStock(false); setRating(0); setDiscount(0); setSort("relevance");
  };

  return (
    <section className="space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="text-sm text-gray-600">{resultCount} result{resultCount === 1 ? "" : "s"}</div>
      </div>

      {/* Applied chips row */}
      <AppliedChips
        q={q} setQ={setQ}
        gender={gender} setGender={setGender}
        sub={sub} setSub={setSub}
        size={size} setSize={setSize}
        color={color} setColor={setColor}
        brand={brand} setBrand={setBrand}
        priceMin={priceMin} setPriceMin={setPriceMin}
        priceMax={priceMax} setPriceMax={setPriceMax}
        inStock={inStock} setInStock={setInStock}
        rating={rating} setRating={setRating}
        discount={discount} setDiscount={setDiscount}
        onClearAll={clearAll}
      />

      {/* Mobile filters trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Filters & Sort
        </button>
      </div>

      {/* Sidebar narrower: 18rem → 16rem */}
      +      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar (desktop) */}
        <div className="hidden lg:block">
          <SidebarFilters
            facets={facets}
            gender={gender} setGender={setGender}
            sub={sub} setSub={setSub}
            size={size} setSize={setSize}
            color={color} setColor={setColor}
            priceMin={priceMin} setPriceMin={setPriceMin}
            priceMax={priceMax} setPriceMax={setPriceMax}
            brand={brand} setBrand={setBrand}
            inStock={inStock} setInStock={setInStock}
            rating={rating} setRating={setRating}
            discount={discount} setDiscount={setDiscount}
            sort={sort} setSort={setSort}
            onClearAll={clearAll}
          />
        </div>

        {/* Grid */}
        <div>
          <div className="mb-2 hidden items-center justify-end gap-2 lg:flex">
            <label className="text-sm text-gray-600">Sort by</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border px-3 py-1.5 text-sm outline-none focus:ring"
            >
              <option value="relevance">Relevance</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="new">New Arrivals</option>
            </select>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((it) => {
              const isBusy = busyId === it.id;
              const isDone = doneId === it.id;
              const hasMrp = it.mrp && it.mrp > it.price;
              const discountPct = hasMrp
                ? Math.round(((it.mrp - it.price) / it.mrp) * 100)
                : (it.discountPct || 0);
              return (
                <li key={it.id} className="card">
                  <Link to={`/product/${it.id}`} aria-label={`${it.name} details`}>
                    <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                      <img
                        src={it.thumbnail}
                        alt={it.name}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
                  </Link>
                  <Link to={`/product/${it.id}`} className="card-title mt-2 line-clamp-1">{it.name}</Link>
                  <div className="mt-1 text-xs text-gray-500">{it.brand}</div>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="card-price font-semibold">₹{it.price.toLocaleString("en-IN")}</span>
                    {hasMrp && (
                      <span className="text-sm text-gray-500 line-through">
                        ₹{it.mrp.toLocaleString("en-IN")}
                      </span>
                    )}
                    {discountPct > 0 && (
                      <span className="text-xs font-semibold text-green-700">{discountPct}% OFF</span>
                    )}
                  </div>

                  <button
                    onClick={() => onAdd(it)}
                    disabled={isBusy}
                    className={`btn-primary mt-3 w-full disabled:opacity-60 ${isDone ? "bg-green-600 hover:bg-green-600" : ""}`}
                  >
                    {isBusy ? "Adding..." : isDone ? "Added ✓" : "Add to Cart"}
                  </button>
                </li>
              );
            })}
          </ul>

          {filtered.length === 0 && (
            <p className="mt-6 text-gray-600">No products match your filters.</p>
          )}
        </div>
      </div>

      {/* Mobile filters sheet */}
      <MobileFiltersSheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        facets={facets}
        gender={gender} setGender={setGender}
        sub={sub} setSub={setSub}
        size={size} setSize={setSize}
        color={color} setColor={setColor}
        priceMin={priceMin} setPriceMin={setPriceMin}
        priceMax={priceMax} setPriceMax={setPriceMax}
        brand={brand} setBrand={setBrand}
        inStock={inStock} setInStock={setInStock}
        rating={rating} setRating={setRating}
        discount={discount} setDiscount={setDiscount}
        sort={sort} setSort={setSort}
        onClearAll={() => { clearAll(); setMobileOpen(false); }}
      />
    </section>
  );
}

function AppliedChips(props) {
  const chips = [];
  const push = (label, onClear) => chips.push({ label, onClear });

  if (props.q) push(`Search: “${props.q}”`, () => props.setQ(""));
  if (props.gender && props.gender !== "all") push(`Category: ${cap(props.gender)}`, () => props.setGender("all"));
  if (props.sub) push(`Sub: ${props.sub}`, () => props.setSub(""));
  if (props.size) push(`Size: ${props.size}`, () => props.setSize(""));
  if (props.color) push(`Color: ${props.color}`, () => props.setColor(""));
  if (props.brand) push(`Brand: ${props.brand}`, () => props.setBrand(""));
  if (props.priceMin) push(`Min ₹${props.priceMin}`, () => props.setPriceMin(""));
  if (props.priceMax) push(`Max ₹${props.priceMax}`, () => props.setPriceMax(""));
  if (props.inStock) push("In stock", () => props.setInStock(false));
  if (props.rating) push(`${props.rating}★ & up`, () => props.setRating(0));
  if (props.discount) push(`${props.discount}%+ off`, () => props.setDiscount(0));

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c, i) => (
        <button
          key={i}
          onClick={c.onClear}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs hover:bg-gray-50"
        >
          {c.label} <span className="text-gray-500">✕</span>
        </button>
      ))}
      <button
        onClick={props.onClearAll}
        className="text-xs text-gray-600 hover:underline"
      >
        Clear all
      </button>
    </div>
  );
}

function cap(s) {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}
