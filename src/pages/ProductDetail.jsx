// src/pages/ProductDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getClothingProduct, getClothingProducts } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();

  const [prod, setProd] = useState(null);
  const [all, setAll] = useState([]);
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    getClothingProduct(id).then((p) => {
      setProd(p);
      setImgIdx(0);
      setSize("");
      setColor(p?.colors?.[0]?.name || "");
    });
    getClothingProducts().then(setAll);
  }, [id]);

  const stockFor = (s) => (prod?.stock ? (prod.stock[s] ?? 0) : 0);
  const discount = useMemo(() => {
    if (!prod) return 0;
    const hasMrp = prod.mrp && prod.mrp > prod.price;
    return hasMrp ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100) : (prod.discountPct || 0);
  }, [prod]);

  const also = useMemo(() => {
    if (!prod) return [];
    return all
      .filter((x) => x.id !== prod.id && (x.category === prod.category || x.brand === prod.brand))
      .slice(0, 6);
  }, [all, prod]);

  const canAdd = !!prod && !!size && stockFor(size) > 0;

  const handleAdd = async () => {
    if (!canAdd) return;
    setBusy(true);
    try {
      await add({
        productId: prod.id,
        name: prod.name,
        price: prod.price,
        qty: 1,
        size,
        color,
      });
      setDone(true);
      setTimeout(() => setDone(false), 1200);
    } finally {
      setBusy(false);
    }
  };

  if (!prod) return <div className="container-outer py-10">Loading...</div>;

  return (
    <div className="container-outer py-8">
      {/* Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link to="/" className="hover:text-gray-800">Home</Link> <span>/</span>{" "}
        <button onClick={() => navigate(-1)} className="hover:text-gray-800">Back</button> <span>/</span>{" "}
        <span className="text-gray-800">{prod.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/5] overflow-hidden rounded-2xl border bg-gray-50">
            <img
              src={prod.images?.[imgIdx] || prod.thumbnail}
              alt={prod.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-3 flex gap-3 overflow-x-auto">
            {(prod.images?.length ? prod.images : [prod.thumbnail]).map((src, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-xl border ${i === imgIdx ? "ring-2 ring-gray-900" : ""}`}
              >
                <img src={src} alt={`thumb-${i}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-semibold">{prod.name}</h1>
          <div className="mt-1 text-sm text-gray-500">{prod.brand}</div>

          <div className="mt-3 flex items-center gap-3">
            <div className="text-2xl font-semibold">₹{prod.price.toLocaleString("en-IN")}</div>
            {prod.mrp && prod.mrp > prod.price && (
              <div className="text-gray-500 line-through">₹{prod.mrp.toLocaleString("en-IN")}</div>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Color swatches */}
          {prod.colors?.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 text-sm font-medium text-gray-700">Color</div>
              <div className="flex flex-wrap gap-2">
                {prod.colors.map((c) => (
                  <button
                    key={c.name}
                    title={c.name}
                    onClick={() => setColor(c.name)}
                    className={`swatch ${color === c.name ? "swatch-active" : ""}`}
                    style={{ backgroundColor: c.code }}
                    aria-label={c.name}
                  />
                ))}
              </div>
              <div className="mt-1 text-xs text-gray-500">{color || prod.colors[0].name}</div>
            </div>
          )}

          {/* Size selector */}
          <div className="mt-6">
            <div className="mb-2 text-sm font-medium text-gray-700">Size</div>
            <div className="grid max-w-md grid-cols-6 gap-2">
              {prod.sizes?.map((s) => {
                const qty = stockFor(s);
                const disabled = qty <= 0;
                const selected = size === s;
                return (
                  <button
                    key={s}
                    onClick={() => !disabled && setSize(s)}
                    className={`size-pill ${selected ? "size-pill-active" : ""} ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
                    aria-disabled={disabled}
                    title={disabled ? "Out of stock" : "In stock"}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              {size ? (stockFor(size) > 0 ? "In stock" : "Out of stock") : "Select a size"}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAdd}
              disabled={!canAdd || busy}
              className={`btn-primary px-6 ${done ? "bg-green-600 hover:bg-green-600" : ""}`}
            >
              {busy ? "Adding..." : done ? "Added ✓" : "Add to Cart"}
            </button>
            <Link
              to="/products"
              className="inline-flex items-center rounded-full border px-5 py-2 text-sm hover:bg-gray-50"
            >
              Continue Shopping
            </Link>
          </div>

          {/* Details */}
          <div className="mt-8 divide-y rounded-2xl border">
            <Row label="Fabric" value={prod.fabric || "-"} />
            <Row label="Fit" value={prod.fit || "-"} />
            <Row label="Care" value={prod.care || "-"} />
          </div>
        </div>
      </div>

      {/* Also like */}
      {also.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-semibold">You may also like</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {also.map((it) => (
              <li key={it.id} className="card">
                <Link to={`/product/${it.id}`}>
                  <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100">
                    <img src={it.thumbnail} alt={it.name} className="h-full w-full object-cover" />
                  </div>
                </Link>
                <Link to={`/product/${it.id}`} className="card-title mt-2 line-clamp-1">
                  {it.name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="card-price font-semibold">₹{it.price.toLocaleString("en-IN")}</span>
                  {it.mrp && it.mrp > it.price && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{it.mrp.toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-start gap-4 px-4 py-3 text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="text-gray-800">{value}</div>
    </div>
  );
}
