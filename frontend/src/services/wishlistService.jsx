import { api } from "./api"

export const getWishlist = (userId) => {
  return api.get(`/wishlist/${userId}`)
}

export const updateWishlist = (userId, wishlist) => {
  return api.put(`/wishlist/${userId}`, { wishlist })
}

export const toggleWishlistItem = (productData) => {
  return api.post("/wishlist/toggle", productData)
}

export const removeWishlistItem = (productId) => {
  return api.delete(`/wishlist/${productId}`)
}

export const clearUserWishlist = () => {
  return api.delete("/wishlist/clear")
}