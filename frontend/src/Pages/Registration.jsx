import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from "react-toastify"
import { api } from '../services/api'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"

function Registration() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rePassword, setRePassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showRePassword, setShowRePassword] = useState(false)

  const HandleSignUp = async () => {
    if (loading) return
    if (!name || !email || !password || !rePassword) { toast.warning("Please fill all fields"); return }
    if (password !== rePassword) { toast.warning("Passwords do not match"); return }
    const validEmail = /\S+@\S+\.\S+/
    if (!validEmail.test(email)) { toast.warning("Invalid email format"); return }
    setLoading(true)
    try {
      await api.post("/auth/register", { name, email, password })
      toast.success("Account created successfully!")
      setTimeout(() => { navigate("/login") }, 1000)
    } catch (error) {
      console.error(error)
      const errorMsg = error.response?.data?.message || "Signup Failed"
      toast.error(errorMsg)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex bg-gray-950">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-900/70 to-yellow-900/30" />
        <div className="relative z-10 text-center px-12">
          <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
            <img src="https://png.pngtree.com/png-clipart/20230508/original/pngtree-perfume-logo-in-elegant-golden-look-png-image_9147437.png" alt="logo" className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">Join Perfo Elite</h1>
          <p className="text-gray-300 text-lg max-w-sm leading-relaxed">Create your account and discover the world's finest fragrances.</p>
          <div className="mt-8 flex flex-col gap-3 text-left max-w-xs mx-auto">
            {["Free account creation", "Personalised wishlist", "Exclusive member offers"].map((f) => (
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
          <div className="mb-8">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">Create account</h2>
            <p className="text-gray-500 mt-2">Fill in your details to get started</p>
          </div>

          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type={showRePassword ? "text" : "password"} placeholder="Re-enter password" value={rePassword} onChange={(e) => setRePassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowRePassword(!showRePassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors">
                  {showRePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button onClick={HandleSignUp} disabled={loading}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-base transition-all duration-300 mt-2
                ${loading ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-gray-900 text-white hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-95"}`}
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div> Creating account...</>
              ) : (
                <>Create Account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

          <p className="text-center text-sm mt-6 text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-yellow-600 font-bold hover:text-yellow-700 hover:underline transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Registration