// src/pages/Cart.jsx
import { useCart } from "../context/CartContext";
import { createRzpOrder, verifyPayment } from "../api/payments";

export default function Cart() {
  const { items, subtotal, remove, setQty, loading, clearCart } = useCart();

  const format = (n) => `₹${n.toLocaleString("en-IN")}`;
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
          // navigate(`/order/success/${localOrderId}`)
          alert("Payment successful!");
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
        <button className="btn-primary mt-4 w-full" onClick={handleCheckout}>
          Checkout
        </button>
      </div>
    </section>
  );
}
