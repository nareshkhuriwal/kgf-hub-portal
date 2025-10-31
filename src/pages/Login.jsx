import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "";

export default function Login() {
  const { saveSession } = useAuth();
  const nav = useNavigate();
  const { search } = useLocation();
  const next = new URLSearchParams(search).get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!email || !password) {
      setErr("Please enter email and password.");
      return;
    }
    setLoading(true);
    try {
      // Adjust endpoint/payload if your API differs
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || "Login failed");
      }
      const data = await res.json();
      console.log("Login response data:", data);
      // Expected: { access_token, token_type, user }
      if (!data?.token) throw new Error("No access token returned");
      saveSession({ token: data.token, user: data.user }, remember);
      console.log("Saved session for user:", data.user);
      nav(next, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-center text-2xl font-semibold">Sign in to KGF Hub</h1>

        {err ? <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p> : null}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-gray-900/10"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value.trim())}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="w-full rounded-lg border px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-gray-900/10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>
            <Link to="/forgot" className="text-sm text-gray-700 hover:underline">Forgot password?</Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account? <Link to="/register" className="text-gray-800 underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
