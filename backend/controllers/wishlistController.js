const Wishlist = require("../models/Wishlist");

// Helper to get or create wishlist document for user
const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = new Wishlist({ userId, items: [] });
    await wishlist.save();
  }
  return wishlist;
};

// @desc    Get user wishlist
// @route   GET /api/wishlist or GET /api/wishlist/:userId
// @access  Private
const getWishlist = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);
    return res.json(wishlistDoc.items || []);
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

// @desc    Add item to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId;
    const { productId, name, img, price } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);

    const exists = wishlistDoc.items.some(
      (item) => String(item.productId) === String(productId)
    );

    if (!exists) {
      wishlistDoc.items.push({ productId, name, img, price });
      await wishlistDoc.save();
    }

    return res.json(wishlistDoc.items);
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({ message: "Failed to add item to wishlist", error: err.message });
  }
};

// @desc    Toggle item in wishlist (add if missing, remove if present)
// @route   POST /api/wishlist/toggle
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId;
    const { productId, name, img, price } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);

    const index = wishlistDoc.items.findIndex(
      (item) => String(item.productId) === String(productId)
    );

    let isAdded = false;
    if (index > -1) {
      wishlistDoc.items.splice(index, 1);
    } else {
      wishlistDoc.items.push({ productId, name, img, price });
      isAdded = true;
    }

    await wishlistDoc.save();

    return res.json({
      message: isAdded ? "Added to wishlist" : "Removed from wishlist",
      items: wishlistDoc.items,
      isWishlisted: isAdded
    });
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    return res.status(500).json({ message: "Failed to toggle wishlist item", error: err.message });
  }
};

// @desc    Update whole wishlist items array
// @route   PUT /api/wishlist or PUT /api/wishlist/:userId
// @access  Private
const updateWishlist = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id) || req.body.userId;
    const items = req.body.wishlist || req.body.items;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Wishlist must be an array" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);
    wishlistDoc.items = items;
    await wishlistDoc.save();

    return res.json(wishlistDoc.items);
  } catch (err) {
    console.error("Update wishlist error:", err);
    return res.status(500).json({ message: "Failed to update wishlist", error: err.message });
  }
};

// @desc    Remove an item from wishlist
// @route   DELETE /api/wishlist/:productId
// @access  Private
const removeFromWishlist = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.query.userId || req.body.userId;
    const { productId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);
    wishlistDoc.items = wishlistDoc.items.filter(
      (item) => String(item.productId) !== String(productId) && String(item.id) !== String(productId) && String(item._id) !== String(productId)
    );
    await wishlistDoc.save();

    return res.json(wishlistDoc.items);
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({ message: "Failed to remove item from wishlist", error: err.message });
  }
};

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);
    wishlistDoc.items = [];
    await wishlistDoc.save();

    return res.json({ message: "Wishlist cleared successfully", items: [] });
  } catch (err) {
    console.error("Clear wishlist error:", err);
    return res.status(500).json({ message: "Failed to clear wishlist", error: err.message });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  updateWishlist,
  removeFromWishlist,
  clearWishlist
};
