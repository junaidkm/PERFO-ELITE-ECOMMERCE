import React, { useContext, useEffect, useMemo } from "react"
import { CartContext } from "../context/CartContext"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight, Package, Sparkles } from "lucide-react"

function CartPage() {
  const { cart, loading, removeFromCart, updateQuantity, clearCart } = useContext(CartContext)
  const { userId } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    if (!userId) navigate("/login")
  }, [userId])

  const { subtotal, delivery, total } = useMemo(() => {
    const sub = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0)
    const del = sub > 5000 || sub === 0 ? 0 : 199
    return { subtotal: sub, delivery: del, total: sub + del }
  }, [cart])

  const totalItemsCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
  }, [cart])

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-amber-500" />
                Your Cart
              </h1>
              {!loading && cart.length > 0 && (
                <p className="mt-1 text-gray-500">
                  {totalItemsCount} {totalItemsCount === 1 ? "item" : "items"} in your cart
                </p>
              )}
            </div>

            {!loading && cart.length > 0 && (
              <button
                onClick={clearCart}
                className="self-start sm:self-auto text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading your cart...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && cart.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <ShoppingBag className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h2>
              <p className="text-gray-400 mb-8 text-center max-w-sm">
                Looks like you haven't added anything yet. Start exploring our luxury perfume collection!
              </p>
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all hover:shadow-lg hover:scale-105"
              >
                Start Shopping
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Cart Items + Summary */}
          {!loading && cart.length > 0 && (
            <div className="flex flex-col lg:flex-row gap-8">

              {/* Cart Items */}
              <div className="flex-1 space-y-4">
                {cart.map((item) => {
                  const itemKey = item.id || item._id || item.productId
                  const productPageId = item.productId || item.id || item._id
                  const itemTotal = Number(item.price || 0) * Number(item.quantity || 1)

                  return (
                    <div
                      key={itemKey}
                      className="group bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 flex items-center gap-4 sm:gap-6 hover:shadow-md transition-all duration-300"
                    >
                      {/* Image */}
                      <div
                        onClick={() => navigate(`/products/${productPageId}`)}
                        className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer"
                      >
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h2
                          onClick={() => navigate(`/products/${productPageId}`)}
                          className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 leading-tight cursor-pointer hover:text-amber-600 transition-colors"
                        >
                          {item.name}
                        </h2>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="inline-block px-2.5 py-0.5 text-[11px] font-bold text-amber-800 bg-amber-50 rounded-md uppercase tracking-wider">
                            Size: {item.size}
                          </span>
                        </div>
                        <p className="font-black text-gray-900 text-lg mt-2">
                          ₹ {itemTotal.toLocaleString()}
                          {item.quantity > 1 && (
                            <span className="text-xs text-gray-400 font-normal ml-2">
                              (₹ {Number(item.price).toLocaleString()} each)
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-1 border border-gray-100">
                        <button
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(itemKey, "dec")}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className="w-8 text-center font-bold text-gray-900 text-sm">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => updateQuantity(itemKey, "inc")}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-200"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(itemKey)}
                        className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 transition-all duration-200"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )
                })}
              </div>

              {/* Order Summary */}
              <div className="w-full lg:w-[360px] flex-shrink-0">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 sticky top-24">
                  <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-gray-400" />
                    Order Summary
                  </h2>

                  <div className="space-y-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItemsCount} items)</span>
                      <span className="font-semibold text-gray-900">₹ {subtotal.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Delivery</span>
                      {delivery === 0 ? (
                        <span className="font-semibold text-emerald-600">FREE</span>
                      ) : (
                        <span className="font-semibold text-gray-900">₹ {delivery}</span>
                      )}
                    </div>

                    {delivery === 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                        You've unlocked free delivery!
                      </div>
                    )}
                    {delivery !== 0 && (
                      <p className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                        Add ₹{(5000 - subtotal).toLocaleString()} more for free delivery
                      </p>
                    )}
                  </div>

                  <div className="h-px bg-gray-100 my-6"></div>

                  <div className="flex justify-between text-lg font-black text-gray-900 mb-6">
                    <span>Total</span>
                    <span>₹ {total.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={() => navigate("/payment")}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-95"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  <p className="text-center text-xs text-gray-400 mt-4">
                    Fast & Secure Checkout
                  </p>
                </div>
              </div>

            </div>
          )}

        </div>
      </Layout>
    </div>
  )
}

export default CartPage