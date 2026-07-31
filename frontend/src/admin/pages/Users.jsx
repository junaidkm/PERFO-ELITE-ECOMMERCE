import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { useNavigate } from "react-router-dom"
import { Users as UsersIcon, Search, Shield, Ban, CheckCircle, Clock, ShieldAlert, ArrowRight, UserCog, Trash2 } from "lucide-react"
import { toast } from "react-toastify"

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/users")
      const rawList = Array.isArray(data) ? data : data?.users || []

      const updated = rawList.map((u) => {
        const isRecentlyActive =
          u.lastLogin &&
          Date.now() - new Date(u.lastLogin).getTime() < 5 * 60 * 1000

        return {
          ...u,
          id: u.id || u._id,
          active: u.active !== false,
          blocked: u.blocked || false,
          isOnline: (u.isOnline ?? false) || isRecentlyActive,
          lastLogin: u.lastLogin || null,
        }
      })

      setUsers(updated)
    } catch (err) {
      console.error("Fetch users error:", err)
      toast.error("Failed to load users list ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleDelete = async (user) => {
    const userId = user.id || user._id
    if (!userId) return

    if (!window.confirm(`Delete user '${user.name}'? This action cannot be undone.`)) return

    try {
      await api.delete(`/users/${userId}`)
      toast.success("User deleted successfully 🗑️")
      fetchUsers()
    } catch (err) {
      console.error("Delete user error:", err)
      toast.error(err.response?.data?.message || "Failed to delete user ❌")
    }
  }

  const handleBlockToggle = async (user) => {
    const userId = user.id || user._id
    if (!userId) return

    const newBlockedState = !user.blocked

    try {
      await api.patch(`/users/${userId}`, {
        blocked: newBlockedState,
      })
      toast.info(newBlockedState ? "User blocked 🚫" : "User unblocked ✅")
      fetchUsers()
    } catch (err) {
      console.error("Block user error:", err)
      toast.error("Failed to update user block status")
    }
  }

  const handleActiveToggle = async (user) => {
    const userId = user.id || user._id
    if (!userId) return

    const newActiveState = !user.active

    try {
      await api.patch(`/users/${userId}`, {
        active: newActiveState,
      })
      toast.info(newActiveState ? "User account activated" : "User account deactivated")
      fetchUsers()
    } catch (err) {
      console.error("Active status update error:", err)
      toast.error("Failed to update active status")
    }
  }

  const handleRoleChange = async (user) => {
    const userId = user.id || user._id
    if (!userId) return

    const newRole = user.role === "admin" ? "user" : "admin"

    if (!window.confirm(`Change role of '${user.name}' to ${newRole.toUpperCase()}?`)) return

    try {
      await api.patch(`/users/${userId}`, {
        role: newRole,
      })
      toast.success(`Role changed to ${newRole.toUpperCase()} 🛡️`)
      fetchUsers()
    } catch (err) {
      console.error("Role update error:", err)
      toast.error("Role update failed ❌")
    }
  }

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  )

  const getStatus = (user) => {
    if (user.blocked) return { label: "Blocked", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" }
    if (!user.active) return { label: "Inactive", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" }
    return { label: "Active", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="h-96 bg-white/5 rounded-3xl" />
      </div>
    )
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <UsersIcon className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Users Management</h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">{users.length} registered user accounts</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid gap-4 sm:hidden">
        {filteredUsers.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center">
            <p className="text-gray-400 text-sm">No users found matching search.</p>
          </div>
        ) : filteredUsers.map((user) => {
          const userId = user.id || user._id
          const status = getStatus(user)
          return (
            <div key={userId} className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div 
                  onClick={() => navigate(`/admin/profile/${userId}`)}
                  className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-gray-950 font-black text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{user.name}</h3>
                    <p className="text-xs text-gray-400 truncate w-36">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                    {status.label}
                  </span>
                  {user.role === "admin" && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border border-purple-500/20 text-purple-400 bg-purple-500/10 flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Admin
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-5 bg-white/5 p-2.5 rounded-xl">
                <span className="flex items-center gap-1.5 font-medium">
                  <div className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-gray-600"}`}></div>
                  {user.isOnline ? "Online" : "Offline"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleActiveToggle(user)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                  {user.active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleBlockToggle(user)} className={`px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${user.blocked ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" : "bg-white/5 text-amber-400 border-white/10 hover:border-amber-500/30"}`}>
                  {user.blocked ? "Unblock" : "Block"}
                </button>
                <button onClick={() => handleRoleChange(user)} className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors">
                  Toggle Role
                </button>
                <button onClick={() => handleDelete(user)} className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-hidden bg-white/[0.02] border border-white/5 rounded-3xl shadow-xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-xs uppercase text-gray-400 font-bold border-b border-white/5">
              <tr>
                <th className="px-6 py-4 rounded-tl-3xl">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Last Login</th>
                <th className="px-6 py-4 text-right rounded-tr-3xl">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    No registered users matching your search.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => {
                const userId = user.id || user._id
                const status = getStatus(user)
                return (
                  <tr key={userId} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => navigate(`/admin/profile/${userId}`)}
                        className="flex items-center gap-4 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-white font-black text-lg relative group-hover:border-amber-400/50 transition-colors">
                          {user.name?.charAt(0).toUpperCase()}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-950 ${user.isOnline ? "bg-emerald-400" : "bg-gray-600"}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-amber-400 transition-colors flex items-center gap-2">
                            {user.name}
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-amber-400" />
                          </p>
                          <p className="text-xs text-gray-500 font-medium">{user.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${user.role === "admin" ? "border-purple-500/20 text-purple-400 bg-purple-500/10" : "border-white/10 text-gray-400 bg-white/5"}`}>
                        {user.role === "admin" ? <ShieldAlert className="w-3 h-3" /> : <UserCog className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-300 font-medium text-xs">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                        </span>
                        <span className="text-[11px] text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleActiveToggle(user)}
                          className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                          title={user.active ? "Deactivate" : "Activate"}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleBlockToggle(user)}
                          className={`p-2 border rounded-xl transition-colors ${user.blocked ? "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20" : "bg-white/5 border-white/10 text-gray-400 hover:text-amber-400 hover:border-amber-400/30 hover:bg-white/10"}`}
                          title={user.blocked ? "Unblock" : "Block"}
                        >
                          <Ban className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleRoleChange(user)}
                          className="p-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 hover:bg-purple-500/20 transition-colors"
                          title="Toggle Role"
                        >
                          <Shield className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 hover:bg-rose-500/20 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users