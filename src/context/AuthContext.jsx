import { createContext, useContext, useEffect, useMemo, useState } from "react";

const TOKEN_KEY = "kgf_token";
const USER_KEY = "kgf_user";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
  });
  const isAuthenticated = !!token;

  // helpers
  function saveSession({ token, user }, remember = true) {
    if (!token) return;
    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user || null));
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(USER_KEY, JSON.stringify(user || null));
    }
    setToken(token);
    setUser(user || null);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken("");
    setUser(null);
  }

  function getAuthHeader() {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // restore from sessionStorage if localStorage empty
  useEffect(() => {
    if (!token) {
      const st = sessionStorage.getItem(TOKEN_KEY);
      if (st) setToken(st);
      const su = sessionStorage.getItem(USER_KEY);
      if (su) try { setUser(JSON.parse(su)); } catch {}
    }
  }, []); // eslint-disable-line

  const value = useMemo(() => ({
    token, user, isAuthenticated, saveSession, logout, getAuthHeader
  }), [token, user, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
