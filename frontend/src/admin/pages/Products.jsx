import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { Package, Search, Plus, Edit2, Trash2, X, UploadCloud, Tag } from "lucide-react"

function Products() {
  const [products, setProducts] = useState([])
  const [view, setView] = useState("list")
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const [form, setForm] = useState({
    name: "",
    category: "",
    img: "",
    description: "",
    sizes: [
      { size: "70ml", price: "", stock: "In Stock" },
      { size: "100ml", price: "", stock: "In Stock" }
    ]
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/products") 
      setProducts(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editing) {
      await api.put(`/products/${editing.id}`, form)
    } else {
      await api.post("/products", { ...form, id: crypto.randomUUID() })
    }
    resetForm()
    fetchProducts()
    setView("list")
  }

  const handleEdit = (p) => {
    setForm(p)
    setEditing(p)
    setView("form")
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  const toggleStock = async (product, index) => {
    const updated = { ...product }
    updated.sizes[index].stock =
      updated.sizes[index].stock === "In Stock"
        ? "Out of Stock"
        : "In Stock"

    await api.put(`/products/${product.id}`, updated)
    fetchProducts()
  }

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      img: "",
      description: "",
      sizes: [
        { size: "70ml", price: "", stock: "In Stock" },
        { size: "100ml", price: "", stock: "In Stock" }
      ]
    })
    setEditing(null)
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const inputClass = "w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <Package className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Products</h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">Manage your fragrance catalog</p>
          </div>
        </div>

        {view === "list" ? (
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                resetForm()
                setView("form")
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
        ) : (
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {view === "form" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 sm:p-8 max-w-4xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-yellow-400/10 rounded-xl border border-yellow-400/20">
              <Edit2 className="w-5 h-5 text-yellow-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {editing ? "Edit Product" : "Add New Product"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    placeholder="Enter name"
                    className={`${inputClass} pl-10`}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Category</label>
                <input
                  placeholder="e.g. Men, Women, Unisex"
                  className={inputClass}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  placeholder="Fragrance notes, details..."
                  className={`${inputClass} resize-none h-32`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Image URL</label>
                <div className="relative">
                  <UploadCloud className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    placeholder="https://..."
                    className={`${inputClass} pl-10`}
                    value={form.img}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    required
                  />
                </div>
              </div>

              {form.img && (
                <div className="w-full h-48 bg-gray-900 border border-white/10 rounded-xl flex items-center justify-center p-4">
                  <img src={form.img} alt="Preview" className="max-h-full object-contain" onError={(e) => e.target.src = "https://via.placeholder.com/150"} />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 mb-8">
            <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-wider">Sizes & Pricing</h3>
            <div className="space-y-4">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex gap-4 p-4 bg-gray-900 border border-white/5 rounded-2xl items-center">
                  <div className="w-24 px-4 py-2 bg-white/5 rounded-xl text-center text-sm font-bold text-white">
                    {s.size}
                  </div>
                  
                  <div className="flex-1">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      className="w-full px-4 py-2 bg-gray-950 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-yellow-400 transition-all"
                      value={s.price}
                      onChange={(e) => {
                        const updated = [...form.sizes]
                        updated[i].price = e.target.value
                        setForm({ ...form, sizes: updated })
                      }}
                      required
                    />
                  </div>

                  <div className="flex-1">
                    <select
                      className="w-full px-4 py-2 bg-gray-950 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-400 transition-all appearance-none cursor-pointer"
                      value={s.stock}
                      onChange={(e) => {
                        const updated = [...form.sizes]
                        updated[i].stock = e.target.value
                        setForm({ ...form, sizes: updated })
                      }}
                    >
                      <option value="In Stock">In Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-white/5 pt-6">
            <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20">
              <CheckCircle2Icon className="w-5 h-5" />
              {editing ? "Save Changes" : "Create Product"}
            </button>
            <button type="button" onClick={() => setView("list")} className="px-6 py-3 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all">
              Cancel
            </button>
          </div>
        </form>
      )}

      {view === "list" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/10 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl">
              <Package className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-lg font-bold text-white">No products found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or add a new product.</p>
            </div>
          ) : (
            filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-colors flex flex-col group"
              >
                {/* Image */}
                <div className="h-48 bg-gray-900 flex items-center justify-center relative overflow-hidden p-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-50"></div>
                  <img
                    src={p.img}
                    className="max-h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                    alt={p.name}
                  />
                  <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
                    {p.category}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 line-clamp-1">{p.name}</h3>

                  <div className="space-y-2 mb-6 flex-1">
                    {p.sizes.map((s, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-gray-300 w-12">{s.size}</span>
                          <span className="text-sm font-black text-yellow-400">₹{s.price}</span>
                        </div>
                        <button
                          onClick={() => toggleStock(p, i)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            s.stock === "In Stock"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20"
                          }`}
                        >
                          {s.stock}
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(p)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 text-white font-semibold rounded-xl hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-400 font-semibold rounded-xl hover:bg-rose-500/20 border border-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}

function CheckCircle2Icon({ className }) {
  return <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
}

export default Products