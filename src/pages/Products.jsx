// src/pages/Products.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getClothingProducts } from "../lib/api";
import { useCart } from "../context/CartContext";
import SidebarFilters from "../components/filters/SidebarFilters";
import MobileFiltersSheet from "../components/filters/MobileFiltersSheet";

export default function Products() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [doneId, setDoneId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // ----- Filters / Sort -----
  const loc = useLocation();
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [gender, setGender] = useState("all");          // single
  const [subs, setSubs] = useState([]);                 // multi
  const [sizes, setSizes] = useState([]);               // multi
  const [colors, setColors] = useState([]);             // multi (names)
  const [brands, setBrands] = useState([]);             // multi
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [rating, setRating] = useState(0);              // single threshold
  const [discount, setDiscount] = useState(0);          // single threshold
  const [sort, setSort] = useState("relevance");

  // Track if gender came from initial URL (lock & hide Gender facet)
  const lockedGenderRef = useRef({ locked: false, value: "all" });
  const firstLoadRef = useRef(true); // ◀️ NEW: only lock on the first load

  // Parse current URL into state
  useEffect(() => {
    const p = new URLSearchParams(loc.search);
    const urlCat = (p.get("cat") || "all").toLowerCase();
    setQ(p.get("search") || "");
    setGender(urlCat);
    setSubs(parseCSV(p.get("sub")));
    setSizes(parseCSV(p.get("size")));
    setColors(parseCSV(p.get("color")));
    setBrands(parseCSV(p.get("brand")));
    setPriceMin(p.get("priceMin") || "");
    setPriceMax(p.get("priceMax") || "");
    setRating(Number(p.get("rating") || 0));
    setDiscount(Number(p.get("discount") || 0));
    setSort(p.get("sort") || "relevance");

    // lock gender if URL provided a specific category at FIRST load only
    if (firstLoadRef.current) {
      const isLockable = ["men", "women", "kids"].includes(urlCat);
      if (isLockable) {
        lockedGenderRef.current = { locked: true, value: urlCat };
      }
      firstLoadRef.current = false; // ensure it runs just once
    }
  }, [loc.search]);

  // 🔒 Sanitize size selections when gender changes
  useEffect(() => {
    const LETTERS = ["XS", "S", "M", "L", "XL", "XXL"];
    const KIDS_RE = /^\d{1,2}-\d{1,2}Y$/i;

    setSizes((prev) => {
      if (gender === "kids") {
        // keep only kids ages
        return prev.filter((s) => KIDS_RE.test(String(s)));
      }
      // men/women/all → keep only letters XS–XXL
      return prev.filter((s) => LETTERS.includes(String(s).toUpperCase()));
    });
  }, [gender]);

  // Push state -> URL
  useEffect(() => {
    const p = new URLSearchParams();
    if (q) p.set("search", q);
    if (gender && gender !== "all") p.set("cat", gender);
    if (subs.length) p.set("sub", csv(subs));
    if (sizes.length) p.set("size", csv(sizes));
    if (colors.length) p.set("color", csv(colors));
    if (brands.length) p.set("brand", csv(brands));
    if (priceMin) p.set("priceMin", priceMin);
    if (priceMax) p.set("priceMax", priceMax);
    if (rating) p.set("rating", String(rating));
    if (discount) p.set("discount", String(discount));
    if (sort && sort !== "relevance") p.set("sort", sort);
    nav({ pathname: "/products", search: p.toString() ? `?${p}` : "" }, { replace: true });
  }, [q, gender, subs, sizes, colors, brands, priceMin, priceMax, rating, discount, sort, nav]);

  const { add } = useCart();

  useEffect(() => {
    getClothingProducts().then((data) => setItems(Array.isArray(data) ? data : []));
  }, []);

  // Catalogue facets & price range (scoped by gender)
  const baseScoped = useMemo(() => {
    return items.filter((p) =>
      gender === "all" ? true : (p.gender || "").toLowerCase() === gender
    );
  }, [items, gender]);

  const priceRange = useMemo(() => {
    const vals = baseScoped.map((x) => x.price || 0);
    return {
      min: vals.length ? Math.min(...vals) : 0,
      max: vals.length ? Math.max(...vals) : 0,
    };
  }, [baseScoped]);

  // Helper to compute live counts for each facet (counts respect other selections)
  const counts = useMemo(() => {
    const norm = (s) => (s || "").toLowerCase();

    // Filtering predicate with the ability to ignore one facet while counting it
    const pred = (p, ignore) => {
      const ql = q.toLowerCase();
      const okGender =
        gender === "all" ||
        norm(p.gender) === gender ||
        norm(p.category) === gender;

      const okSubs = ignore === "sub" || subs.length === 0
        ? true
        : subs.some((s) => norm(p.subCategory) === norm(s));

      const okSizes = ignore === "size" || sizes.length === 0
        ? true
        : (p.sizes || []).some((s) => sizes.includes(String(s)));

      const okColors = ignore === "color" || colors.length === 0
        ? true
        : (p.colors || []).some((c) => colors.map(norm).includes(norm(c.name)));

      const okBrands = ignore === "brand" || brands.length === 0
        ? true
        : brands.map(norm).includes(norm(p.brand));

      const price = p.price ?? 0;
      const min = priceMin ? Number(priceMin) : -Infinity;
      const max = priceMax ? Number(priceMax) : Infinity;
      const okPrice = price >= min && price <= max;

      const okQ =
        !ql ||
        norm(p.name).includes(ql) ||
        norm(p.brand).includes(ql) ||
        norm(p.category).includes(ql) ||
        norm(p.subCategory).includes(ql) ||
        (p.tags || []).some((t) => norm(t).includes(ql));

      const okRating = (p?.rating?.avg || 0) >= (rating || 0);
      const disc = p.mrp && p.mrp > p.price
        ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
        : (p.discountPct || 0);
      const okDiscount = disc >= (discount || 0);

      return okGender && okSubs && okSizes && okColors && okBrands && okPrice && okQ && okRating && okDiscount;
    };

    const pool = items.filter((p) => pred(p, null));

    // for counts, ignore the facet being counted
    const scopedFor = (facet) => items.filter((p) => pred(p, facet));

    const subMap = new Map();
    scopedFor("sub").forEach((p) => {
      const key = p.subCategory || "Other";
      subMap.set(key, (subMap.get(key) || 0) + 1);
    });

    const sizeMap = new Map();
    scopedFor("size").forEach((p) => {
      (p.sizes || []).forEach((s) => sizeMap.set(String(s), (sizeMap.get(String(s)) || 0) + 1));
    });

    const colorMap = new Map();
    scopedFor("color").forEach((p) => {
      (p.colors || []).forEach((c) => {
        const name = c.name || "Color";
        colorMap.set(name, (colorMap.get(name) || 0) + 1);
      });
    });

    const brandMap = new Map();
    scopedFor("brand").forEach((p) => {
      const b = p.brand || "Brand";
      brandMap.set(b, (brandMap.get(b) || 0) + 1);
    });

    return {
      subCounts: mapToArray(subMap),
      sizeCounts: mapToArray(sizeMap),
      colorCounts: mapToArray(colorMap),
      brandCounts: mapToArray(brandMap),
      resultCount: pool.length,
    };
  }, [items, q, gender, subs, sizes, colors, brands, priceMin, priceMax, rating, discount]);

  // 🔽 filter & sort size options by gender context
  const sizeCountsFiltered = useMemo(() => {
    const LETTERS = ["XS", "S", "M", "L", "XL", "XXL"];
    const KIDS_RE = /^(\d{1,2})-(\d{1,2})Y$/i;

    // rank for natural sorting
    const sizeRank = (v) => {
      const s = String(v).toUpperCase();
      const m = s.match(KIDS_RE);
      if (m) return [0, Number(m[1])];               // kids by starting age
      const li = LETTERS.indexOf(s);
      if (li !== -1) return [1, li];                  // XS..XXL
      const num = parseInt(s.replace(/\D/g, ""), 10);
      if (!Number.isNaN(num)) return [2, num];        // numeric (if any left)
      return [3, s];                                  // others A→Z
    };

    const sorted = [...(counts.sizeCounts || [])]
      // filter first
      .filter(({ value }) => {
        const s = String(value);
        if (gender === "kids") return KIDS_RE.test(s);
        return ["XS", "S", "M", "L", "XL", "XXL"].includes(s.toUpperCase());
      })
      // then sort with natural order
      .sort((a, b) => {
        const [ga, ia] = sizeRank(a.value);
        const [gb, ib] = sizeRank(b.value);
        if (ga !== gb) return ga - gb;
        if (typeof ia === "number" && typeof ib === "number") return ia - ib;
        return String(ia).localeCompare(String(ib));
      });

    return sorted;
  }, [counts.sizeCounts, gender]);

  // Final filtered list for grid
  const filtered = useMemo(() => {
    const ql = q.toLowerCase();
    const min = priceMin ? Number(priceMin) : -Infinity;
    const max = priceMax ? Number(priceMax) : Infinity;

    let list = items.filter((p) => {
      const okGender =
        gender === "all" ||
        (p.gender || "").toLowerCase() === gender ||
        (p.category || "").toLowerCase() === gender;

      const okSubs = subs.length === 0 || subs.some((s) => (p.subCategory || "").toLowerCase() === s.toLowerCase());
      const okSizes = sizes.length === 0 || (p.sizes || []).some((s) => sizes.includes(String(s)));
      const okColors = colors.length === 0 || (p.colors || []).some((c) => colors.map((x) => x.toLowerCase()).includes((c.name || "").toLowerCase()));
      const okBrands = brands.length === 0 || brands.map((b) => b.toLowerCase()).includes((p.brand || "").toLowerCase());

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
      const disc = p.mrp && p.mrp > p.price
        ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
        : (p.discountPct || 0);
      const okDiscount = disc >= (discount || 0);

      return okGender && okSubs && okSizes && okColors && okBrands && okPrice && okQ && okRating && okDiscount;
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
  }, [items, q, gender, subs, sizes, colors, brands, priceMin, priceMax, rating, discount, sort]);

  const resultCount = counts.resultCount;

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
    // Respect locked gender
    const { locked, value } = lockedGenderRef.current;
    setQ("");
    setGender(locked ? value : "all");
    setSubs([]);
    setSizes([]);
    setColors([]);
    setBrands([]);
    setPriceMin("");
    setPriceMax("");
    setRating(0);
    setDiscount(0);
    setSort("relevance");
  };

  const hideGender = lockedGenderRef.current.locked;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Products</h2>
        <div className="text-sm text-gray-600">
          {resultCount} result{resultCount === 1 ? "" : "s"}
        </div>
      </div>

      <AppliedChips
        q={q} setQ={setQ}
        gender={gender} setGender={setGender}
        subs={subs} setSubs={setSubs}
        sizes={sizes} setSizes={setSizes}
        colors={colors} setColors={setColors}
        brands={brands} setBrands={setBrands}
        priceMin={priceMin} setPriceMin={setPriceMin}
        priceMax={priceMax} setPriceMax={setPriceMax}
        rating={rating} setRating={setRating}
        discount={discount} setDiscount={setDiscount}
        onClearAll={clearAll}
        hideGender={hideGender}
      />

      {/* Mobile trigger */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="w-full rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
        >
          Filters & Sort
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[16rem_1fr]">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <SidebarFilters
            // counts
            subCounts={counts.subCounts}
            sizeCounts={sizeCountsFiltered}
            colorCounts={counts.colorCounts}
            brandCounts={counts.brandCounts}
            // selections
            gender={gender} setGender={setGender}
            subs={subs} setSubs={setSubs}
            sizes={sizes} setSizes={setSizes}
            colors={colors} setColors={setColors}
            brands={brands} setBrands={setBrands}
            priceMin={priceMin} setPriceMin={setPriceMin}
            priceMax={priceMax} setPriceMax={setPriceMax}
            rating={rating} setRating={setRating}
            discount={discount} setDiscount={setDiscount}
            sort={sort} setSort={setSort}
            priceRange={priceRange}
            onClearAll={clearAll}
            // NEW: hide gender facet when locked by URL cat
            hideGender={hideGender}
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
                        src={it.thumbnail?.startsWith("/") ? it.thumbnail.slice(1) : it.thumbnail}
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
        // counts
        subCounts={counts.subCounts}
        sizeCounts={sizeCountsFiltered}
        colorCounts={counts.colorCounts}
        brandCounts={counts.brandCounts}
        // selections
        gender={gender} setGender={setGender}
        subs={subs} setSubs={setSubs}
        sizes={sizes} setSizes={setSizes}
        colors={colors} setColors={setColors}
        brands={brands} setBrands={setBrands}
        priceMin={priceMin} setPriceMin={setPriceMin}
        priceMax={priceMax} setPriceMax={setPriceMax}
        rating={rating} setRating={setRating}
        discount={discount} setDiscount={setDiscount}
        sort={sort} setSort={setSort}
        priceRange={priceRange}
        onClearAll={() => { clearAll(); setMobileOpen(false); }}
        // NEW: hide gender in mobile panel too
        hideGender={hideGender}
      />
    </section>
  );
}

function AppliedChips(props) {
  const chips = [];
  const push = (label, onClear) => chips.push({ label, onClear });

  if (props.q) push(`Search: “${props.q}”`, () => props.setQ(""));

  // Only show Gender chip when it's NOT locked by initial URL
  if (!props.hideGender && props.gender && props.gender !== "all") {
    push(`Gender: ${cap(props.gender)}`, () => props.setGender("all"));
  }

  props.subs.forEach((v) => push(`Category: ${v}`, () => props.setSubs(props.subs.filter((x) => x !== v))));
  props.sizes.forEach((v) => push(`Size: ${v}`, () => props.setSizes(props.sizes.filter((x) => x !== v))));
  props.colors.forEach((v) => push(`Color: ${v}`, () => props.setColors(props.colors.filter((x) => x !== v))));
  props.brands.forEach((v) => push(`Brand: ${v}`, () => props.setBrands(props.brands.filter((x) => x !== v))));
  if (props.priceMin) push(`Min ₹${props.priceMin}`, () => props.setPriceMin(""));
  if (props.priceMax) push(`Max ₹${props.priceMax}`, () => props.setPriceMax(""));
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

function parseCSV(v) {
  if (!v) return [];
  return v.split(",").map((x) => x.trim()).filter(Boolean);
}
function csv(arr) {
  return (arr || []).join(",");
}
function mapToArray(map) {
  return Array.from(map.entries()).map(([value, count]) => ({ value, count }));
}
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
