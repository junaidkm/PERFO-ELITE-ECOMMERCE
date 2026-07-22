import { api } from "./api"

export const getCart = (userId) =>
  api.get(`/cart/${userId}`)

export const updateCart = (userId, cart) =>
  api.put(`/cart/${userId}`, { cart })

export const addItemToCart = (itemData) =>
  api.post("/cart", itemData)

export const removeItemFromCart = (itemId) =>
  api.delete(`/cart/${itemId}`)

export const clearUserCart = () =>
  api.delete("/cart/clear")

export const saveOrder = async (userId, orderData) => {
  return await api.patch(`/users/${userId}`, {
    order: orderData
  })
}

export const getOrders = async (userId) => {
  return await api.get(`/users/${userId}`)
}