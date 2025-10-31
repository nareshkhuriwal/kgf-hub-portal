export default function PriceDetailsCard({ price, coupon, format }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-2 text-sm font-semibold text-gray-600">PRICE DETAILS</div>

      <Row label="Total MRP" value={format(price.totalMrp)} />
      <Row label="Discount on MRP" value={`- ${format(price.discountOnMrp)}`} valueClass="text-green-600" />
      <Row
        label="Coupon Discount"
        value={coupon ? `- ${format(price.couponDiscount)}` : "Apply Coupon"}
        valueClass={coupon ? "text-green-600" : "text-pink-600"}
      />
      <Row label="Shipping" value={price.shipping > 0 ? format(price.shipping) : "Free"} />
      <Row
        label={
          <span className="inline-flex items-center gap-1">
            Platform Fee <span className="cursor-help text-xs text-gray-400"></span>
          </span>
        }
        value={format(price.platformFee)}
      />

      <div className="my-3 h-px w-full bg-gray-200" />

      <Row
        label={<span className="font-semibold">Total Amount</span>}
        value={<span className="font-semibold">{format(price.grandTotal)}</span>}
      />
    </div>
  );
}

function Row({ label, value, valueClass }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <div className="text-gray-700">{label}</div>
      <div className={valueClass}>{value}</div>
    </div>
  );
}
