import React, { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { CartContext } from "../context/CartContext"
import { WishlistContext } from "../context/WishlistContext"
import { ShoppingCart, Heart, Sparkles } from "lucide-react"

function ProductCard({ item }) {
  const navigate = useNavigate()

  const { userId } = useContext(AuthContext)
  const { addToCart, loading: cartLoading } = useContext(CartContext)
  const { wishlist, toggleWishlist } = useContext(WishlistContext)

  const isWishlisted = wishlist.some(
    (w) => String(w.productId) === String(item.id || item._id)
  )

  const defaultSize = item.sizes?.[0]
  const isAvailable = defaultSize?.stock === "In Stock"

  return (
    <div
      onClick={() => navigate(`/products/${item.id || item._id}`)}
      className="group relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
      p-4 flex flex-col justify-between cursor-pointer 
      transition-all duration-500 ease-out border border-gray-100
      hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] hover:-translate-y-2 overflow-hidden"
    >
      {/* Category Badge */}
      {item.category && (
        <div className="absolute top-4 left-4 z-20">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-900/80 backdrop-blur-md text-white rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            {item.category}
          </span>
        </div>
      )}

      {/* ❤️ Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (!userId) {
            navigate("/login")
            return
          }
          toggleWishlist(item)
        }}
        className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-sm border border-gray-100 transition-all duration-300 hover:scale-110 hover:bg-white active:scale-95"
        aria-label="Toggle Wishlist"
      >
        <Heart 
          className={`w-5 h-5 transition-colors duration-300 ${
            isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400 group-hover:text-rose-400"
          }`} 
        />
      </button>

      {/* ✨ Image Section */}
      <div className="relative z-10 bg-gradient-to-tr from-gray-50 via-gray-50/80 to-amber-50/30 
      rounded-2xl p-6 h-56 sm:h-64 flex items-center justify-center overflow-hidden mb-4 mt-8">
        <img
          src={item.img}
          alt={item.name}
          className="max-h-full object-contain drop-shadow-xl 
          transition duration-700 ease-out group-hover:scale-110 group-hover:-rotate-2"
        />
      </div>

      {/* 📦 Content */}
      <div className="relative z-10 flex flex-col gap-3 flex-1">
        
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-gray-900 
          line-clamp-2 leading-tight flex-1 group-hover:text-amber-600 transition-colors">
            {item.name}
          </h3>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              ₹ {defaultSize?.price?.toLocaleString() ?? "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md ${
              isAvailable
                ? "bg-emerald-50 text-emerald-600"
                : "bg-rose-50 text-rose-600"
            }`}>
              {defaultSize?.stock || "Out of Stock"}
            </span>
            {defaultSize?.size && (
              <span className="text-[11px] font-semibold text-gray-400">
                • {defaultSize.size}
              </span>
            )}
          </div>
        </div>

        {/* 🛒 Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            addToCart({
              product: item,
              selectedSize: defaultSize
            })
          }}
          disabled={cartLoading || !isAvailable}
          className={`
            mt-3 w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide
            flex items-center justify-center gap-2 relative overflow-hidden
            transition-all duration-300 shadow-sm
            
            ${cartLoading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : !isAvailable
              ? "bg-rose-50 text-rose-500 cursor-not-allowed border border-rose-100"
              : "bg-gray-900 text-white hover:bg-black hover:shadow-lg active:scale-[0.98]"
            }
          `}
        >
          {cartLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Adding...</span>
            </>
          ) : !isAvailable ? (
            "Out of Stock"
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>

      </div>
    </div>
  )
}

export default ProductCard