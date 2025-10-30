// src/components/filters/SidebarFilters.jsx
import { useState } from "react";

export default function SidebarFilters({
  // counts
  subCounts = [],
  sizeCounts = [],
  colorCounts = [],
  brandCounts = [],
  // selections
  gender, setGender,
  subs, setSubs,
  sizes, setSizes,
  colors, setColors,
  brands, setBrands,
  priceMin, setPriceMin,
  priceMax, setPriceMax,
  rating, setRating,
  discount, setDiscount,
  // sort props are accepted but not rendered here (desktop has top sorter)
  sort, setSort,
  priceRange = { min: 0, max: 0 },
  onClearAll,
  // NEW: hide Gender facet (when gender locked via URL)
  hideGender = false,
}) {
  return (
    <aside className="sticky top-20 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Filters</h3>
        <button onClick={onClearAll} className="text-xs text-gray-600 hover:underline">
          Clear all
        </button>
      </div>

      {!hideGender && (
        <Group title="Gender">
          <div className="grid gap-2">
            {["all", "men", "women", "kids"].map((g) => (
              <label key={g} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={gender === g}
                  onChange={(e) => setGender(e.target.value)}
                />
                <span className="capitalize">{g}</span>
              </label>
            ))}
          </div>
        </Group>
      )}

      <Group title="Category" clear={() => setSubs([])} hasClear={subs.length > 0}>
        <Checklist
          items={subCounts}
          selected={subs}
          onToggle={(v) => toggleMulti(v, subs, setSubs)}
        />
      </Group>

      {/* SIZE: custom order S > M > L > XL > XXL (XS before S), then numerics, then others */}
      <Group title="Size" clear={() => setSizes([])} hasClear={sizes.length > 0}>
        <Checklist
          items={sizeCounts}
          selected={sizes}
          onToggle={(v) => toggleMulti(v, sizes, setSizes)}
          sortMode="size"
        />
      </Group>

      <Group title="Color" clear={() => setColors([])} hasClear={colors.length > 0}>
        <ColorSwatches
          items={colorCounts}
          selected={colors}
          onToggle={(v) => toggleMulti(v, colors, setColors)}
        />
      </Group>

      <Group title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder={priceRange.min ? String(priceRange.min) : "Min"}
            className="w-24 rounded border px-2 py-1 text-sm"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder={priceRange.max ? String(priceRange.max) : "Max"}
            className="w-24 rounded border px-2 py-1 text-sm"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
          />
        </div>
      </Group>

      <Group title="Brand" clear={() => setBrands([])} hasClear={brands.length > 0}>
        <Checklist
          items={brandCounts}
          selected={brands}
          onToggle={(v) => toggleMulti(v, brands, setBrands)}
        />
      </Group>

      <Group title="Rating">
        <Pills
          items={[5, 4, 3, 2].map((n) => ({ value: n, label: `${n}★ & up` }))}
          selected={rating}
          onSelect={(v) => setRating(v === rating ? 0 : v)}
        />
      </Group>

      <Group title="Discount">
        <Pills
          items={[50, 40, 30, 20].map((n) => ({ value: n, label: `${n}%+` }))}
          selected={discount}
          onSelect={(v) => setDiscount(v === discount ? 0 : v)}
        />
      </Group>

      {/* NOTE: "Sort by" removed from sidebar (desktop already has sorter above grid) */}
    </aside>
  );
}

/* ---------- UI bits ---------- */
function Group({ title, children, clear, hasClear }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rounded-2xl border">
      <button
        className="flex w-full items-center justify-between px-3 py-2"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{title}</span>
        <div className="flex items-center gap-3">
          {hasClear && clear && (
            <button
              className="text-xs text-gray-600 hover:underline"
              onClick={(e) => { e.stopPropagation(); clear(); }}
            >
              Clear
            </button>
          )}
          <span className={`transition-transform ${open ? "rotate-180" : ""}`}>⌃</span>
        </div>
      </button>
      <div className={`${open ? "block" : "hidden"} px-3 pb-3`}>{children}</div>
    </div>
  );
}

function Checklist({ items = [], selected = [], onToggle, sortMode }) {
  const sorted = sortMode === "size" ? [...items].sort(sizeComparator) : [...items].sort(aToZ);
  return (
    <ul className="grid gap-2">
      {sorted.map(({ value, count }) => (
        <li key={value}>
          <label className="flex cursor-pointer items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onToggle(value)}
              />
              <span>{value}</span>
            </span>
            <span className="text-xs text-gray-500">{count}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

function ColorSwatches({ items = [], selected = [], onToggle }) {
  const sorted = [...items].sort(aToZ);
  return (
    <div className="flex flex-wrap gap-2">
      {sorted.map(({ value, count }) => (
        <button
          key={value}
          title={`${value} (${count})`}
          onClick={() => onToggle(value)}
          className={`relative h-7 w-7 rounded-full border transition ${
            selected.includes(value) ? "ring-2 ring-gray-900" : ""
          }`}
          aria-pressed={selected.includes(value)}
        >
          <span className="absolute -right-1 -top-1 rounded bg-white px-1 text-[10px] text-gray-700">
            {count}
          </span>
          <span
            className="absolute inset-0 rounded-full"
            style={{ background: swatchColor(value) }}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}

function Pills({ items = [], selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button
          key={it.value}
          onClick={() => onSelect(it.value)}
          className={`rounded-full border px-3 py-1 text-xs ${
            selected === it.value ? "bg-gray-900 text-white" : "hover:bg-gray-50"
          }`}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

/* ---------- utils ---------- */
function toggleMulti(v, arr, setter) {
  setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
}
function aToZ(a, b) {
  return String(a.value).localeCompare(String(b.value), undefined, { sensitivity: "base" });
}

// Size sorting: kids ages first (by starting age), then letters XS..XXL, then numerics, then others
const LETTER_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];
const KIDS_AGE = /^(\d{1,2})-(\d{1,2})Y$/i;

function sizeRank(val) {
  const v = String(val).toUpperCase();
  const m = v.match(KIDS_AGE);
  if (m) return [0, Number(m[1])];                           // kids: 3-4Y < 5-6Y < …
  const letterIdx = LETTER_ORDER.indexOf(v);
  if (letterIdx !== -1) return [1, letterIdx];               // XS < S < M < L < XL < XXL
  const num = parseInt(v.replace(/\D/g, ""), 10);
  if (!Number.isNaN(num)) return [2, num];                   // numeric sizes (if any left)
  return [3, v];                                             // others A→Z
}

function sizeComparator(a, b) {
  const [ga, ia] = sizeRank(a.value ?? a);                   // supports {value,count} or raw string
  const [gb, ib] = sizeRank(b.value ?? b);
  if (ga !== gb) return ga - gb;
  if (typeof ia === "number" && typeof ib === "number") return ia - ib;
  return String(ia).localeCompare(String(ib));
}

function swatchColor(name) {
  const n = (name || "").toLowerCase();
  if (n.includes("black")) return "#111827";
  if (n.includes("white")) return "#F3F4F6";
  if (n.includes("blue")) return "#3B82F6";
  if (n.includes("red")) return "#EF4444";
  if (n.includes("green")) return "#10B981";
  if (n.includes("grey") || n.includes("gray")) return "#9CA3AF";
  if (n.includes("mint")) return "#6EE7B7";
  if (n.includes("rose") || n.includes("blush")) return "#FECACA";
  if (n.includes("mustard")) return "#F59E0B";
  if (n.includes("sunflower")) return "#FDE68A";
  return "#E5E7EB";
}
