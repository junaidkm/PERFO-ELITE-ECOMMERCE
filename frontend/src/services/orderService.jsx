import { api } from "./api"

export const getOrders = async () => {
  const res = await api.get("/orders")
  return res.data
}

export const createOrder = async (orderData) => {
  const res = await api.post("/orders", orderData)
  return res.data
}

export const cancelOrder = async (userId, orderId) => {
  try {
    const res = await api.put(`/orders/${orderId}/cancel`)
    return res.data
  } catch (err) {
    console.error("Cancel API error:", err)
    throw err;
  }
}