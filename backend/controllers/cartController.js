const Cart = require("../models/Cart");

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId").lean();
    return res.json(cart || { userId: req.user.id, items: [] });
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, size, quantity = 1 } = req.body;

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    let cart = await Cart.findOneAndUpdate(
      { userId, "items.productId": productId, "items.size": size },
      { $inc: { "items.$.quantity": Number(quantity) } },
      { returnDocument: "after", runValidators: true }
    ).populate("items.productId").lean();

    if (!cart) {
      cart = await Cart.findOneAndUpdate(
        { userId },
        { $push: { items: { productId, size, quantity: Number(quantity) } } },
        { returnDocument: "after", upsert: true, runValidators: true }
      ).populate("items.productId").lean();
    }

    return res.status(200).json(cart);
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
};

const updateCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cart } = req.body;

    const formattedItems = [];
    if (cart && typeof cart === "object" && typeof cart.length === "number") {
      for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        formattedItems[i] = {
          productId: item.productId || item.id,
          size: item.size,
          quantity: item.quantity
        };
      }
    }

    const cartDoc = await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: formattedItems } },
      { returnDocument: "after", upsert: true, runValidators: true }
    ).populate("items.productId").lean();

    return res.json(cartDoc);
  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({ message: "Failed to update cart", error: err.message });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cartDoc = await Cart.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { returnDocument: "after" }
    ).populate("items.productId").lean();

    return res.json(cartDoc || { userId, items: [] });
  } catch (err) {
    console.error("Remove from cart error:", err);
    return res.status(500).json({ message: "Failed to remove item from cart", error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await Cart.findOneAndUpdate(
      { userId },
      { $set: { items: [] } },
      { returnDocument: "after" }
    ).lean();

    return res.json({ message: "Cart cleared successfully", items: [] });
  } catch (err) {
    console.error("Clear cart error:", err);
    return res.status(500).json({ message: "Failed to clear cart", error: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
};
