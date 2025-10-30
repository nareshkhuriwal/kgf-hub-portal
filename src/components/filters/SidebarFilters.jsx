// src/components/filters/SidebarFilters.jsx
import React from "react";

export default function SidebarFilters({
  facets,
  gender, setGender,
  sub, setSub,            // <-- now labeled as "Category"
  size, setSize,
  color, setColor,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  brand, setBrand,
  inStock, setInStock,    // kept but shown as a small checkbox header tool
  rating, setRating,
  discount, setDiscount,
  sort, setSort,
  onClearAll,
}) {
  const Section = ({ title, children, className = "" }) => (
    <div className={`rounded-xl border p-3 ${className}`}>
      <div className="mb-2 text-sm font-semibold text-gray-800">{title}</div>
      {children}
    </div>
  );

  return (
    // narrower: from lg:w-72 → lg:w-64
    <aside className="sticky top-16 flex w-full flex-col gap-3 lg:w-64">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Filters</div>
        <button onClick={onClearAll} className="text-xs text-gray-600 hover:underline">Clear all</button>
      </div>

      {/* (1) Gender (formerly labeled Category) */}
      <Section title="Gender">
        <div className="grid grid-cols-3 gap-2">
          {["all", "men", "women", "kids"].map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                gender === g ? "bg-black text-white" : "hover:bg-gray-50"
              }`}
            >
              {g[0].toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
        {/* small in-stock toggle lives at the top as an option */}
        <label className="mt-2 flex items-center gap-2 text-xs text-gray-700">
          <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
          In stock only
        </label>
      </Section>

      {/* (2) Category (formerly Sub-category) */}
      {facets.subCategories.length > 0 && (
        <Section title="Category">
          <div className="flex flex-wrap gap-2">
            <Pill active={sub === ""} onClick={() => setSub("")}>Any</Pill>
            {facets.subCategories.slice(0, 16).map((s) => (
              <Pill key={s} active={sub === s} onClick={() => setSub(sub === s ? "" : s)}>{s}</Pill>
            ))}
          </div>
        </Section>
      )}

      {/* (3) Size */}
      <Section title="Size">
        <div className="flex flex-wrap gap-2">
          <SizePill active={!size} onClick={() => setSize("")}>Any</SizePill>
          {facets.sizes.slice(0, 18).map((s) => (
            <SizePill key={s} active={size === s} onClick={() => setSize(size === s ? "" : s)}>{s}</SizePill>
          ))}
        </div>
      </Section>

      {/* (4) Color */}
      {facets.colors.length > 0 && (
        <Section title="Color">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setColor("")}
              className={`px-3 py-1 text-xs rounded-full border ${
                !color ? "bg-black text-white" : "hover:bg-gray-50"
              }`}
            >
              Any
            </button>
            {facets.colors.slice(0, 14).map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(color === c.name ? "" : c.name)}
                className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs ${
                  color === c.name ? "bg-black text-white" : "hover:bg-gray-50"
                }`}
                title={c.name}
              >
                <span className="h-3.5 w-3.5 rounded-full border" style={{ backgroundColor: c.code }} />
                {c.name}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* (5) Price */}
      <Section title="Price">
        <div className="flex gap-2">
          <input
            inputMode="numeric"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ""))}
            placeholder={facets.priceMin ? String(facets.priceMin) : "0"}
            className="w-1/2 rounded-full border px-3 py-1.5 text-sm outline-none focus:ring"
            aria-label="Min price"
          />
          <input
            inputMode="numeric"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value.replace(/\D/g, ""))}
            placeholder={facets.priceMax ? String(facets.priceMax) : "0"}
            className="w-1/2 rounded-full border px-3 py-1.5 text-sm outline-none focus:ring"
            aria-label="Max price"
          />
        </div>
      </Section>

      {/* (6) Brand */}
      {facets.brands.length > 0 && (
        <Section title="Brand">
          <div className="flex flex-wrap gap-2">
            <Pill active={!brand} onClick={() => setBrand("")}>Any</Pill>
            {facets.brands.slice(0, 10).map((b) => (
              <Pill key={b} active={brand === b} onClick={() => setBrand(brand === b ? "" : b)}>{b}</Pill>
            ))}
          </div>
        </Section>
      )}

      {/* (7) Rating */}
      <Section title="Rating">
        <div className="grid grid-cols-2 gap-2">
          {[0, 3, 4].map((r) => (
            <button
              key={r}
              onClick={() => setRating(r)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                rating === r ? "bg-black text-white" : "hover:bg-gray-50"
              }`}
            >
              {r === 0 ? "Any" : `${r}★ & up`}
            </button>
          ))}
        </div>
      </Section>

      {/* (8) Discount */}
      <Section title="Discount">
        <div className="grid grid-cols-2 gap-2">
          {[0, 10, 20, 30, 50].map((d) => (
            <button
              key={d}
              onClick={() => setDiscount(d)}
              className={`rounded-full border px-3 py-1.5 text-xs ${
                discount === d ? "bg-black text-white" : "hover:bg-gray-50"
              }`}
            >
              {d === 0 ? "Any" : `${d}%+`}
            </button>
          ))}
        </div>
      </Section>

      {/* Sort kept at the end of sidebar, also duplicated above grid on desktop */}
      <Section title="Sort by" className="mb-1">
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-full border px-3 py-2 text-sm outline-none focus:ring"
        >
          <option value="relevance">Relevance</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="rating">Customer Rating</option>
          <option value="new">New Arrivals</option>
        </select>
      </Section>
    </aside>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs ${active ? "bg-black text-white" : "hover:bg-gray-50"}`}
    >
      {children}
    </button>
  );
}

function SizePill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`size-pill ${active ? "size-pill-active" : ""}`}
    >
      {children}
    </button>
  );
}
