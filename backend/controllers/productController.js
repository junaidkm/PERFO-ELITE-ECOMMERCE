const Product = require("../models/Product");

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
      const products = await Product.find(query).sort(sortQuery);
      return res.json(products);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 8;
    const skip = (pageNum - 1) * limitNum;

    const [totalProducts, products, categories] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query).sort(sortQuery).skip(skip).limit(limitNum),
      Product.distinct("category", { category: { $exists: true, $ne: null } })
    ]);

    const totalPages = Math.ceil(totalProducts / limitNum);

    return res.json({
      products,
      totalPages,
      currentPage: pageNum,
      totalProducts,
      categories: ["all", ...categories]
    });
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

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
    const { name, category, sizes, description, topNotes, baseNotes, importedBy, origin, manufacturer, img } = req.body;

    if (!name || !category || !sizes || !Array.isArray(sizes) || sizes.length === 0) {
      return res.status(400).json({ message: "Name, category, and at least one size are required" });
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
      img
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

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true }
    );

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
    const product = await Product.findByIdAndDelete(id);

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