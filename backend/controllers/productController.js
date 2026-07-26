const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    if (category && category !== "all") {
      query.category = category;
    }

    let sortQuery = {};
    if (sort === "low") {
      sortQuery = { "sizes.0.price": 1 };
    } else if (sort === "high") {
      sortQuery = { "sizes.0.price": -1 };
    } else {
      sortQuery = { createdAt: -1 };
    }

    if (!page && !limit) {
      const products = await Product.find(query).sort(sortQuery);
      return res.json(products);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 8;
    const skip = (pageNum - 1) * limitNum;

    const totalProducts = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    const categories = await Product.distinct("category");
    const totalPages = Math.ceil(totalProducts / limitNum);

    return res.json({
      products,
      totalPages,
      currentPage: pageNum,
      totalProducts,
      categories: ["all", ...categories.filter(Boolean)]
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

module.exports = {
  getProducts,
  getProductById
};