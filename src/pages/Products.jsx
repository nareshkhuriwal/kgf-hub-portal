import { useEffect, useState } from "react";
import { getProducts } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Products() {
  const [items, setItems] = useState([]);
  const [busyId, setBusyId] = useState(null);
  const [doneId, setDoneId] = useState(null);
  const { add } = useCart();

  useEffect(() => { getProducts().then(setItems); }, []);

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
        {items.map((it) => {
          const isBusy = busyId === it.id;
          const isDone = doneId === it.id;
          return (
            <li key={it.id} className="card">
              <h3 className="card-title">{it.name}</h3>
              <p className="card-price">₹{it.price.toLocaleString("en-IN")}</p>
              <button
                onClick={() => onAdd(it)}
                className={`btn-primary mt-3 w-full disabled:opacity-60 ${isDone ? "bg-green-600 hover:bg-green-600" : ""}`}
                disabled={isBusy}
              >
                {isBusy ? "Adding..." : isDone ? "Added ✓" : "Add to Cart"}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
