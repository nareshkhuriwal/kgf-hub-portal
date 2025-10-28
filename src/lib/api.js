const API = "http://localhost:4000";

// small fetch wrapper
async function j(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} failed`);
  return res.json();
}

export const getProducts = () => j("GET", "/products");
export const getCart     = () => j("GET", "/cart");

// find cart item by productId (json-server filtering)
export const findCartItemByProduct = async (productId) => {
  const res = await fetch(`${API}/cart?productId=${encodeURIComponent(productId)}`);
  if (!res.ok) throw new Error("GET /cart?productId failed");
  const arr = await res.json();
  return arr[0] || null;
};

export const addCartItem    = (item)           => j("POST", "/cart", item);              // {productId,name,price,qty}
export const patchCartItem  = (id, payload)    => j("PATCH", `/cart/${id}`, payload);    // e.g. {qty: 2}
export const deleteCartItem = (id)             => j("DELETE", `/cart/${id}`);
