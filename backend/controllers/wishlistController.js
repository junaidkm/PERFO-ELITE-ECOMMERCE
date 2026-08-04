const Wishlist = require("../models/Wishlist");

const getWishlist = async (req, res) => {
  try {
    const wishlistDoc = await Wishlist.findOne({ userId: req.user.id }).lean();
    return res.json(wishlistDoc ? wishlistDoc.items : []);
  } catch (err) {
    console.error("Get wishlist error:", err);
    return res.status(500).json({ message: "Failed to fetch wishlist", error: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { productId, name, img, price } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const wishlistDoc = await Wishlist.findOneAndUpdate(
      { userId: req.user.id, "items.productId": { $ne: productId } },
      { $push: { items: { productId, name, img, price } } },
      { returnDocument: "after", upsert: true }
    ).lean();

    const finalWishlist = wishlistDoc || (await Wishlist.findOne({ userId: req.user.id }).lean());
    return res.json(finalWishlist ? finalWishlist.items : []);
  } catch (err) {
    console.error("Add to wishlist error:", err);
    return res.status(500).json({ message: "Failed to add item to wishlist", error: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { productId, name, img, price } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let wishlistDoc = await Wishlist.findOneAndUpdate(
      { userId: req.user.id, "items.productId": productId },
      { $pull: { items: { productId } } },
      { returnDocument: "after" }
    ).lean();

    let isAdded = false;

    if (wishlistDoc) {
      isAdded = false;
    } else {
      wishlistDoc = await Wishlist.findOneAndUpdate(
        { userId: req.user.id },
        { $push: { items: { productId, name, img, price } } },
        { returnDocument: "after", upsert: true }
      ).lean();
      isAdded = true;
    }

    return res.json({
      message: isAdded ? "Added to wishlist" : "Removed from wishlist",
      items: wishlistDoc ? wishlistDoc.items : [],
      isWishlisted: isAdded
    });
  } catch (err) {
    console.error("Toggle wishlist error:", err);
    return res.status(500).json({ message: "Failed to toggle wishlist item", error: err.message });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const items = req.body.wishlist || req.body.items;

    if (!items || typeof items !== "object" || typeof items.length !== "number") {
      return res.status(400).json({ message: "Wishlist must be an array" });
    }

    const wishlistDoc = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items } },
      { returnDocument: "after", upsert: true }
    ).lean();

    return res.json(wishlistDoc ? wishlistDoc.items : []);
  } catch (err) {
    console.error("Update wishlist error:", err);
    return res.status(500).json({ message: "Failed to update wishlist", error: err.message });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlistDoc = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { items: { $or: [{ _id: productId }, { productId: productId }] } } },
      { returnDocument: "after" }
    ).lean();

    return res.json(wishlistDoc ? wishlistDoc.items : []);
  } catch (err) {
    console.error("Remove from wishlist error:", err);
    return res.status(500).json({
      message: "Failed to remove item from wishlist",
      error: err.message
    });
  }
};

const clearWishlist = async (req, res) => {
  try {
    await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } },
      { returnDocument: "after" }
    ).lean();

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
