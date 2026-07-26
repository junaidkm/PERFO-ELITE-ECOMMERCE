import React, { useEffect, useState, useMemo } from "react"
import Layout from "../components/Layout"
import ProductCard from "../components/ProductCard"
import { api } from "../services/api"
import { Search, SlidersHorizontal, ChevronDown, Sparkles, X, RotateCcw } from "lucide-react"

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState("")
  const [inputSearch, setInputSearch] = useState("")
  const [category, setCategory] = useState("all")
  const [sort, setSort] = useState("default")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [categories, setCategories] = useState(["all"])

  // Debounce search input to avoid redundant API queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(inputSearch)
    }, 400)
    return () => clearTimeout(timer)
  }, [inputSearch])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1)
  }, [search, category, sort])

  // Fetch paginated, sorted, and filtered products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const res = await api.get("/products", {
          params: {
            search,
            category,
            sort,
            page,
            limit: 8
          }
        })
        setProducts(res.data.products || [])
        setTotalPages(res.data.totalPages || 1)
        setTotalProducts(res.data.totalProducts || 0)
        if (res.data.categories) {
          setCategories(res.data.categories)
        }
      } catch (err) {
        console.error("Error fetching products:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [search, category, sort, page])

  const clearFilters = () => {
    setInputSearch("")
    setSearch("")
    setCategory("all")
    setSort("default")
    setPage(1)
  }

  const isFiltered = inputSearch !== "" || category !== "all" || sort !== "default"

  // Compute pagination number array dynamically with ellipse (...) spacer
  const getPageNumbers = () => {
    const pages = []
    const range = 2
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= page - range && i <= page + range)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...")
      }
    }
    return pages
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar Filters */}
            <div className="w-full lg:w-[260px] flex-shrink-0">
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sticky top-24">
                
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-500" />
                    <h2 className="font-extrabold text-gray-900">Filters</h2>
                  </div>
                  {isFiltered && (
                    <button
                      onClick={clearFilters}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                    Categories
                  </h3>
                  <div className="space-y-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setCategory(cat); setPage(1); }}
                        className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                          category === cat
                            ? "bg-gray-900 text-white shadow-md"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                        }`}
                      >
                        {cat === "all" ? "All Fragrances" : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Filter */}
                <div>
                  <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-wider mb-3">
                    Sort By Price
                  </h3>
                  <div className="relative">
                    <select
                      value={sort}
                      onChange={(e) => { setSort(e.target.value); setPage(1); }}
                      className="w-full appearance-none px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="default">Featured</option>
                      <option value="low">Price: Low to High</option>
                      <option value="high">Price: High to Low</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">

              {/* Header + Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                    {category === "all" ? "All Fragrances" : category}
                    <Sparkles className="w-6 h-6 text-amber-500 hidden sm:inline-block" />
                  </h1>
                  <p className="text-gray-500 mt-1 text-sm">
                    {loading ? "Loading collection..." : `${totalProducts} ${totalProducts === 1 ? "product" : "products"} available`}
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search luxury perfumes..."
                    value={inputSearch}
                    onChange={(e) => setInputSearch(e.target.value)}
                    className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm"
                  />
                  {inputSearch && (
                    <button
                      onClick={() => setInputSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 font-medium">Loading luxury collection...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm text-center px-4">
                  <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                  </div>
                  <p className="text-xl text-gray-800 font-bold mb-1">No perfumes found</p>
                  <p className="text-sm text-gray-400 mb-6 max-w-sm">
                    We couldn't find any products matching "{inputSearch || category}". Try resetting your filters.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all hover:scale-105"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 animate-scaleIn">
                    {products.map((item) => (
                      <ProductCard key={item.id || item._id} item={item} />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="mt-12 flex flex-wrap justify-center items-center gap-3">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        className="px-4.5 py-2.5 text-sm font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
                      >
                        Previous
                      </button>

                      <div className="flex items-center gap-1.5">
                        {getPageNumbers().map((p, idx) =>
                          p === "..." ? (
                            <span key={`dots-${idx}`} className="w-10 text-center text-gray-400 font-bold">
                              ...
                            </span>
                          ) : (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all duration-300 ${
                                page === p
                                  ? "bg-gray-900 text-white shadow-md scale-105"
                                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-150 active:scale-95 shadow-sm"
                              }`}
                            >
                              {p}
                            </button>
                          )
                        )}
                      </div>

                      <button
                        disabled={page === totalPages}
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        className="px-4.5 py-2.5 text-sm font-bold border border-gray-200 rounded-xl bg-white text-gray-700 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-700 disabled:cursor-not-allowed transition-all duration-300 shadow-sm active:scale-95"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}

            </div>
          </div>

        </div>
      </Layout>
    </div>
  )
}

export default Products;