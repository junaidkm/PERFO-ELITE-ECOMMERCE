

import React, { useContext, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { CartContext } from "../context/CartContext"
import { WishlistContext } from "../context/WishlistContext"
import { Home, ShoppingBag, ShoppingCart, Heart, Package, User, LogOut, LogIn, Menu, X } from "lucide-react"

function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const { userId, logout, user } = useContext(AuthContext)
  const { cart } = useContext(CartContext)
  const { wishlist } = useContext(WishlistContext)

  const orderCount =
    user?.order?.filter(
      order => order.status?.toLowerCase() !== "cancelled"
    )?.length || 0

  const cartCount = cart.length
  const wishlistCount = wishlist.length

  const [open, setOpen] = useState(false)

  const navLink = (path) =>
    `relative transition duration-300 ${
      location.pathname === path
        ? "text-white font-semibold"
        : "text-gray-400 hover:text-white"
    }`

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-2xl bg-gray-950/80 border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">

      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8 py-3.5">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <img
            src="https://png.pngtree.com/png-clipart/20230508/original/pngtree-perfume-logo-in-elegant-golden-look-png-image_9147437.png"
            alt="logo"
            className="w-9 h-9 group-hover:scale-110 transition duration-300"
          />
          <h1 className="text-lg font-black text-white tracking-wide">
            Perfo<span className="text-yellow-400">Elite</span>
          </h1>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">

          {/* Nav Links */}
          <button
            onClick={() => navigate("/")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Home className="w-4 h-4" />
            Home
          </button>

          <button
            onClick={() => navigate("/products")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/products"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Products
          </button>

          {/* Cart */}
          <button
            onClick={() => navigate("/cart")}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/cart"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg shadow-yellow-400/30">
                {cartCount}
              </span>
            )}
          </button>

          {/* Wishlist */}
          <button
            onClick={() => navigate("/wishlist")}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/wishlist"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Heart className="w-4 h-4" />
            Wishlist
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg shadow-rose-500/30">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Orders */}
          <button
            onClick={() => navigate("/order")}
            className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/order"
                ? "bg-white/10 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Package className="w-4 h-4" />
            Orders
            {orderCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-[10px] font-black min-w-[18px] h-[18px] flex items-center justify-center rounded-full shadow-lg shadow-yellow-400/30">
                {orderCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-white/10 mx-2"></div>

          {/* Profile */}
          {userId && (
            <button
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              <div className="w-6 h-6 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center text-xs font-black">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span className="max-w-[80px] truncate">{user?.name}</span>
            </button>
          )}

          {/* Auth */}
          {userId ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-all duration-200 shadow-lg shadow-yellow-400/20"
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div className="md:hidden fixed inset-0 top-[57px] bg-black/60 backdrop-blur-sm z-40" onClick={() => setOpen(false)}></div>

          <div className="md:hidden fixed top-[57px] left-0 right-0 z-50 bg-gray-950 border-t border-white/5 px-5 py-6 flex flex-col gap-2 shadow-2xl max-h-[calc(100vh-57px)] overflow-y-auto">

            {/* Nav Items */}
            {[
              { path: "/", label: "Home", Icon: Home },
              { path: "/products", label: "Products", Icon: ShoppingBag },
            ].map(({ path, label, Icon }) => (
              <button
                key={path}
                onClick={() => { navigate(path); setOpen(false) }}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all ${
                  location.pathname === path
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}

            {/* Cart */}
            <button
              onClick={() => { navigate("/cart"); setOpen(false) }}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="flex items-center gap-3">
                <ShoppingCart className="w-5 h-5" />
                Cart
              </span>
              {cartCount > 0 && (
                <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Wishlist */}
            <button
              onClick={() => { navigate("/wishlist"); setOpen(false) }}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="flex items-center gap-3">
                <Heart className="w-5 h-5" />
                Wishlist
              </span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Orders */}
            <button
              onClick={() => { navigate("/order"); setOpen(false) }}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <span className="flex items-center gap-3">
                <Package className="w-5 h-5" />
                Orders
              </span>
              {orderCount > 0 && (
                <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {orderCount}
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="h-px bg-white/5 my-2"></div>

            {/* Profile */}
            {userId && (
              <button
                onClick={() => { navigate("/profile"); setOpen(false) }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center text-sm font-black">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-white">{user?.name || "Profile"}</p>
                  <p className="text-xs text-gray-500">View profile</p>
                </div>
              </button>
            )}

            {/* Auth */}
            {userId ? (
              <button
                onClick={() => { logout(); setOpen(false) }}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            ) : (
              <button
                onClick={() => { navigate("/login"); setOpen(false) }}
                className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl text-sm font-bold bg-yellow-400 text-gray-900 hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>
        </>
      )}
    
    </nav>
  )
}

export default Navbar