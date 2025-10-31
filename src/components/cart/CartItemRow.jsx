export default function CartItemRow({ item, onQtyChange, onRemove }) {
  const qty = item.qty ?? 1;
  const format = (n) => `₹${(n ?? 0).toLocaleString("en-IN")}`;
  const mrp = item.mrp ?? item.price ?? 0;
  const price = item.price ?? 0;
  const unitSavings = Math.max(mrp - price, 0);

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-4">
        {/* Image */}
        <div className="h-24 w-20 overflow-hidden rounded-lg bg-gray-100">
          {item.image ? (
            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
          ) : null}
        </div>

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-medium">{item.name}</div>
              {item.seller && <div className="text-xs text-gray-500">Sold by: {item.seller}</div>}
              <div className="mt-2 flex items-center gap-2 text-sm">
                {item.size && (
                  <span className="inline-flex items-center rounded-md border px-2 py-1 text-gray-700">
                    Size: {item.size}
                  </span>
                )}
                <span className="inline-flex items-center rounded-md border px-2 py-1 text-gray-700">
                  Qty: {qty}
                </span>
                {item.stockLeft != null && (
                  <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                    {item.stockLeft} left
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                className="btn-outline px-2"
                onClick={() => onQtyChange(Math.max(1, qty - 1))}
                aria-label="decrease quantity"
              >
                −
              </button>
              <span className="min-w-6 text-center">{qty}</span>
              <button
                className="btn-outline px-2"
                onClick={() => onQtyChange(qty + 1)}
                aria-label="increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {/* Price row */}
          <div className="mt-3 flex items-center gap-3">
            <div className="text-lg font-semibold">{format(price)}</div>
            {mrp > price && <div className="text-sm text-gray-500 line-through">{format(mrp)}</div>}
            {unitSavings > 0 && (
              <div className="text-sm font-medium text-green-600">{format(unitSavings)} OFF</div>
            )}
          </div>

          {/* Meta */}
          <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
            {item.returnDays ? <span>↩ {item.returnDays} days return available</span> : null}
            {item.eta ? (
              <span className="text-green-700">✓ Delivery by {formatEta(item.eta)}</span>
            ) : null}
          </div>

          {/* Row actions */}
          <div className="mt-3 flex items-center gap-4 text-sm">
            <button className="text-gray-700 hover:text-gray-900" onClick={onRemove}>Remove</button>
            <button className="text-gray-700 hover:text-gray-900">Move to wishlist</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatEta(eta) {
  try {
    const d = typeof eta === "string" ? new Date(eta) : eta;
    return d?.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return eta;
  }
}
