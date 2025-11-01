import { useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import AddressBanner from "../components/cart/AddressBanner";
import AddressModal from "../components/cart/AddressModal";
import CartItemRow from "../components/cart/CartItemRow";
import CouponBlock from "../components/cart/CouponBlock";
import PriceDetailsCard from "../components/cart/PriceDetailsCard";
import StickySummary from "../components/cart/StickySummary";
import { createRzpOrder, verifyPayment } from "../api/payments";
import { useNavigate } from "react-router-dom";
import ShippingOptions from "../components/cart/ShippingOptions";

// ➕ NEW
import SavedItemRow from "../components/cart/SavedItemRow";
import { loadSavedIds, saveSavedIds } from "../utils/savedStorage";

export default function Cart() {
  const { items, subtotal, remove, setQty, loading, clearCart } = useCart();
  const nav = useNavigate();

const [address, setAddress] = useState({
    id: "addr1",
    name: "John Doe",
    line1: "123, Main Street",
    city: "new york",
    state: "NY",
    pincode: "10001",
  });
  const [addressOpen, setAddressOpen] = useState(false);
  const [coupon, setCoupon] = useState(null); // { code, discount, lines: [{label,amount}] }
  const [platformFee] = useState(23); // configurable
  const [shipping, setShipping] = useState(null); // { id, label, price, eta, available }

  // ➕ NEW: persisted saved IDs
  const [savedIds, setSavedIds] = useState(() => new Set(loadSavedIds()));

  // Partition items into visible cart vs saved
  const cartVisibleItems = useMemo(
    () => items.filter((it) => !savedIds.has(it.id)),
    [items, savedIds]
  );
  const savedItems = useMemo(
    () => items.filter((it) => savedIds.has(it.id)),
    [items, savedIds]
  );

  const format = (n) => `₹${(n ?? 0).toLocaleString("en-IN")}`;

  // Derive MRP/discounts **only from visible cart items**
  const price = useMemo(() => {
    const totalMrp = cartVisibleItems.reduce((s, it) => s + (it.mrp ?? it.price) * (it.qty ?? 1), 0);
    const totalSelling = cartVisibleItems.reduce((s, it) => s + (it.price ?? 0) * (it.qty ?? 1), 0);
    const discountOnMrp = totalMrp - totalSelling;
    const couponDiscount = coupon?.discount ?? 0;
    const shippingCost = shipping?.price ?? 0;

    const grandTotal = Math.max(totalSelling - couponDiscount + platformFee + shippingCost, 0);

    return {
      totalMrp,
      discountOnMrp,
      couponDiscount,
      platformFee,
      shipping: shippingCost,
      grandTotal,
    };
  }, [cartVisibleItems, coupon, platformFee, shipping]);

  const token = localStorage.getItem("kgf_token"); // or your auth hook
  console.log("Cart items:", items);
  console.log("token:", token);

  // ➕ NEW: Save / Move-back helpers (persist ids)
  function moveToSaved(id) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSavedIds([...next]);
      return next;
    });
  }
  function moveBack(id) {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSavedIds([...next]);
      return next;
    });
  }
  function removeFromSaved(id) {
    // Remove from both saved set and actual cart
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveSavedIds([...next]);
      return next;
    });
    remove(id);
  }

  async function createLocalOrderOnServer() {
    const payload = {
      order_number: `WEB-${Date.now()}`,
      customer_id: 1,
      order_status: "pending",
      payment_status: "unpaid",
      fulfillment_status: "unfulfilled",
      currency: "INR",
      subtotal: subtotal,         // kept as-is (your existing behavior)
      discount_total: 0,
      tax_total: 0,
      shipping_total: 0,
      grand_total: subtotal,      // server should reprice; you can change later to price.grandTotal
    };
    const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return data.data.order_id;
  }

  async function handleCheckout() {
    const localOrderId = await createLocalOrderOnServer();

    const init = await createRzpOrder(token, localOrderId);

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
        const ver = await verifyPayment(token, {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        });
        if (ver?.status === "paid") {
          clearCart?.();
          nav(`/order/success/${localOrderId}`, { replace: true });
          return;
        } else {
          alert("Payment verification failed.");
        }
      },
      modal: { ondismiss: function () {} },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  if (loading) return <p>Loading...</p>;

  return (
    <section className="mx-auto max-w-6xl px-4 py-6">
      <div className="grid gap-6 md:grid-cols-12">
        {/* LEFT: address, items, saved */}
        <div className="md:col-span-7 lg:col-span-8 space-y-4">
         <AddressBanner address={address} onChange={() => setAddressOpen(true)} />

          {/* Active cart items */}
          {cartVisibleItems.length === 0 ? (
            <div className="rounded-xl border bg-white p-6 text-gray-600">No items yet.</div>
          ) : (
            <div className="space-y-3">
              {cartVisibleItems.map((it) => (
                <CartItemRow
                  key={it.id}
                  item={it}
                  onQtyChange={(q) => setQty(it.id, q)}
                  onRemove={() => remove(it.id)}
                  onSave={() => moveToSaved(it.id)}
                />
              ))}
            </div>
          )}

          {/* Saved for later */}
          {savedItems.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-semibold text-gray-600">SAVED FOR LATER</div>
              {savedItems.map((it) => (
                <SavedItemRow
                  key={`saved-${it.id}`}
                  item={it}
                  onMoveBack={() => moveBack(it.id)}
                  onRemoveSaved={() => removeFromSaved(it.id)}
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
                  setCoupon({ code, discount: 100, lines: [{ label: `Coupon (${code})`, amount: 100 }] });
                }}
                onRemove={() => setCoupon(null)}
              />

              <ShippingOptions
                pincode={address.pincode}
                value={shipping}
                onChange={setShipping}
              />

              <PriceDetailsCard price={price} coupon={coupon} format={format} />

              <button className="btn-primary w-full py-3 text-white" onClick={handleCheckout}>
                PLACE ORDER
              </button>

              {shipping?.eta && (
                <div className="pt-1 text-center text-xs text-gray-600">
                  Estimated delivery: <span className="font-medium">{shipping.eta}</span>
                </div>
              )}
            </div>
          </StickySummary>
        </div>
      </div>
       {/* Address Modal */}
      <AddressModal
        open={addressOpen}
        onClose={() => setAddressOpen(false)}
        initialAddress={address}
        savedAddresses={[address]} // placeholder list; wire real list later
        onSelect={(addr) => { setAddress(addr); setShipping(null); }}
      />
    </section>
  );
}
