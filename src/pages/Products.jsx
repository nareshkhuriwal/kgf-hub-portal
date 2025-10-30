// src/pages/Products.jsx
import { useEffect, useMemo, useState } from "react";
import { getClothingProducts } from "../lib/api";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

export default function Products() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [doneId, setDoneId] = useState(null);
  const { add } = useCart();

  useEffect(() => {
    getClothingProducts().then(setItems);
  }, []);

  const filtered = useFiltered(items);

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

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-semibold">Products</h2>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((it) => {
          const isBusy = busyId === it.id;
          const isDone = doneId === it.id;
          const hasMrp = it.mrp && it.mrp > it.price;
          const discount = hasMrp
            ? Math.round(((it.mrp - it.price) / it.mrp) * 100)
            : (it.discountPct || 0);

          return (
            <li key={it.id} className="card">
              {/* Image → PDP */}
              <Link to={`/product/${it.id}`} aria-label={`${it.name} details`}>
                <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={it.thumbnail}
                    alt={it.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Link>

              {/* Title → PDP */}
              <Link to={`/product/${it.id}`} className="card-title mt-2 line-clamp-1">
                {it.name}
              </Link>

              {/* Price row */}
              <div className="mt-1 flex items-center gap-2">
                <span className="card-price font-semibold">
                  ₹{it.price.toLocaleString("en-IN")}
                </span>
                {hasMrp && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{it.mrp.toLocaleString("en-IN")}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-semibold text-green-600">
                    {discount}% OFF
                  </span>
                )}
              </div>

              {/* Add to cart */}
              <button
                onClick={() => onAdd(it)}
                disabled={isBusy}
                className={`btn-primary mt-3 w-full disabled:opacity-60 ${
                  isDone ? "bg-green-600 hover:bg-green-600" : ""
                }`}
              >
                {isBusy ? "Adding..." : isDone ? "Added ✓" : "Add to Cart"}
              </button>
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="text-gray-600">No products found.</p>
      )}
    </section>
  );
}

function useFiltered(items) {
  const params = new URLSearchParams(location.search);
  const cat = params.get("cat")?.toLowerCase() || "";
  const sub = params.get("sub")?.toLowerCase() || "";
  const q = params.get("search")?.toLowerCase() || "";

  return useMemo(() => {
    return items.filter((p) => {
      const okCat =
        !cat || p.gender === cat || p.category?.toLowerCase() === cat;
      const okSub = !sub || p.subCategory?.toLowerCase() === sub;
      const okQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);
      return okCat && okSub && okQ;
    });
  }, [items, cat, sub, q]);
}
