import React, { useEffect, useState } from "react"
import { api } from "../../services/api"
import { getImageUrl } from "../../utils/imageUtils"
import { Package, Search, Plus, Edit2, Trash2, X, UploadCloud, Tag, CheckCircle2, Image as ImageIcon } from "lucide-react"
import { toast } from "react-toastify"

function Products() {
  const [products, setProducts] = useState([])
  const [view, setView] = useState("list")
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState("")

  const [form, setForm] = useState({
    name: "",
    category: "",
    img: "",
    description: "",
    topNotes: "",
    baseNotes: "",
    sizes: [
      { size: "50ml", price: "", stock: "In Stock" },
      { size: "100ml", price: "", stock: "In Stock" }
    ]
  })

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data } = await api.get("/products")
      const list = Array.isArray(data) ? data : data?.products || []
      setProducts(list)
    } catch (err) {
      console.error("Fetch products error:", err)
      toast.error("Failed to load products ❌")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const targetId = editing ? (editing.id || editing._id) : null

      const formData = new FormData()
      formData.append("name", form.name)
      formData.append("category", form.category)
      formData.append("description", form.description)
      formData.append("topNotes", form.topNotes || "")
      formData.append("baseNotes", form.baseNotes || "")
      formData.append("sizes", JSON.stringify(form.sizes))

      if (imageFile) {
        formData.append("image", imageFile)
      } else if (form.img) {
        formData.append("img", form.img)
      }

      if (editing && targetId) {
        await api.put(`/products/${targetId}`, formData)
        toast.success("Product updated successfully ✨")
      } else {
        await api.post("/products", formData)
        toast.success("Product created successfully 🚀")
      }

      resetForm()
      fetchProducts()
      setView("list")
    } catch (err) {
      console.error("Save product error:", err)
      toast.error(err.response?.data?.message || "Failed to save product ❌")
    }
  }

  const handleEdit = (p) => {
    setForm({
      name: p.name || "",
      category: p.category || "",
      img: p.img || "",
      description: p.description || "",
      topNotes: p.topNotes || "",
      baseNotes: p.baseNotes || "",
      sizes: p.sizes || [
        { size: "50ml", price: "", stock: "In Stock" },
        { size: "100ml", price: "", stock: "In Stock" }
      ]
    })
    setImageFile(null)
    setImagePreview(p.img || "")
    setEditing(p)
    setView("form")
  }

  const handleDelete = async (id) => {
    if (!id) return
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      await api.delete(`/products/${id}`)
      toast.info("Product deleted 🗑️")
      fetchProducts()
    } catch (err) {
      console.error("Delete product error:", err)
      toast.error("Failed to delete product ❌")
    }
  }

  const toggleStock = async (product, index) => {
    const targetId = product.id || product._id
    if (!targetId) return

    const updatedSizes = [...product.sizes]
    updatedSizes[index] = {
      ...updatedSizes[index],
      stock: updatedSizes[index].stock === "In Stock" ? "Out of Stock" : "In Stock"
    }

    try {
      await api.put(`/products/${targetId}`, { ...product, sizes: updatedSizes })
      toast.success("Stock status updated")
      fetchProducts()
    } catch (err) {
      console.error("Update stock error:", err)
      toast.error("Failed to update stock status")
    }
  }

  const resetForm = () => {
    setForm({
      name: "",
      category: "",
      img: "",
      description: "",
      topNotes: "",
      baseNotes: "",
      sizes: [
        { size: "50ml", price: "", stock: "In Stock" },
        { size: "100ml", price: "", stock: "In Stock" }
      ]
    })
    setImageFile(null)
    setImagePreview("")
    setEditing(null)
  }

  const filteredProducts = products.filter((p) =>
    (p.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.category || "").toLowerCase().includes(search.toLowerCase())
  )

  const inputClass = "w-full px-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
            <Package className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Products Management</h2>
            <p className="text-gray-400 text-sm mt-1 font-medium">Add, edit, and delete products in your luxury catalog</p>
          </div>
        </div>

        {view === "list" ? (
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              onClick={() => {
                resetForm()
                setView("form")
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-400/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        ) : (
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 border border-white/10 transition-all"
          >
            <X className="w-4 h-4" />
            Back to List
          </button>
        )}
      </div>

      {/* Form View */}
      {view === "form" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-3xl p-6 sm:p-8 max-w-4xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-400/10 rounded-xl border border-amber-400/20">
              <Edit2 className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {editing ? "Edit Product Details" : "Add New Fragrance Product"}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Product Name</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    placeholder="e.g. Oud Royale EDP"
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
                  placeholder="Fragrance notes, luxury story..."
                  className={`${inputClass} resize-none h-28`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Top Notes</label>
                  <input
                    placeholder="e.g. Bergamot, Saffron"
                    className={inputClass}
                    value={form.topNotes}
                    onChange={(e) => setForm({ ...form, topNotes: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Base Notes</label>
                  <input
                    placeholder="e.g. Amber, Vanilla, Oud"
                    className={inputClass}
                    value={form.baseNotes}
                    onChange={(e) => setForm({ ...form, baseNotes: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Product Image</label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="product-image-upload"
                    className="hidden"
                    required={!editing && !imagePreview}
                  />
                  <label
                    htmlFor="product-image-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-3 bg-gray-900 border border-dashed border-amber-400/40 hover:border-amber-400 rounded-xl text-amber-400 cursor-pointer font-bold text-sm transition-all"
                  >
                    <UploadCloud className="w-5 h-5" />
                    {imageFile ? imageFile.name : "Choose Image File"}
                  </label>
                </div>
              </div>

              {imagePreview ? (
                <div className="w-full h-56 bg-gray-950 border border-white/10 rounded-2xl flex items-center justify-center p-4 overflow-hidden relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-full object-contain drop-shadow-xl"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300?text=Image+Load+Error"
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-56 bg-gray-950 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-4 text-gray-500">
                  <ImageIcon className="w-8 h-8 mb-2 text-gray-600" />
                  <span className="text-xs">Selected Image Preview</span>
                </div>
              )}
            </div>
          </div>

          {/* Sizes & Pricing */}
          <div className="border-t border-white/5 pt-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Sizes & Pricing Variants</h3>
              <button
                type="button"
                onClick={() => setForm({
                  ...form,
                  sizes: [...form.sizes, { size: "100ml", price: "", stock: "In Stock" }]
                })}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Size Variant
              </button>
            </div>
            <div className="space-y-4">
              {form.sizes.map((s, i) => (
                <div key={i} className="flex flex-wrap sm:flex-nowrap gap-4 p-4 bg-gray-950 border border-white/5 rounded-2xl items-center">
                  <input
                    type="text"
                    placeholder="Size (e.g. 50ml)"
                    className="w-28 px-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-amber-400"
                    value={s.size}
                    onChange={(e) => {
                      const updated = [...form.sizes]
                      updated[i].size = e.target.value
                      setForm({ ...form, sizes: updated })
                    }}
                    required
                  />

                  <div className="flex-1 min-w-[120px]">
                    <input
                      type="number"
                      placeholder="Price (₹)"
                      className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-400"
                      value={s.price}
                      onChange={(e) => {
                        const updated = [...form.sizes]
                        updated[i].price = e.target.value
                        setForm({ ...form, sizes: updated })
                      }}
                      required
                    />
                  </div>

                  <div className="w-36">
                    <select
                      className="w-full px-4 py-2 bg-gray-900 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-amber-400 appearance-none cursor-pointer"
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

                  {form.sizes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const updated = form.sizes.filter((_, idx) => idx !== i)
                        setForm({ ...form, sizes: updated })
                      }}
                      className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Remove size"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-white/5 pt-6">
            <button
              type="submit"
              className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 text-gray-950 font-bold text-sm rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-400/20 active:scale-95"
            >
              <CheckCircle2 className="w-5 h-5" />
              {editing ? "Save Product Changes" : "Create Product Document"}
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className="px-6 py-3.5 bg-white/5 text-white font-bold text-sm rounded-xl hover:bg-white/10 border border-white/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* List View */}
      {view === "list" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-white/10 border-t-amber-400 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-medium text-sm">Loading products catalog...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl text-center p-6">
              <Package className="w-16 h-16 text-gray-600 mb-4" />
              <p className="text-lg font-bold text-white mb-1">No products found</p>
              <p className="text-sm text-gray-400 max-w-sm mb-6">Try adjusting your search query or add a new fragrance product.</p>
              <button
                onClick={() => {
                  resetForm()
                  setView("form")
                }}
                className="px-6 py-2.5 bg-amber-400 text-gray-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-all"
              >
                Add Product
              </button>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const productId = p.id || p._id

              return (
                <div
                  key={productId}
                  className="bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden shadow-xl hover:border-white/10 transition-colors flex flex-col group"
                >
                  {/* Image */}
                  <div className="h-52 bg-gray-950 flex items-center justify-center relative overflow-hidden p-4">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60"></div>
                    <img
                      src={getImageUrl(p.img)}
                      className="max-h-full object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 drop-shadow-2xl"
                      alt={p.name}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/300?text=No+Image"
                      }}
                    />
                    <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-wider text-white border border-white/10 uppercase">
                      {p.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-3 line-clamp-1">{p.name}</h3>

                    <div className="space-y-2 mb-6 flex-1">
                      {p.sizes?.map((s, i) => (
                        <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl p-2.5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-300 w-12">{s.size}</span>
                            <span className="text-xs font-black text-amber-400">₹{Number(s.price).toLocaleString()}</span>
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
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 text-white font-semibold text-xs rounded-xl hover:bg-white/10 border border-white/10 transition-all active:scale-95"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(productId)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-500/10 text-rose-400 font-semibold text-xs rounded-xl hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </div>
  )
}

export default Products