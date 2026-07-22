import React, { useContext, useEffect, useState } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { cancelOrder, getOrders } from "../services/orderService"
import { api } from "../services/api"
import { toast } from "react-toastify"
import { Package, ArrowRight, X, ChevronRight } from "lucide-react"

function Order() {
  const { user, setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const [orders, setOrders] = useState([])
  const [loadingId, setLoadingId] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchOrders = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const data = await getOrders()
      const updatedOrders = data || []
      setOrders(updatedOrders)
      setUser(prev => ({ ...prev, order: updatedOrders }))
    } catch (err) {
      console.error(err)
      toast.error("Failed to load orders ❌")
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [user?.id])

  const handleCancelOrder = async (e, orderId) => {
    e.stopPropagation()
    if (!user?.id) { toast.error("User not found"); return }
    const confirm = window.confirm("Cancel this order?")
    if (!confirm) return
    try {
      setLoadingId(orderId)
      await cancelOrder(user.id, orderId)
      await fetchOrders()
      toast.success("Order cancelled successfully")
    } catch (err) {
      console.error(err)
      toast.error("Cancel failed ❌")
    } finally { setLoadingId(null) }
  }

  const goToProduct = (productId, status) => {
    if (status === "Cancelled") return
    navigate(`/products/${productId}`)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              <Package className="w-8 h-8 text-yellow-500" />
              My Orders
            </h1>
            {!loading && orders.length > 0 && (
              <p className="mt-1 text-gray-500">{orders.length} {orders.length === 1 ? "order" : "orders"} placed</p>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading your orders...</p>
            </div>
          )}

          {/* Empty */}
          {!loading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No orders yet</h2>
              <p className="text-gray-400 mb-8 text-center max-w-sm">You haven't placed any orders yet. Start shopping now!</p>
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all hover:shadow-lg hover:scale-105"
              >
                Shop Now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Orders List */}
          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">

                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order ID</p>
                      <p className="font-bold text-gray-900 text-sm">{order.id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{order.date || "Recent Order"}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase
                        ${order.status === "Cancelled"
                          ? "bg-rose-100 text-rose-600"
                          : "bg-emerald-100 text-emerald-700"
                        }`}>
                        {order.status}
                      </span>
                      {order.status !== "Cancelled" && (
                        <button
                          onClick={(e) => handleCancelOrder(e, order.id)}
                          disabled={loadingId === order.id}
                          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200
                            ${loadingId === order.id
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100"
                            }`}
                        >
                          {loadingId === order.id ? (
                            <><div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Cancelling...</>
                          ) : (
                            <><X className="w-3 h-3" /> Cancel</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="divide-y divide-gray-50">
                    {order.items?.map(item => (
                      <div
                        key={item.productId}
                        onClick={() => goToProduct(item.productId, order.status)}
                        className={`flex gap-4 items-center px-6 py-4 transition-all duration-200
                          ${order.status === "Cancelled"
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer hover:bg-gray-50/80 group"
                          }`}
                      >
                        {/* Item Image */}
                        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center overflow-hidden">
                          <img src={item.img} alt={item.name} className="w-full h-full object-contain p-2" />
                        </div>

                        {/* Item Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">Size: {item.size}</span>
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md font-medium">Qty: {item.quantity}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="font-extrabold text-gray-900">₹ {item.price}</p>
                          {order.status !== "Cancelled" && (
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-4 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-sm text-gray-500 font-medium">{order.items?.length} {order.items?.length === 1 ? "item" : "items"}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Order Total:</span>
                      <span className="text-xl font-extrabold text-gray-900">₹ {order.total?.toLocaleString()}</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </Layout>
  )
}

export default Order