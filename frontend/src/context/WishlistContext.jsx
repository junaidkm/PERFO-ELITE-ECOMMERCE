import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from "react"
import { AuthContext } from "./AuthContext"
import { CartContext } from "./CartContext"
import { getWishlist, updateWishlist, removeWishlistItem, clearUserWishlist } from "../services/wishlistService"
import { toast } from "react-toastify"

export const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { userId } = useContext(AuthContext)
  const { addToCart } = useContext(CartContext)

  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchWishlist = useCallback(async () => {
    if (!userId) {
      setWishlist([])
      return
    }

    try {
      setLoading(true)
      const { data } = await getWishlist(userId)
      const items = Array.isArray(data) ? data : data?.items || data?.wishlist || []
      setWishlist(items)
    } catch (err) {
      console.error("Failed to fetch wishlist:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const toggleWishlist = useCallback(async (product) => {
    if (!userId) {
      toast.warning("Please login first ⚠️")
      return
    }

    const targetId = product.id || product._id || product.productId
    const exists = wishlist.some(
      (item) => String(item.productId || item.id || item._id) === String(targetId)
    )

    let updatedWishlist

    if (exists) {
      updatedWishlist = wishlist.filter(
        (item) => String(item.productId || item.id || item._id) !== String(targetId)
      )
      toast.info("Removed from wishlist 💔")
    } else {
      updatedWishlist = [
        ...wishlist,
        {
          id: Date.now().toString(36) + Math.random().toString(36).substring(2, 9),
          productId: targetId,
          name: product.name,
          img: product.img,
          price: product.sizes?.[0]?.price ?? product.price ?? null
        }
      ]
      toast.success("Added to wishlist ❤️")
    }

    setWishlist(updatedWishlist)

    try {
      await updateWishlist(userId, updatedWishlist)
    } catch (err) {
      console.error("Error updating wishlist:", err)
      toast.error("Error updating wishlist ❌")
    }
  }, [userId, wishlist])

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      const updatedWishlist = wishlist.filter(
        (item) => String(item.productId || item.id || item._id) !== String(productId)
      )

      setWishlist(updatedWishlist)
      await removeWishlistItem(productId)
      toast.info("Removed from wishlist")
    } catch (err) {
      console.error("Error removing item:", err)
      toast.error("Error removing item")
    }
  }, [wishlist])

  const moveToCart = useCallback(async (item) => {
    try {
      await addToCart({
        product: { id: item.productId || item.id, name: item.name, img: item.img },
        selectedSize: { size: "Default", price: item.price, stock: "In Stock" }
      })

      const targetId = item.productId || item.id || item._id
      const updatedWishlist = wishlist.filter(
        (w) => String(w.productId || w.id || w._id) !== String(targetId)
      )

      setWishlist(updatedWishlist)
      await updateWishlist(userId, updatedWishlist)
    } catch (err) {
      console.error("Error moving item to cart:", err)
      toast.error("Error moving item to cart ❌")
    }
  }, [userId, wishlist, addToCart])

  const clearWishlist = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      setWishlist([])
      await clearUserWishlist()
      toast.info("Wishlist cleared")
    } catch (err) {
      console.error("Error clearing wishlist:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchWishlist()
  }, [userId, fetchWishlist])

  const value = useMemo(
    () => ({
      wishlist,
      loading,
      setWishlist,
      toggleWishlist,
      removeFromWishlist,
      moveToCart,
      clearWishlist,
      fetchWishlist
    }),
    [wishlist, loading, toggleWishlist, removeFromWishlist, moveToCart, clearWishlist, fetchWishlist]
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}