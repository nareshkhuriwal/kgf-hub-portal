// src/api/payments.js
export async function createRzpOrder(token, orderId) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ order_id: orderId })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function verifyPayment(token, body) {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
