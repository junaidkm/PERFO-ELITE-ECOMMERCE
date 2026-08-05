const Cart = require("../models/Cart");
const asyncHandler = require("../middleware/asyncHandler");

const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const cart = await Cart.findOne({ userId }).populate("items.productId").lean();
  return res.json(cart || { userId, items: [] });
});

const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, size, quantity = 1 } = req.body;

  if (!productId || !size) {
    return res.status(400).json({ message: "Product ID and size are required" });
  }

  const numQty = Number(quantity) || 1;

  let cart = await Cart.findOneAndUpdate(
    { userId, "items.productId": productId, "items.size": size },
    { $inc: { "items.$.quantity": numQty } },
    { returnDocument: "after", runValidators: true }
  ).populate("items.productId").lean();

  if (!cart) {
    cart = await Cart.findOneAndUpdate(
      { userId },
      { $push: { items: { productId, size, quantity: numQty } } },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).populate("items.productId").lean();
  }

  return res.status(200).json(cart);
});

const updateCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body;

  let formattedItems = [];
  if (Array.isArray(cart)) {
    formattedItems = cart.map((item) => ({
      productId: item.productId || item.id,
      size: item.size,
      quantity: Number(item.quantity) || 1
    }));
  }

  const cartDoc = await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: formattedItems } },
    { returnDocument: "after", upsert: true, runValidators: true }
  ).populate("items.productId").lean();

  return res.json(cartDoc);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { itemId } = req.params;

  const cartDoc = await Cart.findOneAndUpdate(
    { userId },
    { $pull: { items: { _id: itemId } } },
    { returnDocument: "after" }
  ).populate("items.productId").lean();

  return res.json(cartDoc || { userId, items: [] });
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  await Cart.findOneAndUpdate(
    { userId },
    { $set: { items: [] } },
    { returnDocument: "after" }
  ).lean();

  return res.json({ message: "Cart cleared successfully", items: [] });
});

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
};
