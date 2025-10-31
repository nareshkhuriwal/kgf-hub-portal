import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import AddressBanner from "../components/cart/AddressBanner";
import CartItemRow from "../components/cart/CartItemRow";
import CouponBlock from "../components/cart/CouponBlock";
import PriceDetailsCard from "../components/cart/PriceDetailsCard";
import StickySummary from "../components/cart/StickySummary";

export default function Cart() {
  const { items, subtotal, remove, setQty, loading } = useCart();

  const [address] = useState({
    id: "addr1",
    name: "John Doe",
    line1: "123, Main Street",
    city: "new york",
    state: "NY",
    pincode: "10001",
  });
  const [coupon, setCoupon] = useState(null); // { code, discount, lines: [{label,amount}] }
  const [platformFee] = useState(23); // configurable

  const format = (n) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

  // Derive MRP/discounts from items (works even if item.mrp not present)
  const price = useMemo(() => {
    const totalMrp = items.reduce((s, it) => s + (it.mrp ?? it.price) * (it.qty ?? 1), 0);
    const totalSelling = items.reduce((s, it) => s + (it.price ?? 0) * (it.qty ?? 1), 0);
    const discountOnMrp = totalMrp - totalSelling;
    const couponDiscount = coupon?.discount ?? 0;

   
    const grandTotal = Math.max(totalSelling - couponDiscount + platformFee +  0);

    return {
      totalMrp,
      discountOnMrp,
      couponDiscount,
      platformFee,
      grandTotal,
    };
  }, [items, coupon, platformFee]);

  if (loading) return <p>Loading...</p>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* LEFT: address, offers, items */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
          <AddressBanner address={address} />

          {items.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-gray-600">No items yet.</div>
          ) : (
            <div className="space-y-3">
              {items.map((it) => (
                <CartItemRow
                  key={it.id}
                  item={it}
                  onQtyChange={(q) => setQty(it.id, q)}
                  onRemove={() => remove(it.id)}
                />
              ))}
            </div>
          )}

          <button className="mt-4 inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
            <span className="rounded-md border px-2 py-1">+</span>
            Add More From Wishlist
          </button>
        </div>

        {/* RIGHT: sticky summary */}
        <div className="md:col-span-5 lg:col-span-4">
          <StickySummary>
            <div className="space-y-4">
              <CouponBlock
                coupon={coupon}
                onApply={(code) => {
                  // Mock apply: flat ₹100 off for demo
                  setCoupon({ code, discount: 100, lines: [{ label: `Coupon (${code})`, amount: 100 }] });
                }}
                onRemove={() => setCoupon(null)}
              />

              <PriceDetailsCard
                price={price}
                coupon={coupon}
                format={format}
              />

              <button className="btn-primary w-full py-3 text-white">
                PLACE ORDER
              </button>
            </div>
          </StickySummary>
        </div>
      </div>
    </section>
  );
}
