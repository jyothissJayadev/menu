// webMenu/src/api.js
const API_BASE_URL = "http://localhost:4000/api";

export async function fetchCompany() {
  try {
    const res = await fetch(`${API_BASE_URL}/companies`);
    if (!res.ok) throw new Error("Failed to fetch companies");
    const companies = await res.json();
    return companies[0] || null;
  } catch (err) {
    console.error("fetchCompany error:", err);
    return null;
  }
}

export async function fetchMenu(companyId) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/menu`);
    if (!res.ok) throw new Error("Failed to fetch menu");
    return await res.json();
  } catch (err) {
    console.error("fetchMenu error:", err);
    return { categories: [], allItems: [] };
  }
}

export async function createOrder(companyId, orderData) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to place order");
    }
    return await res.json();
  } catch (err) {
    console.error("createOrder error:", err);
    throw err;
  }
}

export async function fetchOrderStatus(companyId, orderId) {
  try {
    const res = await fetch(`${API_BASE_URL}/companies/${companyId}/orders/${orderId}`);
    if (!res.ok) throw new Error("Failed to fetch order status");
    return await res.json();
  } catch (err) {
    console.error("fetchOrderStatus error:", err);
    return null;
  }
}
