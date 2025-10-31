// src/pages/OrderSuccess.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "";

export default function OrderSuccess() {
  const { orderId: paramId } = useParams();
  const [sp] = useSearchParams();
  const { token } = useAuth();

  // Support both /order/success/:orderId and /order/success?oid=123
  const orderId = useMemo(() => paramId || sp.get("oid") || "", [paramId, sp]);

  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(!!orderId);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!orderId) return;
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/orders/${orderId}`, {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json(); // { success, data: {...} }
        if (!ignore) setDetails(data?.data || null);
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load order details");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [orderId, token]);

  const amount = details?.grand_total ?? null;
  const currency = details?.currency ?? "INR";
  const format = (n) =>
    typeof n === "number" ? `₹${n.toLocaleString("en-IN")}` : "—";

  return (
    <div className="container-outer max-w-3xl">
      <div className="rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          {/* check icon */}
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h1 className="text-center text-2xl font-semibold">Payment Successful</h1>
        <p className="mt-2 text-center text-gray-600">
          Thank you! Your order has been placed successfully.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <InfoRow label="Order ID" value={orderId || "—"} />
          <InfoRow label="Status" value={details?.payment_status ? details.payment_status.toUpperCase() : "PAID"} />
          <InfoRow label="Amount" value={amount != null ? format(Number(amount)) : "—"} />
          <InfoRow label="Currency" value={currency} />
        </div>

        {loading && (
          <p className="mt-4 text-center text-sm text-gray-500">Loading order details…</p>
        )}
        {err && (
          <p className="mt-4 rounded-md bg-yellow-50 px-3 py-2 text-center text-sm text-yellow-800">
            {err}
          </p>
        )}

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/account" className="btn-primary w-full sm:w-auto">View in My Account</Link>
          <Link to="/products" className="btn-outline w-full sm:w-auto">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-xl border px-4 py-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{String(value)}</span>
    </div>
  );
}
