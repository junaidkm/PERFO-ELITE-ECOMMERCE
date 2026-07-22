import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { motion } from "framer-motion"
import { LayoutDashboard, Users, Package, Receipt, DollarSign, Activity, ShoppingBag, ArrowUpRight, ArrowDownRight } from "lucide-react"

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area
} from "recharts"

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
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, productsRes] = await Promise.all([
          api.get("/users"),
          api.get("/products")
        ])

        const users = usersRes.data || []
        const products = productsRes.data || []

        let allOrders = []
        users.forEach(u => {
          if (Array.isArray(u.order)) {
            allOrders = [...allOrders, ...u.order]
          }
        })
        
        const revenue = allOrders.reduce((t, o) => t + (o.total || 0), 0)

        let inStock = 0
        let outOfStock = 0

        products.forEach(p => {
          p.sizes?.forEach(s => {
            s.stock === "In Stock" ? inStock++ : outOfStock++
          })
        })

        setStats({
          users: users.length,
          products: products.length,
          orders: allOrders.length,
          revenue,
          inStock,
          outOfStock
        })

        setRecentOrders(allOrders.slice(-5).reverse())
        
        const last7Days = {}
        for (let i = 6; i >= 0; i--) {
          const d = new Date()
          d.setDate(d.getDate() - i)
          last7Days[d.toLocaleDateString()] = 0
        }
        
        allOrders.forEach(o => {
          const d = new Date(o.date).toLocaleDateString()
          if (last7Days[d] !== undefined) {
            last7Days[d] += o.total || 0
          }
        })

        setSalesData(
          Object.keys(last7Days).map(date => ({
            date: date.split('/')[0] + '/' + date.split('/')[1], // Shorten date
            sales: last7Days[date]
          }))
        )

      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const statusStyle = {
    Delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Cancelled: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    Shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Placed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
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
    { label: "Total Revenue", value: formatCurrency(stats.revenue), icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    { label: "Total Orders", value: stats.orders, icon: Receipt, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    { label: "Total Products", value: stats.products, icon: Package, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    { label: "Total Users", value: stats.users, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" }
  ]

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl">
          <p className="text-gray-400 text-xs font-bold mb-1">{label}</p>
          <p className="text-yellow-400 font-black text-lg">
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
            <div className="p-2.5 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
              <LayoutDashboard className="w-6 h-6 text-yellow-400" />
            </div>
            Dashboard Overview
          </h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">Welcome back, here's what's happening with your store today.</p>
        </div>
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
            {/* Background Glow */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 blur-3xl opacity-20 rounded-full ${item.bg} group-hover:opacity-40 transition-opacity duration-500 pointer-events-none`}></div>

            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl border ${item.bg} ${item.color} ${item.border}`}>
                  <item.icon className="w-6 h-6" />
                </div>
                {/* Optional trend indicator can go here */}
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
            <h3 className="text-lg font-bold text-white">Revenue Overview</h3>
            <p className="text-xs text-gray-400 font-medium">Sales performance over the last 7 days</p>
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
              <YAxis stroke="#ffffff40" tick={{ fill: '#9ca3af', fontSize: 12 }} tickLine={false} axisLine={false} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
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
              <h3 className="text-lg font-bold text-white">Inventory</h3>
              <p className="text-xs text-gray-400 font-medium">Current stock status</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">In Stock</span>
              </div>
              <span className="text-2xl font-black text-white">{stats.inStock}</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]"></div>
                <span className="font-semibold text-gray-300 group-hover:text-white transition-colors">Out of Stock</span>
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
              <h3 className="text-lg font-bold text-white">Recent Orders</h3>
              <p className="text-xs text-gray-400 font-medium">Latest transactions across the store</p>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
            {recentOrders.length > 0 ? recentOrders.map(o => (
              <div
                key={o.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white mb-0.5">Order #{o.id.toString().slice(-6)}</p>
                    <p className="text-xs text-gray-400 font-medium">{o.date}</p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
                  <p className="text-base font-black text-white">
                    {formatCurrency(o.total)}
                  </p>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border ${statusStyle[o.status]}`}>
                    {o.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-10">
                <Receipt className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-400 font-medium">No recent orders found</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  )
}

export default Dashboard