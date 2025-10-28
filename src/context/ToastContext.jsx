import { createContext, useContext, useCallback, useState, useEffect } from "react";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // {id, message}

  const show = useCallback((message, ms = 2200) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message }]);
    // auto-remove
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, ms);
  }, []);

  // Escape to clear (handy during dev)
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setToasts([]);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      {/* Toasts UI (top-right) */}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] space-y-2">
        {toasts.map(({ id, message }) => (
          <div
            key={id}
            className="pointer-events-auto animate-[toast_.25s_ease-out] rounded-xl border bg-white/95 px-3 py-2 text-sm shadow-card"
            style={{ backdropFilter: "blur(6px)" }}
          >
            {message}
          </div>
        ))}
      </div>
      {/* simple keyframes */}
      <style>
        {`@keyframes toast{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}
      </style>
    </ToastCtx.Provider>
  );
}
