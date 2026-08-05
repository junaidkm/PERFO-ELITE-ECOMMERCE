import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react"
import { AuthContext } from "./AuthContext"
import { getCart, updateCart, clearUserCart, addItemToCart, removeItemFromCart } from "../services/cartService"
import { toast } from "react-toastify"

const mapCartItems = (itemsList) => {
  if (!Array.isArray(itemsList)) return []
  return itemsList
    .map((item) => {
      const product = item.productId
      if (!product || typeof product !== "object") return null

      const sizeInfo = product.sizes?.find((s) => s.size === item.size)
      return {
        id: item._id || item.id,
        productId: product._id || product.id,
        name: product.name,
        img: product.img,
        price: sizeInfo ? sizeInfo.price : 0,
        size: item.size,
        quantity: item.quantity,
      }
    })
    .filter(Boolean)
}

export const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const { userId } = useContext(AuthContext)

  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCart = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data } = await getCart(userId)
      const itemsList = Array.isArray(data)
        ? data
        : data?.items || data?.cart || []

      setCart(mapCartItems(itemsList))
    } catch (err) {
      console.error("Failed to load cart:", err)
      toast.error("Failed to load cart")
    } finally {
      setLoading(false)
    }
  }, [userId])

  const addToCart = useCallback(async ({ product, selectedSize }) => {
    if (!userId) return toast.warning("Login first ⚠️")
    if (!selectedSize) return toast.warning("Select size")
    if (selectedSize.stock !== "In Stock") return toast.error("Out of stock")

    try {
      setLoading(true)
      const targetProductId = product.id || product._id || product.productId

      const { data } = await addItemToCart({
        productId: targetProductId,
        size: selectedSize.size,
        quantity: 1
      })

      const itemsList = Array.isArray(data)
        ? data
        : data?.items || data?.cart || []

      setCart(mapCartItems(itemsList))
      toast.success("Added to cart 🛒")
    } catch (err) {
      console.error("Error adding to cart:", err)
      toast.error("Error adding to cart ❌")
    } finally {
      setLoading(false)
    }
  }, [userId])

  const removeFromCart = useCallback(async (id) => {
    if (!userId) return
    try {
      setLoading(true)
      const { data } = await removeItemFromCart(id)

      const itemsList = Array.isArray(data)
        ? data
        : data?.items || data?.cart || []

      setCart(mapCartItems(itemsList))
      toast.info("Item removed 🗑️")
    } catch (err) {
      console.error("Error removing item:", err)
      toast.error("Error removing item")
    } finally {
      setLoading(false)
    }
  }, [userId])

  const updateQuantity = useCallback(async (id, type) => {
    if (!userId) return

    try {
      const updatedCart = cart.map(item => {
        const matches = String(item.id) === String(id) || String(item._id) === String(id) || String(item.productId) === String(id)
        if (!matches) return item

        if (type === "inc") {
          return { ...item, quantity: item.quantity + 1 }
        }

        if (type === "dec") {
          return { ...item, quantity: Math.max(1, item.quantity - 1) }
        }

        return item
      })

      setCart(updatedCart)
      
      const { data } = await updateCart(userId, updatedCart)
      
      const itemsList = Array.isArray(data)
        ? data
        : data?.items || data?.cart || []

      setCart(mapCartItems(itemsList))
    } catch (err) {
      console.error("Failed to update quantity:", err)
      toast.error("Failed to update quantity")
    }
  }, [userId, cart])

  const clearCart = useCallback(async () => {
    if (!userId) return
    try {
      setLoading(true)
      setCart([])
      await clearUserCart()
      toast.info("Cart cleared")
    } catch (err) {
      console.error("Failed to clear cart:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (!userId) {
      setCart([])
    } else {
      fetchCart()
    }
  }, [userId, fetchCart])

  const value = useMemo(
    () => ({
      cart,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      fetchCart
    }),
    [cart, loading, addToCart, removeFromCart, updateQuantity, clearCart, fetchCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}