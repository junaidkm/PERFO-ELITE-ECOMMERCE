import React, { createContext, useState, useContext, useEffect } from "react"
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

  const fetchWishlist = async () => {
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
      console.log("Failed to fetch wishlist:", err)
    } finally {
      setLoading(false)
    }
  }

  const toggleWishlist = async (product) => {
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
          id: crypto.randomUUID?.() || Date.now(),
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
      console.log(err)
      toast.error("Error updating wishlist ❌")
    }
  }

  const removeFromWishlist = async (productId) => {
    try {
      const updatedWishlist = wishlist.filter(
        (item) => String(item.productId || item.id || item._id) !== String(productId)
      )

      setWishlist(updatedWishlist)
      await removeWishlistItem(productId)
      toast.info("Removed from wishlist")
    } catch (err) {
      console.log(err)
      toast.error("Error removing item")
    }
  }

  const moveToCart = async (item) => {
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
      console.log(err)
      toast.error("Error moving item to cart ❌")
    }
  }

  const clearWishlist = async () => {
    if (!userId) return
    try {
      setLoading(true)
      setWishlist([])
      await clearUserWishlist()
      toast.info("Wishlist cleared")
    } catch (err) {
      console.log("Error clearing wishlist:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWishlist()
  }, [userId])

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        loading,
        setWishlist,
        toggleWishlist,
        removeFromWishlist,
        moveToCart,
        clearWishlist,
        fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}