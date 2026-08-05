const Product = require("../models/Product");
const asyncHandler = require("../middleware/asyncHandler");

const parseSizes = (sizes) => {
  if (typeof sizes === "string") {
    try {
      return JSON.parse(sizes);
    } catch {
      return null;
    }
  }
  return sizes;
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getProducts = asyncHandler(async (req, res) => {
  const { search, category, sort, page, limit } = req.query;
  const query = {};

  if (search) {
    const sanitizedSearch = escapeRegex(search.trim());
    query.$or = [
      { name: { $regex: sanitizedSearch, $options: "i" } },
      { description: { $regex: sanitizedSearch, $options: "i" } }
    ];
  }

  if (category && category !== "all") {
    query.category = category;
  }

  const sortMap = { low: { "sizes.0.price": 1 }, high: { "sizes.0.price": -1 } };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  if (!page && !limit) {
    const products = await Product.find(query).sort(sortQuery).lean();
    return res.json(products);
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 8);
  const skip = (pageNum - 1) * limitNum;

  const [totalProducts, products, categories] = await Promise.all([
    Product.countDocuments(query),
    Product.find(query).sort(sortQuery).skip(skip).limit(limitNum).lean(),
    Product.distinct("category", { category: { $exists: true, $ne: null } })
  ]);

  const totalPages = Math.ceil(totalProducts / limitNum);
  const categoryList = ["all", ...categories];

  return res.json({
    products,
    totalPages,
    currentPage: pageNum,
    totalProducts,
    categories: categoryList
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

const createProduct = asyncHandler(async (req, res) => {
  const body = req.body || {};
  let { name, category, sizes, description, topNotes, baseNotes, importedBy, origin, manufacturer, img } = body;

  sizes = parseSizes(sizes);
  const imagePath = req.file ? `/uploads/${req.file.filename}` : img;

  if (!name || !category || !sizes || !Array.isArray(sizes) || sizes.length === 0) {
    return res.status(400).json({ message: "Name, category, and at least one size are required" });
  }

  if (!imagePath) {
    return res.status(400).json({ message: "Product image is required" });
  }

  const product = await Product.create({
    name,
    category,
    sizes,
    description,
    topNotes,
    baseNotes,
    importedBy,
    origin,
    manufacturer,
    img: imagePath
  });

  return res.status(201).json(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = { ...(req.body || {}) };

  if (req.file) {
    updateData.img = `/uploads/${req.file.filename}`;
  }

  if (updateData.sizes !== undefined) {
    const parsed = parseSizes(updateData.sizes);
    if (parsed === null) {
      delete updateData.sizes;
    } else {
      updateData.sizes = parsed;
    }
  }

  const product = await Product.findByIdAndUpdate(
    id,
    { $set: updateData },
    { returnDocument: "after", runValidators: true }
  ).lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndDelete(id).lean();

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  return res.json({ message: "Product deleted successfully", id });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};