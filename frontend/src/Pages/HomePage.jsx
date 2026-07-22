import React, { useEffect, useState, useMemo } from "react"
import { api } from "../services/api"
import { useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import ProductCard from "../components/ProductCard"
import { ChevronRight, Sparkles } from "lucide-react"

const BANNERS = [
  {
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f",
    title: "Luxury Perfumes",
    subtitle: "Feel the essence of elegance",
  },
  {
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1600&auto=format&fit=crop",
    title: "Exclusive Collection",
    subtitle: "Crafted for every personality",
  },
  {
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad",
    title: "Budget Friendly",
    subtitle: "Luxury within your reach",
  },
]

const CATEGORIES = ["New", "Men", "Women", "Luxury", "Budget"]

function HomePage() {
  const [products, setProducts] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [activeCategory, setActiveCategory] = useState("New")
  const navigate = useNavigate()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % BANNERS.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const getProducts = async () => {
      try {
        const { data } = await api.get("/products")
        setProducts(data)
      } catch (err) {
        console.error(err)
      }
    }
    getProducts()
  }, [])

  const filteredProducts = useMemo(() => {
    if (activeCategory === "New") {
      return [...products].slice(-6).reverse()
    }
    return products.filter(p => p.category === activeCategory)
  }, [products, activeCategory])

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative w-full h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden rounded-b-[2rem] sm:rounded-b-[3rem] shadow-2xl">
        {BANNERS.map((banner, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="w-full h-full object-cover transform scale-105 transition-transform duration-[10000ms] ease-linear"
              style={{ transform: index === currentSlide ? "scale(1.1)" : "scale(1)" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
          </div>
        ))}

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium tracking-wide mb-6 animate-fade-in-down">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            Premium Collection
          </span>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 drop-shadow-lg">
            {BANNERS[currentSlide]?.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-200 font-light max-w-2xl drop-shadow-md">
            {BANNERS[currentSlide]?.subtitle}
          </p>
          <button
            onClick={() => navigate("/products")}
            className="mt-8 group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-gray-900 font-bold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
          >
            <span className="absolute inset-0 bg-yellow-400 transition-transform duration-300 origin-left transform scale-x-0 group-hover:scale-x-100"></span>
            <span className="relative z-10">Explore Now</span>
            <ChevronRight className="w-5 h-5 relative z-10 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                idx === currentSlide ? "bg-yellow-400 w-8" : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Category Filters */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
            Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-700">Collections</span>
          </h2>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 p-2 bg-gray-50/80 backdrop-blur-sm rounded-3xl border border-gray-100 shadow-sm">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-6 py-2.5 rounded-full text-sm sm:text-base font-semibold transition-all duration-300 ease-out overflow-hidden
                  ${activeCategory === cat
                    ? "text-white shadow-md transform scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                  }
                `}
              >
                {activeCategory === cat && (
                  <span className="absolute inset-0 bg-gray-900 rounded-full -z-10"></span>
                )}
                <span className="relative z-10">{cat === "New" ? "New Arrivals" : cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {activeCategory === "New" ? "Latest Arrivals" : `${activeCategory} Collection`}
            </h3>
            <p className="text-gray-500 mt-1">Showing {filteredProducts.length} premium products</p>
          </div>
          <button 
            onClick={() => navigate("/products")}
            className="hidden sm:flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-lg text-gray-500 font-medium">No products found in this category</p>
            <button 
              onClick={() => setActiveCategory("New")}
              className="mt-4 text-yellow-600 font-semibold hover:text-yellow-700 transition-colors"
            >
              Browse New Arrivals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((item, index) => (
              <div
                key={item.id}
                className="opacity-0 animate-[fadeInUp_0.5s_ease-out_forwards]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ProductCard item={item} />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 sm:hidden flex justify-center">
          <button 
            onClick={() => navigate("/products")}
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-900 text-gray-900 font-bold rounded-full hover:bg-gray-900 hover:text-white transition-colors"
          >
            View All Products
          </button>
        </div>

      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.6s ease-out forwards;
        }
      `}</style>
    </Layout>
  )
}

export default HomePage