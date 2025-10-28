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
    const data = await getCart();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  // Add to cart; if exists, qty++
  const add = async ({ productId, name, price, qty = 1 }) => {
    const existing = await findCartItemByProduct(productId);
    if (existing) {
      const updated = await patchCartItem(existing.id, { qty: (existing.qty ?? 1) + qty });
      setItems((prev) => prev.map((it) => (it.id === existing.id ? updated : it)));
      openCart(); // open drawer when adding
      return;
    }
    const created = await addCartItem({ productId, name, price, qty });
    setItems((prev) => [...prev, created]);
    openCart(); // open drawer when adding
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

  const count = useMemo(() => items.reduce((s, it) => s + (it.qty ?? 1), 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, it) => s + it.price * (it.qty ?? 1), 0), [items]);

  const value = {
    items,
    loading,
    count,
    subtotal,
    refresh,
    add,
    remove,
    setQty,
    // drawer controls
    isOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
