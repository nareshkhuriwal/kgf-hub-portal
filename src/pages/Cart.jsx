import { useCart } from "../context/CartContext";

export default function Cart() {
  const { items, subtotal, remove, setQty, loading } = useCart();

  if (loading) return <p>Loading...</p>;
  const format = (n) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Your Cart</h2>

      {items.length === 0 ? (
        <p className="text-gray-600">No items yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
              <div>
                <div className="font-medium">{it.name}</div>
                <div className="text-sm text-gray-600">{format(it.price)} × {it.qty ?? 1}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="btn-outline px-2" onClick={() => setQty(it.id, Math.max(1, (it.qty ?? 1) - 1))}>−</button>
                <span className="min-w-6 text-center">{it.qty ?? 1}</span>
                <button className="btn-outline px-2" onClick={() => setQty(it.id, (it.qty ?? 1) + 1)}>+</button>
                <button className="btn-outline" onClick={() => remove(it.id)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border bg-white p-5">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold">{format(subtotal)}</span>
        </div>
        <button className="btn-primary mt-4 w-full">Checkout</button>
      </div>
    </section>
  );
}
