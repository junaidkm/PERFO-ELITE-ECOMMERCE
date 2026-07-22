const Product = require("../models/Product");

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    return res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    return res.status(500).json({ message: "Failed to fetch products", error: err.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
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

module.exports = {
  getProducts,
  getProductById
};