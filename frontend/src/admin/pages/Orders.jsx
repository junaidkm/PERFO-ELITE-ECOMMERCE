import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { Package, Trash2, Clock, MapPin, Phone, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react"

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTick(p => p + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: allOrders } = await api.get("/orders")

        // Sort by newest first
        setOrders(allOrders.sort((a, b) => new Date(b.date) - new Date(a.date)))
      } catch (err) {
        console.error("Fetch orders error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [tick])

  const handleDelete = async (orderId, userId) => {
    if (!window.confirm("Delete this order?")) return
    try {
      await api.delete(`/orders/${orderId}`)
      setOrders(prev => prev.filter(o => o.id !== orderId))
    } catch (err) {
      console.error("Delete error:", err)
      alert("Delete failed")
    }
  }

  const handleStatusChange = async (orderId, userId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
      )
    } catch (err) {
      console.error("Status change error:", err)
      alert("Failed to update status")
    }
  }

  const getDeliveryInfo = (order) => {
    const base = new Date(order.placedTime || order.date)
    const eta = new Date(base.getTime() + 3 * 86400000)
    const now = new Date()
    const diff = eta - now

    if (order.status === "Delivered") return { text: "Delivered", icon: CheckCircle, color: "text-emerald-400", etaDate: eta }
    if (order.status === "Cancelled") return { text: "Cancelled", icon: XCircle, color: "text-rose-400", etaDate: null }
    if (diff <= 0) return { text: "Delayed", icon: AlertCircle, color: "text-yellow-400", etaDate: eta }

    const sec = Math.floor(diff / 1000)
    const days = Math.floor(sec / 86400)
    const hours = Math.floor((sec % 86400) / 3600)
    const minutes = Math.floor((sec % 3600) / 60)
    const seconds = sec % 60

    return {
      text: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      icon: Clock,
      color: "text-blue-400",
      etaDate: eta
    }
  }

  const statusStyle = {
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Placed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <Package className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Order Management</h2>
          <p className="text-gray-400 text-sm mt-1 font-medium">{orders.length} total orders across all users</p>
        </div>
      </div>

      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
            <Package className="w-16 h-16 text-gray-600 mb-4" />
            <p className="text-lg font-bold text-white mb-1">No orders found</p>
            <p className="text-sm text-gray-400 font-medium">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          orders.map(order => {
            const info = getDeliveryInfo(order)
            const InfoIcon = info.icon

            return (
              <div
                key={order.id}
                className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{order.userName}</h3>
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-md">
                        #{order.id.toString().slice(-6)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {order.placedTime ? new Date(order.placedTime).toLocaleString() : order.date}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusStyle[order.status]}`}>
                      {order.status}
                    </span>
                    <p className="text-xl font-black text-white">
                      ₹{order.total.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ETA Banner */}
                <div className="bg-white/5 border border-white/5 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl bg-white/5 ${info.color}`}>
                      <InfoIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${info.color}`}>ETA: {info.text}</p>
                      {info.etaDate && order.status !== "Cancelled" && order.status !== "Delivered" && (
                        <p className="text-xs text-gray-400 font-medium mt-0.5">Target: {info.etaDate.toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:border-l sm:border-white/10 sm:pl-6">
                    <div className="flex items-center gap-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, order.userId, e.target.value)}
                        className="bg-gray-900 border border-white/10 text-white text-sm font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-yellow-400 cursor-pointer"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      
                      <button
                        onClick={() => handleDelete(order.id, order.userId)}
                        className="p-2 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</h4>
                    <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                      {order.items.map(item => (
                        <div key={item.productId} className="flex gap-4 items-center bg-white/5 rounded-2xl p-3 border border-white/5">
                          <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <img src={item.img} className="max-w-full max-h-full object-contain p-2" alt={item.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{item.name}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">
                              {item.size} · ₹{item.price} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-black text-white">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Details</h4>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3">
                      <div className="flex gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-white">{order.address.name}</p>
                          <p className="text-sm text-gray-400 mt-1 leading-relaxed">
                            {order.address.addressLine}<br />
                            {order.address.city}, {order.address.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <p className="text-sm font-medium text-gray-300">{order.address.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default Orders