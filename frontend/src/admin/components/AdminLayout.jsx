import { Outlet, NavLink, useNavigate } from "react-router-dom"
import { useState, useEffect, useContext } from "react"
import { AuthContext } from "../../context/AuthContext"
import { api } from "../../services/api"
import { LayoutDashboard, Package, Users, Receipt, Menu, X, LogOut, ShieldAlert } from "lucide-react"

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [admin, setAdmin] = useState(null)

  const { userId, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAdmin = async () => {
      if (!userId) return navigate("/login")

      try {
        const { data } = await api.get(`/users/${userId}`)

        if (data.role !== "admin") return navigate("/")
        if (data.blocked) return navigate("/login")

        setAdmin(data)
      } catch {
        navigate("/login")
      }
    }

    fetchAdmin()
  }, [userId, navigate])

  const linkStyle = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300
    ${
      isActive
        ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/20 translate-x-1"
        : "text-gray-400 hover:bg-white/10 hover:text-white hover:translate-x-1"
    }`

  return (
    <div className="flex min-h-screen bg-gray-950 text-white font-sans selection:bg-yellow-400/30 selection:text-yellow-400">

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72
        bg-gray-900/50 backdrop-blur-2xl border-r border-white/5
        transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
        flex flex-col
        ${sidebarOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-black shadow-lg shadow-yellow-400/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-wide">
                Perfo<span className="text-yellow-400">Admin</span>
              </h2>
            </div>
          </div>

          <button onClick={() => setSidebarOpen(false)} className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavLink to="/admin" end className={linkStyle}>
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </NavLink>

          <NavLink to="/admin/products" className={linkStyle}> 
            <Package className="w-5 h-5" /> Products
          </NavLink>

          <NavLink to="/admin/users" className={linkStyle}>
            <Users className="w-5 h-5" /> Users
          </NavLink>

          <NavLink to="/admin/orders" className={linkStyle}>
            <Receipt className="w-5 h-5" /> Orders
          </NavLink>
        </nav>

        <div className="p-6 border-t border-white/5 bg-gray-900/20">
          <p className="text-xs text-gray-500 font-medium tracking-wide">
            © 2026 Perfo Elite Admin
          </p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden">
        
        {/* Background Gradients */}
        <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none" />

        <header className="sticky top-0 z-30 bg-gray-950/60 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center transition-all duration-300">

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white hidden sm:block">
              Control Panel
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white">
                {admin?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {admin?.email}
              </p>
            </div>
  
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-black font-black text-lg shadow-lg shadow-yellow-400/20 ring-2 ring-white/10">
              {admin?.name?.charAt(0).toUpperCase() || "A"}
            </div>

            <div className="w-px h-8 bg-white/10 mx-2 hidden sm:block"></div>

            <button onClick={logout} className="flex items-center gap-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-rose-500/20 hover:border-rose-500/30 transition-all duration-300">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>  
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 relative z-10 w-full max-w-[1600px] mx-auto">
          <Outlet />
        </div>

      </main>
    </div>
  )
}

export default AdminLayout