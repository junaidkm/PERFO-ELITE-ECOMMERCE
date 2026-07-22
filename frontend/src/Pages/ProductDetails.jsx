import React, { useContext, useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"
import { CartContext } from "../context/CartContext"
import { WishlistContext } from "../context/WishlistContext"
import { toast } from "react-toastify"
import { api } from "../services/api"
import { ChevronLeft, ShoppingCart, Zap, Info, ShieldCheck, Truck, Heart, Sparkles, Award } from "lucide-react"

import Layout from "../components/Layout"

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { userId } = useContext(AuthContext)
  const { addToCart, loading: cartLoading } = useContext(CartContext)
  const { wishlist, toggleWishlist } = useContext(WishlistContext)

  const [product, setProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [loading, setLoading] = useState(true)

  const isWishlisted = wishlist.some(
    (w) => String(w.productId) === String(product?.id || product?._id)
  )

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`)
        setProduct(data)
        setSelectedSize(data.sizes?.[0] || null)
      } catch (err) {
        console.log("Error fetching product:", err)
        toast.error("Failed to load product details")
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fafafa]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-gray-500 animate-pulse">Loading product details...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#fafafa]">
        <div className="text-center px-4">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-10 h-10 text-amber-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-500 mb-6 max-w-sm mx-auto">The fragrance product you are looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/products")}
            className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold hover:bg-black transition-all hover:scale-105 shadow-md"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  const handleBuyNow = () => {
    if (!userId) return toast.warning("Login first")
    if (!selectedSize) return toast.warning("Select size")
    if (selectedSize.stock !== "In Stock") return toast.error("Out of stock")

    navigate("/payment", {
      state: {
        buyNowItem: {
          id: product.id || product._id,
          name: product.name,
          img: product.img,
          price: selectedSize?.price,
          selectedSize,
          quantity: 1
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Layout>

        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors duration-200 font-medium text-sm"
          >
            <span className="p-1.5 rounded-full bg-white border border-gray-200 group-hover:bg-gray-100 transition-colors shadow-sm">
              <ChevronLeft className="w-4 h-4" />
            </span>
            Back to products
          </button>
        </div>

        {/* Main Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-16">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-12 relative overflow-hidden">
            
            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-stretch">
              
              {/* Image Column */}
              <div className="w-full lg:w-1/2 flex flex-col">
                <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 via-gray-50/80 to-amber-50/40 rounded-[2rem] flex items-center justify-center p-8 overflow-hidden group border border-gray-100">
                  
                  {/* Category Tag */}
                  <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
                    <span className="px-4 py-1.5 bg-gray-900 text-white rounded-full text-xs font-black tracking-widest uppercase shadow-md flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      {product.category}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => {
                      if (!userId) {
                        navigate("/login")
                        return
                      }
                      toggleWishlist(product)
                    }}
                    className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md border border-gray-100 transition-all duration-300 hover:scale-110 active:scale-95"
                    aria-label="Toggle Wishlist"
                  >
                    <Heart 
                      className={`w-6 h-6 transition-colors duration-300 ${
                        isWishlisted ? "fill-rose-500 text-rose-500" : "text-gray-400 hover:text-rose-400"
                      }`} 
                    />
                  </button>

                  <img
                    src={product.img}
                    alt={product.name}
                    className="max-h-full object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </div>

              {/* Product Details Column */}
              <div className="w-full lg:w-1/2 flex flex-col justify-between">
                
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-4 tracking-tight">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-baseline gap-4 mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                      ₹ {selectedSize?.price?.toLocaleString()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase ${
                      selectedSize?.stock === "In Stock" 
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                        : "bg-rose-50 text-rose-500 border border-rose-100"
                    }`}>
                      {selectedSize?.stock}
                    </span>
                  </div>

                  <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
                    {product.description}
                  </p>

                  {/* Fragrance Notes Highlights */}
                  {(product.topNotes || product.baseNotes) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                      {product.topNotes && (
                        <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl">
                          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Top Notes</p>
                          <p className="text-xs font-semibold text-gray-800">{product.topNotes}</p>
                        </div>
                      )}
                      {product.baseNotes && (
                        <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-2xl">
                          <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mb-1">Base Notes</p>
                          <p className="text-xs font-semibold text-gray-800">{product.baseNotes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Size Selection */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Select Size</h3>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {product.sizes.map((item) => (
                          <button
                            key={item.size}
                            onClick={() => setSelectedSize(item)}
                            className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-300 border
                              ${selectedSize?.size === item.size
                                ? "bg-gray-900 text-white border-gray-900 shadow-md scale-[1.02]"
                                : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200"
                              }
                            `}
                          >
                            {item.size} — ₹{item.price?.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    {selectedSize?.stock === "In Stock" && (
                      <button
                        onClick={() => addToCart({ product, selectedSize })}
                        disabled={cartLoading}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-300 border
                          ${cartLoading 
                            ? "bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed" 
                            : "bg-white text-gray-900 border-gray-900 hover:bg-gray-50 hover:scale-[1.02] active:scale-95 shadow-sm"
                          }
                        `}
                      >
                        {cartLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-5 h-5" />
                            Add To Cart
                          </>
                        )}
                      </button>
                    )}

                    {selectedSize?.stock === "In Stock" && (
                      <button
                        onClick={handleBuyNow}
                        disabled={cartLoading}
                        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base bg-gray-900 text-white hover:bg-black transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20 hover:scale-[1.02] active:scale-95"
                      >
                        <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
                        Buy Now
                      </button>
                    )}
                  </div>
                  
                  {/* Trust Badges */}
                  <div className="grid grid-cols-2 gap-4 mt-8 border-t border-gray-100 pt-6">
                    <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span>100% Authentic Product</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <Truck className="w-5 h-5" />
                      </div>
                      <span>Free Express Shipping</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Product Specifications Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
            
            <div className="px-6 py-6 md:px-10 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
              <Info className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900">
                Detailed Product Information
              </h2>
            </div>

            <div className="p-6 md:p-10 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <tbody>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    <th className="py-4 px-4 font-bold text-gray-900 text-sm w-1/3 sm:w-1/4">Top Notes</th>
                    <td className="py-4 px-4 text-gray-700 text-sm">{product.topNotes || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    <th className="py-4 px-4 font-bold text-gray-900 text-sm">Base Notes</th>
                    <td className="py-4 px-4 text-gray-700 text-sm">{product.baseNotes || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    <th className="py-4 px-4 font-bold text-gray-900 text-sm">Imported By</th>
                    <td className="py-4 px-4 text-gray-700 text-sm">{product.importedBy || "N/A"}</td>
                  </tr>
                  <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
                    <th className="py-4 px-4 font-bold text-gray-900 text-sm">Country of Origin</th>
                    <td className="py-4 px-4 text-gray-700 text-sm">{product.origin || "N/A"}</td>
                  </tr>
                  <tr className="hover:bg-gray-50/60 transition-colors">
                    <th className="py-4 px-4 font-bold text-gray-900 text-sm">Manufacturer</th>
                    <td className="py-4 px-4 text-gray-700 text-sm">{product.manufacturer || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </Layout>
    </div>
  )
}

export default ProductDetails
