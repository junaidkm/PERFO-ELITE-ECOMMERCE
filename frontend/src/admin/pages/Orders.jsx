import React, { useEffect, useState, useMemo } from "react"
import { api } from "../../services/api"
import { Package, Trash2, Clock, MapPin, Phone, CheckCircle, XCircle, AlertCircle, RefreshCw, Search, ShieldCheck, Tag } from "lucide-react"
import { toast } from "react-toastify"

function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [search, setSearch] = useState("")

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let allOrders = []
      try {
        const { data } = await api.get("/orders/admin/all")
        allOrders = Array.isArray(data) ? data : data?.orders || []
      } catch (e) {
        const { data } = await api.get("/orders")
        allOrders = Array.isArray(data) ? data : data?.orders || []
      }

      setOrders(allOrders)
    } catch (err) {
      console.error("Fetch orders error:", err)
      toast.error("Failed to load admin orders ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleDelete = async (orderId) => {
    if (!orderId) return
    if (!window.confirm("Are you sure you want to delete this order?")) return

    try {
      await api.delete(`/orders/${orderId}`)
      toast.success("Order deleted successfully 🗑️")
      setOrders((prev) => prev.filter((o) => (o.id || o._id) !== orderId))
    } catch (err) {
      console.error("Delete order error:", err)
      toast.error("Failed to delete order ❌")
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    if (!orderId || !newStatus) return

    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus })
      toast.success(`Order status updated to '${newStatus}' ✨`)
      setOrders((prev) =>
        prev.map((o) => ((o.id || o._id) === orderId ? { ...o, status: newStatus } : o))
      )
    } catch (err) {
      console.error("Status update error:", err)
      toast.error("Failed to update status ❌")
    }
  }

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const orderId = String(o.id || o._id || "").toLowerCase()
      const customerName = String(o.userId?.name || o.address?.name || "").toLowerCase()
      const matchesSearch =
        !search || orderId.includes(search.toLowerCase()) || customerName.includes(search.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === "all") return true
      return (o.status || "Placed").toLowerCase() === statusFilter.toLowerCase()
    })
  }, [orders, statusFilter, search])

  const statusStyle = {
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Processing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Placed: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Package className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Order Management</h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">{orders.length} total customer orders</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchOrders}
            className="p-2.5 bg-white/5 border border-white/10 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all"
            title="Refresh Orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              placeholder="Search by Order ID or customer..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      {!loading && orders.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {["all", "Placed", "Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? "bg-amber-400 text-gray-950 border-amber-400 shadow-md shadow-amber-400/20"
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              {st === "all" ? "All Orders" : st}
            </button>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-white/5 rounded-3xl" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && orders.length === 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center">
          <Package className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-lg font-bold text-white mb-1">No orders found</p>
          <p className="text-sm text-gray-400 font-medium">When customers place orders, they will appear here.</p>
        </div>
      )}

      {/* No Filter Results */}
      {!loading && orders.length > 0 && filteredOrders.length === 0 && (
        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-12 text-center">
          <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-lg font-bold text-white">No matching orders found</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Try adjusting your status filter or search query.</p>
          <button
            onClick={() => {
              setStatusFilter("all")
              setSearch("")
            }}
            className="text-xs font-bold text-amber-400 underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-6">
          {filteredOrders.map((order) => {
            const orderId = order.id || order._id
            const customerName = order.userId?.name || order.address?.name || "Customer"
            const customerEmail = order.userId?.email || ""

            return (
              <div
                key={orderId}
                className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors space-y-6"
              >
                {/* Top Row: Customer & Status */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-white">{customerName}</h3>
                      {customerEmail && (
                        <span className="text-xs font-medium text-gray-400">({customerEmail})</span>
                      )}
                      <span className="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md">
                        #{String(orderId).slice(-8)}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {order.date || (order.createdAt ? new Date(order.createdAt).toLocaleString() : "Recent")}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <span className={`px-3.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase border ${statusStyle[order.status] || statusStyle.Placed}`}>
                      {order.status || "Placed"}
                    </span>
                    <p className="text-2xl font-black text-white">
                      ₹{Number(order.total || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Status Selector & Controls */}
                <div className="bg-gray-950 border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Update Order Status:</span>
                    <select
                      value={order.status || "Placed"}
                      onChange={(e) => handleStatusChange(orderId, e.target.value)}
                      className="bg-gray-900 border border-white/10 text-white text-xs font-bold rounded-xl px-3.5 py-2 focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="Placed">Placed</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDelete(orderId)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-500/10 text-rose-400 font-bold text-xs rounded-xl hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" /> Delete Order
                    </button>
                  </div>
                </div>

                {/* Order Items & Shipping Grid */}
                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  {/* Items */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-amber-400" /> Order Items ({order.items?.length || 0})
                    </h4>
                    <div className="max-h-[220px] overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                      {order.items?.map((item, idx) => (
                        <div key={item.productId || idx} className="flex gap-4 items-center bg-white/5 rounded-2xl p-3 border border-white/5">
                          <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center flex-shrink-0 p-1">
                            <img src={item.img} className="max-w-full max-h-full object-contain" alt={item.name} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{item.name}</p>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                              Size: <span className="text-amber-300">{item.size}</span> · Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="text-xs font-black text-white">
                            ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" /> Shipping & Payment
                    </h4>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 space-y-3 text-xs">
                      {order.address ? (
                        <div className="space-y-1 text-gray-300 leading-relaxed">
                          <p className="font-bold text-white text-sm">{order.address.name}</p>
                          <p>{order.address.addressLine}, {order.address.city} - {order.address.pincode}</p>
                          <p className="text-gray-400 flex items-center gap-1.5 pt-1">
                            <Phone className="w-3 h-3 text-amber-400" /> {order.address.phone}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">No shipping address recorded</p>
                      )}

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-gray-400 font-medium">Payment Method</span>
                        <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                          {order.paymentMethod || "COD"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Orders