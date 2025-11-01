// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCart,
  findCartItemByProduct,
  addCartItem,
  patchCartItem,
  deleteCartItem,
} from "../lib/api";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state for mini-cart drawer
  const [isOpen, setOpen] = useState(false);
  const openCart = () => setOpen(true);
  const closeCart = () => setOpen(false);
  const toggleCart = () => setOpen((v) => !v);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setItems(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Add to cart; if exists, qty++
  const add = async ({ productId, name, price, qty = 1, size, color }) => {
    const existing = await findCartItemByProduct(productId, size, color);
    if (existing) {
      const updated = await patchCartItem(existing.id, { qty: (existing.qty ?? 1) + qty });
      setItems((prev) => prev.map((it) => (it.id === existing.id ? updated : it)));
      openCart();
      return;
    }
    const created = await addCartItem({ productId, name, price, qty, size, color });
    setItems((prev) => [...prev, created]);
    openCart();
  };

  const remove = async (id) => {
    await deleteCartItem(id);
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const setQty = async (id, qty) => {
    if (qty <= 0) {
      await deleteCartItem(id);
      setItems((prev) => prev.filter((it) => it.id !== id));
      return;
    }
    const updated = await patchCartItem(id, { qty });
    setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
  };

  // NEW: clear all items in cart (used after successful checkout)
  const clearCart = async () => {
    setLoading(true);
    try {
      const ids = items.map((it) => it.id);
      // Fire deletes in parallel; ignore individual failures so UX isn't blocked
      await Promise.allSettled(ids.map((id) => deleteCartItem(id)));
      setItems([]);
      closeCart(); // optional: hide mini-cart after clearing
    } finally {
      setLoading(false);
    }
  };

  const count = useMemo(() => items.reduce((s, it) => s + (it.qty ?? 1), 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + (it.price * (it.qty ?? 1)), 0), [items]);

  const value = {
    items,
    loading,
    count,
    subtotal,
    refresh,
    add,
    remove,
    setQty,
    clearCart,     // ← exposed here
    // drawer controls
    isOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
