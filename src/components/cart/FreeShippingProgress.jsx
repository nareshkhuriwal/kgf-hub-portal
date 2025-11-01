import React from "react";

/**
 * Free shipping progress (Express) based on subtotal after discounts (before shipping/fees).
 * Props:
 *  - price: { totalMrp, discountOnMrp, couponDiscount }
 *  - threshold: number (e.g., 499
 *  - shipping: current shipping option (optional, for small status hint)
 */
export default function FreeShippingProgress({ price, threshold = 499, shipping }) {
  if (!price) return null;

  // Eligible subtotal = merchandise total after promos & coupons (before shipping/fees)
  const eligibleSubtotal = Math.max(
    (price.totalMrp || 0) - (price.discountOnMrp || 0) - (price.couponDiscount || 0),
    0
  );

  const remaining = Math.max(threshold - eligibleSubtotal, 0);
  const pct = Math.max(0, Math.min(100, Math.round((eligibleSubtotal / threshold) * 100)));

  const eligible = remaining === 0;

  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium">Free Express shipping</span>
        <span className={`text-xs ${eligible ? "text-green-700" : "text-gray-500"}`}>
          {eligible ? "Unlocked" : `Target: ₹${threshold.toLocaleString("en-IN")}`}
        </span>
      </div>

      {/* Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className={`h-full ${eligible ? "bg-green-500" : "bg-gray-900"}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Copy */}
      <div className="mt-2 text-xs">
        {eligible ? (
          <span className="text-green-700">
            You unlocked <span className="font-medium">Free Express</span>
            {shipping?.id === "standard" ? " — you can switch to Express." : ""}
          </span>
        ) : (
          <span className="text-gray-600">
            Add <span className="font-medium">₹{remaining.toLocaleString("en-IN")}</span>{" "}
            more to get <span className="font-medium">Free Express</span>.
          </span>
        )}
      </div>
    </div>
  );
}
