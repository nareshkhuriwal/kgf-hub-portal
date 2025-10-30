// src/components/filters/MobileFiltersSheet.jsx
export default function MobileFiltersSheet(props) {
  const {
    open, onClose,
    // counts
    subCounts, sizeCounts, colorCounts, brandCounts,
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
    sort, setSort,
    priceRange,
    onClearAll,
  } = props;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[90vh] translate-y-0 rounded-t-2xl bg-white shadow-2xl transition-transform ${open ? "translate-y-0" : "translate-y-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">Filters & Sort</div>
          <div className="flex items-center gap-3">
            <button onClick={onClearAll} className="text-xs text-gray-600 hover:underline">Reset</button>
            <button onClick={onClose} className="rounded border px-2 py-1 text-sm">Close</button>
          </div>
        </div>

        <div className="overflow-y-auto p-4">
          <Section title="Gender">
            <div className="grid gap-2">
              {["all", "men", "women", "kids"].map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="m-gender" value={g} checked={gender === g} onChange={(e) => setGender(e.target.value)} />
                  <span className="capitalize">{g}</span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Category">
            <Checklist items={subCounts} selected={subs} onToggle={(v) => toggle(v, subs, setSubs)} />
          </Section>

          <Section title="Size">
            <Checklist items={sizeCounts} selected={sizes} onToggle={(v) => toggle(v, sizes, setSizes)} />
          </Section>

          <Section title="Color">
            <Checklist items={colorCounts} selected={colors} onToggle={(v) => toggle(v, colors, setColors)} />
          </Section>

          <Section title="Price">
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
          </Section>

          <Section title="Brand">
            <Checklist items={brandCounts} selected={brands} onToggle={(v) => toggle(v, brands, setBrands)} />
          </Section>

          <Section title="Rating">
            <Pills items={[5,4,3,2].map(n => ({value:n,label:`${n}★ & up`}))} selected={rating} onSelect={(v) => setRating(v === rating ? 0 : v)} />
          </Section>

          <Section title="Discount">
            <Pills items={[50,40,30,20].map(n => ({value:n,label:`${n}%+`}))} selected={discount} onSelect={(v) => setDiscount(v === discount ? 0 : v)} />
          </Section>

          <Section title="Sort by">
            <select value={sort} onChange={(e) => e.target.value && setSort(e.target.value)} className="w-full rounded border px-3 py-2 text-sm">
              <option value="relevance">Relevance</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="rating">Customer Rating</option>
              <option value="new">New Arrivals</option>
            </select>
          </Section>
        </div>

        <div className="border-t p-4">
          <button onClick={onClose} className="btn-primary w-full">Apply</button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function Checklist({ items = [], selected = [], onToggle }) {
  return (
    <ul className="grid gap-2">
      {items.sort((a,b)=> String(a.value).localeCompare(String(b.value))).map(({ value, count }) => (
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

function toggle(v, arr, setter) {
  setter(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
}
