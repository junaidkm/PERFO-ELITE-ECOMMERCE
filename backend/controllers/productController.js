const Product = require("../models/Product");

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

const getProducts = async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
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

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 8;
    const skip = (pageNum - 1) * limitNum;

    const [totalProducts, products, categories] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortQuery).skip(skip).limit(limitNum).lean(),
      Product.distinct("category", { category: { $exists: true, $ne: null } })
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    const categoryList = ["all"];
    for (let i = 0; i < categories.length; i++) {
      categoryList[i + 1] = categories[i];
    }

    return res.json({
      products,
      totalPages,
      currentPage: pageNum,
      totalProducts,
      categories: categoryList
    });
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json(product);
  } catch (err) {
    console.error("Get product by ID error:", err);
    return res.status(500).json({ message: "Failed to fetch product", error: err.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const body = req.body || {};
    let { name, category, sizes, description, topNotes, baseNotes, importedBy, origin, manufacturer, img } = body;

    sizes = parseSizes(sizes);

    const imagePath = req.file ? `/uploads/${req.file.filename}` : img;

    if (!name || !category || !sizes || typeof sizes !== "object" || typeof sizes.length !== "number" || sizes.length === 0) {
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
  } catch (err) {
    console.error("Create product error:", err);
    return res.status(500).json({ message: "Failed to create product", error: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
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
  } catch (err) {
    console.error("Update product error:", err);
    return res.status(500).json({ message: "Failed to update product", error: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.json({ message: "Product deleted successfully", id });
  } catch (err) {
    console.error("Delete product error:", err);
    return res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};