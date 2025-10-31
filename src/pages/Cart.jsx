import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import AddressBanner from "../components/cart/AddressBanner";
import CartItemRow from "../components/cart/CartItemRow";
import CouponBlock from "../components/cart/CouponBlock";
import PriceDetailsCard from "../components/cart/PriceDetailsCard";
import StickySummary from "../components/cart/StickySummary";
import { createRzpOrder, verifyPayment } from "../api/payments";
import { useNavigate } from "react-router-dom";

export default function Cart() {
  const { items, subtotal, remove, setQty, loading } = useCart();
const nav = useNavigate();

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



  const token = localStorage.getItem("kgf_token"); // or your auth hook
  console.log("Cart items:", items);
  console.log("token:", token);

  async function createLocalOrderOnServer() {
    // Minimal payload to create a draft/pending order;
    // Ideally, server recalculates totals from product ids.
    const payload = {
      order_number: `WEB-${Date.now()}`,
      customer_id: 1,                  // replace with real
      order_status: "pending",
      payment_status: "unpaid",
      fulfillment_status: "unfulfilled",
      currency: "INR",
      subtotal: subtotal,
      discount_total: 0,
      tax_total: 0,
      shipping_total: 0,
      grand_total: subtotal,
    };
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json(); // { success, data: { order_id, ... } }
    return data.data.order_id;
  }

  async function handleCheckout() {
    // 1) Create local order
    const localOrderId = await createLocalOrderOnServer();

    // 2) Create Razorpay order on backend
    const init = await createRzpOrder(token, localOrderId);
    // init: { key_id, order_id, amount, currency, customer }

    // 3) Open Razorpay Checkout
    const options = {
      key: init.key_id,
      amount: init.amount,
      currency: init.currency,
      name: "KGF HUB",
      description: `Order #${localOrderId}`,
      order_id: init.order_id,
      prefill: init.customer || {},
      theme: { color: "#0ea5e9" },
      handler: async function (response) {
        // 4) Verify signature on backend
        const ver = await verifyPayment(token, {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
        if (ver?.status === "paid") {
          // success UX
          clearCart?.();
          // navigate to success page if you have one:
          nav(`/order/success/${localOrderId}`, { replace: true });
          return;
          // alert("Payment successful!");
        } else {
          alert("Payment verification failed.");
        }
      },
      modal: {
        ondismiss: function () {
          // user closed checkout
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }




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

              <button className="btn-primary w-full py-3 text-white" onClick={handleCheckout}>
                PLACE ORDER
              </button>
           
           
            </div>
          </StickySummary>
        </div>
      </div>
    </section>
  );
}
