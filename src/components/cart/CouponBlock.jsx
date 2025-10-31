import { useState } from "react";

export default function CouponBlock({ coupon, onApply, onRemove }) {
  const [code, setCode] = useState("");

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 font-medium">Apply Coupons</div>

      {coupon ? (
        <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 text-green-800">
          <div className="text-sm">
            <span className="font-semibold">{coupon.code}</span> applied — you saved ₹{coupon.discount}
          </div>
          <button className="text-sm underline" onClick={onRemove}>
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="w-full rounded-lg border px-3 py-2 outline-none focus:border-gray-400"
            placeholder="Enter coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
          />
          <button
            className="rounded-lg bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 disabled:opacity-50"
            onClick={() => code && onApply(code)}
            disabled={!code}
          >
            APPLY
          </button>
        </div>
      )}
    </div>
  );
}
