import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { useNavigate } from "react-router-dom"
import { Users as UsersIcon, Search, Shield, Ban, CheckCircle, Clock, ShieldAlert, ArrowRight, UserCog } from "lucide-react"

function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const navigate = useNavigate()

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/users")

      const updated = data.map((u) => {
        const isRecentlyActive =
          u.lastLogin &&
          Date.now() - new Date(u.lastLogin).getTime() < 2 * 60 * 1000

        return {
          ...u,
          active: u.active !== false,
          blocked: u.blocked || false,
          isOnline: (u.isOnline ?? false) || isRecentlyActive,
          lastLogin: u.lastLogin || null,
        }
      })

      setUsers(updated)
    } catch (err) {
      console.error(err)
      alert("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    const interval = setInterval(fetchUsers, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return

    const prev = users
    setUsers((u) => u.filter((x) => x.id !== id))

    try {
      await api.delete(`/users/${id}`)
    } catch (err) {
      console.error(err)
      alert("Delete failed")
      setUsers(prev)
    }
  }

  const handleBlockToggle = async (user) => {
    const prev = users

    setUsers((u) =>
      u.map((x) =>
        x.id === user.id ? { ...x, blocked: !x.blocked } : x
      )
    )

    try {
      await api.patch(`/users/${user.id}`, {
        blocked: !user.blocked,
      })
    } catch (err) {
      console.error(err)
      alert("Update failed")
      setUsers(prev)
    }
  }

  const handleActiveToggle = async (user) => {
    const prev = users

    setUsers((u) =>
      u.map((x) =>
        x.id === user.id ? { ...x, active: !x.active } : x
      )
    )

    try {
      await api.patch(`/users/${user.id}`, {
        active: !user.active,
      })
    } catch (err) {
      console.error(err)
      alert("Update failed")
      setUsers(prev)
    }
  }

  const handleRoleChange = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin"

    if (!window.confirm(`Make this user ${newRole}?`)) return

    const prev = users

    setUsers((u) =>
      u.map((x) =>
        x.id === user.id ? { ...x, role: newRole } : x
      )
    )

    try {
      await api.patch(`/users/${user.id}`, {
        role: newRole,
      })
    } catch (err) {
      console.error(err)
      alert("Role update failed")
      setUsers(prev)
    }
  }

  const filteredUsers = users.filter((u) =>
    (u.name || "").toLowerCase().includes(search.toLowerCase())
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <UsersIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Users</h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">{users.length} registered accounts</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Grid */}
      <div className="grid gap-4 sm:hidden">
        {filteredUsers.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 text-center">
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : filteredUsers.map((user) => {
          const status = getStatus(user)
          return (
            <div key={user.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-3xl relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div 
                  onClick={() => navigate(`/admin/profile/${user.id}`)}
                  className="flex items-center gap-3 cursor-pointer group-hover:opacity-80 transition-opacity"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-black font-black text-lg">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{user.name}</h3>
                    <p className="text-xs text-gray-400 truncate w-32">{user.email}</p>
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

              <div className="flex items-center justify-between text-xs text-gray-400 mb-5 bg-white/5 p-2 rounded-xl">
                <span className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-gray-600"}`}></div>
                  {user.isOnline ? "Online" : "Offline"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleActiveToggle(user)} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white hover:bg-white/10 transition-colors">
                  {user.active ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => handleBlockToggle(user)} className={`px-3 py-2 border rounded-xl text-xs font-semibold transition-colors ${user.blocked ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20" : "bg-white/5 text-yellow-400 border-white/10 hover:border-yellow-500/30"}`}>
                  {user.blocked ? "Unblock" : "Block"}
                </button>
                <button onClick={() => handleRoleChange(user)} className="px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors">
                  Toggle Role
                </button>
                <button onClick={() => handleDelete(user.id)} className="px-3 py-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/20 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-hidden bg-white/[0.02] border border-white/5 rounded-3xl">
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
                    No users found matching your search.
                  </td>
                </tr>
              ) : filteredUsers.map((user) => {
                const status = getStatus(user)
                return (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <div 
                        onClick={() => navigate(`/admin/profile/${user.id}`)}
                        className="flex items-center gap-4 cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gray-900 border border-white/10 flex items-center justify-center text-white font-black text-lg relative group-hover:border-yellow-400/50 transition-colors">
                          {user.name?.charAt(0).toUpperCase()}
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-950 ${user.isOnline ? "bg-emerald-400" : "bg-gray-600"}`}></div>
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-yellow-400 transition-colors flex items-center gap-2">
                            {user.name}
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-yellow-400" />
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
                        <span className="text-gray-300 font-medium">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}
                        </span>
                        <span className="text-xs text-gray-500">
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
                          className={`p-2 border rounded-xl transition-colors ${user.blocked ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20" : "bg-white/5 border-white/10 text-gray-400 hover:text-yellow-400 hover:border-yellow-400/30 hover:bg-white/10"}`}
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