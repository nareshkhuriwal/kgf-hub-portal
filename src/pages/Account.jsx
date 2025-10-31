// src/pages/Account.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "";

export default function Account() {
  const { user, logout, token } = useAuth();
  const nav = useNavigate();

  // Optional: load profile/me on mount (if you have GET /auth/me)
  const [me, setMe] = useState(user || null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let ignore = false;
    async function loadMe() {
      // If you have an /auth/me endpoint, uncomment this block.
      // Otherwise we just use the user from AuthContext.
      
      setLoading(true);
      setErr("");
      try {
        const res = await fetch(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        if (!ignore) setMe(data);
      } catch (e) {
        if (!ignore) setErr(e?.message || "Failed to load profile");
      } finally {
        if (!ignore) setLoading(false);
      }
      
    }
    loadMe();
    return () => { ignore = true; };
  }, [token]);

  function onLogout() {
    logout();
    nav("/", { replace: true });
  }

  const profile = me || user || {};

  return (
    <div className="container-outer py-8">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Account</h1>
          <p className="text-gray-600">
            Welcome{profile?.name ? `, ${profile.name}` : ""}! Manage your profile, orders, and settings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/logout" className="btn-outline">Logout</Link>
          <Link to="/orders" className="btn-primary">My Orders</Link>
        </div>
      </div>

      {err ? (
        <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Profile</h2>
          {loading ? (
            <p className="text-sm text-gray-500">Loading profile…</p>
          ) : (
            <div className="space-y-3 text-sm">
              <Field label="Name" value={profile?.name || "—"} />
              <Field label="Email" value={profile?.email || "—"} />
              <Field label="Phone" value={profile?.phone || "—"} />
              <Field label="Role" value={profile?.role || "customer"} />
              <Field label="Tenant" value={String(profile?.tenant_id ?? "—")} />
            </div>
          )}
          <div className="mt-5 flex gap-3">
            <Link to="/account/edit" className="btn-outline">Edit Profile</Link>
            <Link to="/addresses" className="btn-outline">Manage Addresses</Link>
          </div>
        </section>

        {/* Security Card */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Security</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span>Password</span>
              <Link to="/account/password" className="text-gray-800 underline">Change</Link>
            </li>
            <li className="flex items-center justify-between">
              <span>Two-factor authentication</span>
              <span className="inline-flex items-center gap-2">
                <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] uppercase tracking-wide">Off</span>
                <button className="btn-outline px-3 py-1 text-xs">Enable</button>
              </span>
            </li>
            <li className="flex items-center justify-between">
              <span>Active session</span>
              <button onClick={onLogout} className="btn-outline px-3 py-1 text-xs">Sign out</button>
            </li>
          </ul>
        </section>

        {/* Orders Snapshot */}
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Orders</h2>
          <div className="space-y-3 text-sm">
            <Row label="Recent">—</Row>
            <Row label="Open / Processing">—</Row>
            <Row label="Delivered">—</Row>
            <Row label="Returns">—</Row>
          </div>
          <div className="mt-5">
            <Link to="/orders" className="btn-outline">View all orders</Link>
          </div>
        </section>
      </div>

      {/* Payment & Addresses (placeholders for future) */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Saved Addresses</h2>
          <p className="text-sm text-gray-600">No addresses added yet.</p>
          <div className="mt-4">
            <Link to="/addresses/new" className="btn-outline">Add Address</Link>
          </div>
        </section>

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Payment Methods</h2>
          <p className="text-sm text-gray-600">No saved payment methods.</p>
          <div className="mt-4">
            <Link to="/payments/manage" className="btn-outline">Manage Payments</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{children}</span>
    </div>
  );
}
