const Wishlist = require("../models/Wishlist");
const asyncHandler = require("../middleware/asyncHandler");

const getWishlist = asyncHandler(async (req, res) => {
  const wishlistDoc = await Wishlist.findOne({ userId: req.user.id }).lean();
  return res.json(wishlistDoc ? wishlistDoc.items : []);
});

const addToWishlist = asyncHandler(async (req, res) => {
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
});

const toggleWishlist = asyncHandler(async (req, res) => {
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

  if (!wishlistDoc) {
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
});

const updateWishlist = asyncHandler(async (req, res) => {
  const items = req.body.wishlist || req.body.items;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "Wishlist must be an array" });
  }

  const wishlistDoc = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { items } },
    { returnDocument: "after", upsert: true }
  ).lean();

  return res.json(wishlistDoc ? wishlistDoc.items : []);
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlistDoc = await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $pull: { items: { $or: [{ _id: productId }, { productId }] } } },
    { returnDocument: "after" }
  ).lean();

  return res.json(wishlistDoc ? wishlistDoc.items : []);
});

const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndUpdate(
    { userId: req.user.id },
    { $set: { items: [] } },
    { returnDocument: "after" }
  ).lean();

  return res.json({ message: "Wishlist cleared successfully", items: [] });
});

module.exports = {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  updateWishlist,
  removeFromWishlist,
  clearWishlist
};
