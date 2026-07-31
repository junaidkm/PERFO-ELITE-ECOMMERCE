import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { motion } from "framer-motion"
import { LayoutDashboard, Users, Package, Receipt, DollarSign, Activity, ShoppingBag, RefreshCw } from "lucide-react"

import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts"
import { toast } from "react-toastify"

const formatCurrency = (num) =>
  `₹${(num || 0).toLocaleString("en-IN")}`

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    revenue: 0,
    inStock: 0,
    outOfStock: 0
  })

  const [recentOrders, setRecentOrders] = useState([])
  const [salesData, setSalesData] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/admin/dashboard")

      if (data) {        if (data.stats) setStats(data.stats)
        if (data.recentOrders) setRecentOrders(data.recentOrders)
        if (data.salesData) setSalesData(data.salesData)
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
      // Fallback if admin route is not accessible
      try {
        const [usersRes, productsRes] = await Promise.all([
          api.get("/users"),
          api.get("/products")
        ])

        const users = Array.isArray(usersRes.data) ? usersRes.data : usersRes.data?.users || []
        const products = Array.isArray(productsRes.data) ? productsRes.data : productsRes.data?.products || []

        setStats((prev) => ({
          ...prev,
          users: users.length,
          products: products.length
        }))
      } catch (e) {
        console.error("Fallback error:", e)
        toast.error("Failed to load dashboard metrics ❌")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const statusStyle = {
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Processing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    Placed: "bg-amber-500/10 text-amber-400 border-amber-500/20"
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-36 bg-white/5 rounded-3xl" />
          ))}
        </div>
        <div className="h-[400px] bg-white/5 rounded-3xl" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
    { label: "Total Orders", value: stats.orders, icon: Receipt, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 text-xs font-bold mb-1">{label}</p>
          <p className="text-amber-400 font-black text-lg">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-amber-400/10 rounded-xl border border-amber-400/20">
              <LayoutDashboard className="w-6 h-6 text-amber-400" />
            </div>
            Dashboard Overview
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">Real-time metrics and sales performance powered by Mongoose analytics.</p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
            className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-6 rounded-3xl relative overflow-hidden group hover:border-white/10 transition-colors"
          >
            <div className={`absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-20 rounded-full ${item.bg} group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl border ${item.bg} ${item.color} ${item.border}`}>
                  <item.icon className="w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                <h3 className="text-3xl font-black text-white tracking-tight">{item.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-6 sm:p-8 rounded-3xl relative overflow-hidden"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
            <Activity className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Revenue Overview (7 Days)</h3>
            <p className="text-xs text-gray-400 font-medium">Sales aggregation computed directly in MongoDB</p>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="date" stroke="#ffffff40" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} dy={10} />
              <YAxis stroke="#ffffff40" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `₹${value >= 1000 ? value/1000 + 'k' : value}`} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area type="monotone" dataKey="sales" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" activeDot={{ r: 6, fill: '#facc15', stroke: '#000', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Bottom Grid */}
      <div className="grid lg:grid-cols-3 gap-8">

        {/* Stock Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="lg:col-span-1 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-6 sm:p-8 rounded-3xl flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Inventory Status</h3>
              <p className="text-xs text-gray-400 font-medium">Stock variant breakdown</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors text-sm">In Stock Variants</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.inStock}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors text-sm">Out of Stock Variants</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.outOfStock}</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="lg:col-span-2 bg-white/[0.02] backdrop-blur-3xl border border-white/5 p-6 sm:p-8 rounded-3xl flex flex-col"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <Receipt className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
              <p className="text-xs text-gray-400 font-medium">Latest store orders</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
            {recentOrders.length > 0 ? (
              recentOrders.map((o) => {
                const orderId = o.id || o._id
                const customerName = o.userId?.name || o.address?.name || "Customer"

                return (
                  <div
                    key={orderId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Package className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">
                          {customerName} <span className="text-xs font-mono font-normal text-gray-400">(#{String(orderId).slice(-6)})</span>
                        </p>
                        <p className="text-xs text-gray-400 font-medium">{o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recent")}</p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                      <p className="text-base font-black text-white">
                        {formatCurrency(o.total)}
                      </p>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusStyle[o.status] || statusStyle.Placed}`}>
                        {o.status || "Placed"}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <Receipt className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium text-sm">No recent transactions found</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Dashboard