import { useCart } from "../context/CartContext";

export default function MiniCartDrawer() {
  const { isOpen, closeCart, items, subtotal, setQty, remove, loading } = useCart();
  const money = (n) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[92vw] max-w-sm transform border-l bg-white shadow-xl transition-transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mini cart"
      >
        <div className="flex h-14 items-center justify-between border-b px-4">
          <h3 className="text-base font-semibold">Your Cart</h3>
          <button onClick={closeCart} className="rounded-lg border px-2 py-1 text-sm hover:bg-gray-50" aria-label="Close cart">✕</button>
        </div>

        <div className="flex h-[calc(100%-56px-140px)] flex-col overflow-auto p-4">
          {loading ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-gray-600">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between rounded-xl border bg-white p-3">
                  <div>
                    <div className="text-sm font-medium">{it.name}</div>
                    <div className="text-xs text-gray-600">{money(it.price)}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="btn-outline px-2" onClick={() => setQty(it.id, (it.qty ?? 1) - 1)} aria-label="Decrease">−</button>
                    <span className="min-w-6 text-center text-sm">{it.qty ?? 1}</span>
                    <button className="btn-outline px-2" onClick={() => setQty(it.id, (it.qty ?? 1) + 1)} aria-label="Increase">+</button>
                    <button className="btn-outline" onClick={() => remove(it.id)} aria-label="Remove">Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer summary */}
        <div className="absolute bottom-0 left-0 right-0 border-t bg-white p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-semibold">{money(subtotal)}</span>
          </div>
          <div className="flex gap-2">
            <button className="btn-outline w-1/2" onClick={closeCart}>Continue shopping</button>
            <a href="/cart" className="btn-primary w-1/2 text-center" onClick={closeCart}>View cart</a>
          </div>
        </div>
      </aside>
    </>
  );
}
