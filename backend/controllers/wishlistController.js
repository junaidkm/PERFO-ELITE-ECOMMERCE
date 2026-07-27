const Wishlist = require("../models/Wishlist");

const getOrCreateWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ userId });
  if (!wishlist) {
    wishlist = new Wishlist({ userId, items: [] });
    await wishlist.save();
  }
  return wishlist;
};

const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const wishlistDoc = await getOrCreateWishlist(userId);
    return res.json(wishlistDoc.items || []);
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, img, price } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);

    const exists = wishlistDoc.items.some(
      (item) => String(item.productId) === String(productId)
    );

    if (!exists) {
      // Mongoose DocumentArray push subdocument method
      wishlistDoc.items.push({ productId, name, img, price });
      await wishlistDoc.save();
    }

    return res.json(wishlistDoc.items);
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({ message: "Failed to add item to wishlist", error: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, name, img, price } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlistDoc = await getOrCreateWishlist(userId);

    const existingItem = wishlistDoc.items.find(
      (item) => String(item.productId) === String(productId)
    );

    let isAdded = false;
    if (existingItem) {
      // Mongoose DocumentArray pull subdocument method
      wishlistDoc.items.pull(existingItem._id);
    } else {
      // Mongoose DocumentArray push subdocument method
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

const updateWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const items = req.body.wishlist || req.body.items;

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

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const wishlistDoc = await getOrCreateWishlist(userId);
    
    const matchingItem = wishlistDoc.items.find(
      (item) => String(item.productId) === String(productId) || String(item._id) === String(productId)
    );

    if (matchingItem) {
      // Mongoose DocumentArray pull subdocument method
      wishlistDoc.items.pull(matchingItem._id);
    } else {
      wishlistDoc.items.pull({ productId });
    }

    await wishlistDoc.save();

    return res.json(wishlistDoc.items);
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({ message: "Failed to remove item from wishlist", error: err.message });
  }
};

const clearWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

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
