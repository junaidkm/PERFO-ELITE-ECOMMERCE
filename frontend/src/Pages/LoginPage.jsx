import { useState, useContext } from "react"
import { useNavigate, Link } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { toast } from "react-toastify"
import { api } from "../services/api"
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (loading) return
    if (!email || !password) return toast.warning("All fields are required")
    const validEmail = /\S+@\S+\.\S+/
    if (!validEmail.test(email)) return toast.warning("Invalid email format")
    setLoading(true)
    try {
      const { data } = await api.post("/auth/login", { email, password })
      toast.success("Login Successful")
      login(data.user.id)  // Token is set in httpOnly cookie by the server
      setTimeout(() => { navigate(data.user.role === "admin" ? "/admin" : "/") }, 500)
    } catch (err) {
      console.error(err)
      const errorMsg = err.response?.data?.message || "Login failed"
      toast.error(errorMsg)
    } finally { setLoading(false) }
  }



  const handleEnter = (e) => { if (e.key === "Enter") handleLogin() }

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1594035910387-fea47794261f?w=1200')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-900/70 to-yellow-900/40" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <img src="https://png.pngtree.com/png-clipart/20230508/original/pngtree-perfume-logo-in-elegant-golden-look-png-image_9147437.png" alt="logo" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Perfo Elite</h1>
          <p className="text-gray-300 text-lg max-w-sm leading-relaxed">Your gateway to premium fragrances. Sign in to explore exclusive collections.</p>
          <div className="mt-8 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {["Exclusive luxury brands", "Authentic & certified", "Fast & secure delivery"].map((f) => (
              <div key={f} className="flex items-center gap-3 text-gray-300 text-sm">
                <span className="w-5 h-5 rounded-full bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center text-yellow-400 text-xs font-bold">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleEnter}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleEnter}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>



            <button
              onClick={handleLogin}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300
                ${loading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-95"}`}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Signing in...</>
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>


          </div>

          <p className="text-center text-sm mt-8 text-gray-500">
            Don't have an account?{" "}
            <Link to="/signup" className="text-yellow-600 font-bold hover:text-yellow-700 hover:underline transition-colors">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage