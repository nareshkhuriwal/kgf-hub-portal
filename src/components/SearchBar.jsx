// src/components/SearchBar.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { getClothingProducts } from "../lib/api";
import { Link } from "react-router-dom";

const POPULAR_SEARCHES = ["Polo T-Shirts", "Cargo Pants", "Kurta Sets", "Oversized Tee", "Mom Jeans"];

export default function SearchBar({ className = "" }) {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const boxRef = useRef(null);

  useEffect(() => { getClothingProducts().then(setAll); }, []);

  useEffect(() => {
    const onDoc = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return all.filter(p =>
      p.name.toLowerCase().includes(term) ||
      (p.brand||"").toLowerCase().includes(term) ||
      (p.category||"").toLowerCase().includes(term)
    ).slice(0, 8);
  }, [q, all]);

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(v => Math.min(v + 1, results.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(v => Math.max(v - 1, 0)); }
    if (e.key === "Escape")    { setOpen(false); setActive(-1); }
    if (e.key === "Enter" && active >= 0 && results[active]) {
      document.getElementById(`sr-${active}`)?.click();
    }
  };

  return (
    <div className={`relative ${className}`} ref={boxRef} aria-haspopup="listbox" aria-expanded={open}>
      <input
        type="search"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); setActive(-1); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search products"
        className="w-[340px] rounded-full border px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-yellow-400"
        aria-label="Search products"
      />
      {open && (
        <div className="absolute z-30 mt-2 w-[420px] rounded-xl border bg-white p-2 shadow-card animate-fadein" role="listbox">
          {q.trim() === "" ? (
            <div className="px-2 py-1">
              <div className="mb-1 text-xs font-semibold text-gray-500">Popular</div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((s, i) => (
                  <button key={i} onClick={() => { setQ(s); }} className="rounded-full border px-2 py-1 text-xs hover:bg-gray-50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-600">No results</div>
          ) : (
            <ul className="max-h-80 overflow-auto">
              {results.map((r, i) => (
                <li key={r.id}>
                  <Link
                    id={`sr-${i}`}
                    to={`/products?search=${encodeURIComponent(q)}#${r.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm hover:bg-gray-50 ${i === active ? "bg-gray-50" : ""}`}
                    role="option"
                    aria-selected={i === active}
                  >
                    <span className="truncate">{r.name}</span>
                    <span className="ml-3 shrink-0 text-gray-500">₹{r.price.toLocaleString("en-IN")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
