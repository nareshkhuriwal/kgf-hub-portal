// src/lib/api.js
const API = import.meta.env.VITE_API_BASE || "http://localhost:4000";

async function j(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed`);
  return res.json();
}

/* ===== CLOTHING PRODUCTS ===== */
export const getClothingProducts = () => j("GET", "/clothingProducts");
export const getClothingProduct  = (id) => j("GET", `/clothingProducts/${id}`);

// TEMP alias so any legacy imports keep working
export const getProducts = getClothingProducts;

export async function searchClothingProducts(q) {
  const all = await getClothingProducts();
  const term = q.trim().toLowerCase();
  if (!term) return [];
  return all.filter(p =>
    p.name.toLowerCase().includes(term) ||
    (p.brand||"").toLowerCase().includes(term) ||
    (p.category||"").toLowerCase().includes(term)
  ).slice(0, 12);
}

/* ===== CART ===== */
export const getCart        = () => j("GET", "/cart");
export const addCartItem    = (item) => j("POST", "/cart", item);
export const patchCartItem  = (id, payload) => j("PATCH", `/cart/${id}`, payload);
export const deleteCartItem = (id) => j("DELETE", `/cart/${id}`);

export async function findCartItemByProduct(productId, size, color) {
  const list = await getCart();
  return (
    list.find(
      (x) =>
        x.productId === productId &&
        (size ? x.size === size : true) &&
        (color ? x.color === color : true)
    ) || null
  );
}

