export default function SavedItemRow({ item, onMoveBack, onRemoveSaved }) {
  const format = (n) => `₹${(n ?? 0).toLocaleString("en-IN")}`;
  const mrp = item.mrp ?? item.price ?? 0;
  const price = item.price ?? 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-4">
        <div className="h-20 w-16 overflow-hidden rounded-lg bg-gray-100">
          {item.image ? <img src={item.image} alt={item.name} className="h-full w-full object-cover" /> : null}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-medium">{item.name}</div>
              <div className="mt-1 text-sm text-gray-600">
                Saved item • {item.size ? `Size: ${item.size} • ` : ""}Qty: {item.qty ?? 1}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-semibold">{format(price)}</span>
                {mrp > price && <span className="text-sm text-gray-500 line-through">{format(mrp)}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50" onClick={onMoveBack}>
                Move back to cart
              </button>
              <button className="text-sm text-gray-700 hover:text-gray-900" onClick={onRemoveSaved}>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
