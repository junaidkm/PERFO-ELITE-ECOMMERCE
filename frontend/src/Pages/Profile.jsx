import React, { useContext } from "react"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { ChevronLeft, ShoppingCart, LogOut, User, Mail, Hash } from "lucide-react"

function Profile() {
  const { user, logout } = useContext(AuthContext)
  const navigate = useNavigate()
  
  if (!user) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-500 mb-6">Please sign in to view your profile.</p>
          <button onClick={() => navigate("/login")} className="px-8 py-3 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all hover:scale-105">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

          {/* Back */}
          <button onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 font-medium text-sm mb-8">
            <span className="p-1.5 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </span>
            Back
          </button>

          {/* Profile Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header Banner */}
            <div className="h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 relative">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800')] bg-cover bg-center opacity-20"></div>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center -mt-14 relative z-10 pb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 text-white flex items-center justify-center text-3xl font-black ring-4 ring-white shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <h2 className="mt-4 text-2xl font-black text-gray-900">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>

            {/* Details */}
            <div className="px-6 sm:px-8 pb-8">
              <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Hash className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">User ID</p>
                    <p className="text-sm font-bold text-gray-900">{user?.id || "N/A"}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-200/60"></div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Name</p>
                    <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                  </div>
                </div>

                <div className="h-px bg-gray-200/60"></div>

                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Email</p>
                    <p className="text-sm font-bold text-gray-900 break-all">{user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button onClick={() => navigate("/cart")}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gray-900 text-white hover:bg-black transition-all duration-300 hover:shadow-lg active:scale-95">
                  <ShoppingCart className="w-4 h-4" />
                  Go to Cart
                </button>
                <button onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all duration-300 active:scale-95">
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}

export default Profile