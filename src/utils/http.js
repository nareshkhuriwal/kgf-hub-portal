import { useAuth } from "../context/AuthContext";

// Hook that returns a fetch wrapper bound to current token
export function useHttp() {
  const { getAuthHeader, logout } = useAuth();

  async function fetchJson(url, { auth = false, ...options } = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(auth ? getAuthHeader() : {}),
    };
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      // token invalid/expired
      logout();
      throw new Error("Unauthorized");
    }
    const text = await res.text();
    try { return text ? JSON.parse(text) : {}; } catch { return text; }
  }

  return { fetchJson };
}

// Non-hook variant for places outside React tree (optional)
export async function fetchJsonRaw(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return text ? JSON.parse(text) : {}; } catch { return text; }
}
