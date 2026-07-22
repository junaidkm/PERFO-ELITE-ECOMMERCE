import React, { useContext } from "react"
import { WishlistContext } from "../context/WishlistContext"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { Heart, ShoppingCart, Trash2, ArrowRight } from "lucide-react"

function WishlistPage() {
  const { wishlist, loading, removeFromWishlist, moveToCart, clearWishlist } = useContext(WishlistContext)
  const { userId } = useContext(AuthContext)
  const navigate = useNavigate()

  if (!userId) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Layout>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
            <div className="text-center px-6 max-w-md bg-white p-10 rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-10 h-10 text-rose-500 fill-rose-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Sign in to view your Wishlist</h2>
              <p className="text-gray-500 mb-8 text-sm">Save your favourite fragrances and access them across devices.</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all hover:shadow-lg hover:scale-105"
              >
                Sign In <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Layout>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
                My Wishlist
              </h1>
              {!loading && wishlist.length > 0 && (
                <p className="mt-1 text-gray-500">
                  {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved in your wishlist
                </p>
              )}
            </div>

            {!loading && wishlist.length > 0 && (
              <button
                onClick={clearWishlist}
                className="self-start sm:self-auto text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Wishlist
              </button>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Loading your wishlist...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && wishlist.length === 0 && (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
              <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-8 text-center max-w-sm">Browse our luxury perfume collection and heart the items you love.</p>
              <button
                onClick={() => navigate("/products")}
                className="flex items-center gap-2 px-8 py-3.5 bg-gray-900 text-white font-bold rounded-full hover:bg-black transition-all hover:shadow-lg hover:scale-105"
              >
                Explore Products <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Wishlist Grid */}
          {!loading && wishlist.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {wishlist.map((item) => {
                const targetId = item.productId || item.id || item._id
                return (
                  <div
                    key={targetId}
                    className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Image */}
                    <div
                      className="relative bg-gradient-to-br from-gray-50 via-gray-50/80 to-rose-50/30 h-52 flex items-center justify-center p-6 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/products/${targetId}`)}
                    >
                      <img
                        src={item.img}
                        alt={item.name}
                        className="max-h-full object-contain drop-shadow-lg transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-5 flex flex-col gap-3 flex-1">
                      <h2
                        className="font-bold text-gray-900 text-sm line-clamp-2 leading-tight cursor-pointer hover:text-rose-600 transition-colors"
                        onClick={() => navigate(`/products/${targetId}`)}
                      >
                        {item.name}
                      </h2>

                      <p className="font-black text-gray-900 text-lg">
                        ₹ {item.price ? item.price.toLocaleString() : "N/A"}
                      </p>

                      <div className="flex gap-2 mt-auto pt-2">
                        <button
                          onClick={() => moveToCart(item)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all hover:shadow-md active:scale-95"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>

                        <button
                          onClick={() => removeFromWishlist(targetId)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-400 hover:bg-rose-50 hover:text-rose-500 border border-gray-100 transition-all duration-200"
                          aria-label="Remove from wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </Layout>
    </div>
  )
}

export default WishlistPage