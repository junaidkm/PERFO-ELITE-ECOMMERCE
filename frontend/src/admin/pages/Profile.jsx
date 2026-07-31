import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../services/api"
import { User, ArrowLeft, Mail, ShieldAlert, Package, Heart, Clock, CheckCircle2, XCircle } from "lucide-react"

function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        let foundUser = null
        try {
          const { data } = await api.get(`/users/${id}`)
          foundUser = data
        } catch (e) {
          const { data: allUsers } = await api.get("/users")
          const list = Array.isArray(allUsers) ? allUsers : allUsers?.users || []
          foundUser = list.find((u) => (u.id || u._id) === id)
        }

        if (foundUser) {
          try {
            const { data: allOrders } = await api.get("/orders/admin/all")
            const ordersList = Array.isArray(allOrders) ? allOrders : allOrders?.orders || []
            const userOrders = ordersList.filter(
              (o) => (o.userId?._id || o.userId?.id || o.userId) === id
            )
            foundUser.order = userOrders
          } catch (e) {
            foundUser.order = foundUser.order || []
          }
        }

        setUser(foundUser || null)
      } catch (err) {
        console.error("Profile error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-medium">Loading user profile details...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl p-8 max-w-md mx-auto text-center mt-10">
        <User className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-xl font-bold text-white mb-2">User Account Not Found</p>
        <p className="text-gray-400 text-sm mb-6">The user profile you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate("/admin/users")}
          className="px-6 py-2.5 bg-amber-400 text-gray-950 font-bold rounded-xl hover:bg-amber-300 transition-all shadow-lg shadow-amber-400/20 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Users List
        </button>
      </div>
    )
  }

  const userId = user.id || user._id
  const statusColor = !user.active
    ? "bg-gray-500/10 text-gray-400 border-gray-500/20"
    : user.blocked
    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"

  const statusText = !user.active ? "Inactive" : user.blocked ? "Blocked" : "Active"

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <User className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Customer Profile</h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">Detailed overview of user activity and history</p>
          </div>
        </div>

        <button
          onClick={() => navigate("/admin/users")}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Users</span>
        </button>
      </div>

      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row gap-10">
        
        {/* Left Side: Profile Card */}
        <div className="flex flex-col items-center text-center md:w-1/3 md:border-r border-white/5 md:pr-10">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/20 blur-2xl rounded-full"></div>
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-5xl font-black text-gray-950 shadow-xl ring-4 ring-gray-950 mb-6">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 border-gray-950 ${user.active && !user.blocked ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
          </div>

          <h2 className="text-2xl font-black text-white mb-1">{user.name}</h2>
          <p className="text-sm text-gray-400 font-medium flex items-center justify-center gap-1.5 mb-6">
            <Mail className="w-4 h-4 text-amber-400" /> {user.email}
          </p>

          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColor}`}>
            {statusText}
          </span>
        </div>

        {/* Right Side: Information */}
        <div className="flex-1 space-y-8">
          
          {/* Details Grid */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" /> Account Attributes
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-xs text-gray-400 font-medium mb-1">Role</span>
                <span className={`text-sm font-bold flex items-center gap-1.5 ${user.role === 'admin' ? 'text-purple-400' : 'text-white'}`}>
                  {user.role === 'admin' && <ShieldAlert className="w-3.5 h-3.5" />} {(user.role || 'user').toUpperCase()}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-xs text-gray-400 font-medium mb-1">User ID</span>
                <span className="text-xs font-mono text-amber-300 truncate" title={userId}>{userId}</span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-xs text-gray-400 font-medium mb-1">Total Orders</span>
                <span className="text-lg font-black text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-400" /> {user.order?.length || 0}
                </span>
              </div>
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                <span className="text-xs text-gray-400 font-medium mb-1">Wishlist Items</span>
                <span className="text-lg font-black text-white flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400" /> {user.wishlist?.length || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Orders List */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" /> Recent Order History
            </h3>
            
            {user.order?.length > 0 ? (
              <div className="space-y-3">
                {user.order.slice(-3).reverse().map((o) => {
                  const orderId = o.id || o._id
                  return (
                    <div key={orderId} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:bg-white/10 transition-colors">
                      <div>
                        <p className="text-sm font-bold text-white mb-0.5">₹{Number(o.total || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 font-medium">{o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "Recent")}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                        o.status === "Cancelled"
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {o.status === "Cancelled" ? <XCircle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {o.status || "Placed"}
                      </span>
                    </div>
                  )
                })}
                {user.order.length > 3 && (
                  <p className="text-center text-xs text-gray-500 font-medium pt-2">
                    Showing 3 of {user.order.length} orders
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-white/5 border border-white/5 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <Package className="w-8 h-8 text-gray-600 mb-2" />
                <p className="text-sm font-bold text-gray-300">No orders yet</p>
                <p className="text-xs text-gray-500 mt-1">This customer has not placed any orders yet.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default Profile