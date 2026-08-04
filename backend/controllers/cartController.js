const Cart = require("../models/Cart");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.productId");
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

    const cart = await getOrCreateCart(userId);
    const existingItem = cart.items.find(
      (item) => String(item.productId) === String(productId) && item.size === size
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ productId, size, quantity: Number(quantity) });
    }

    await cart.save();
    await cart.populate("items.productId");
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
    
    const cartDoc = await getOrCreateCart(userId);
    cartDoc.items = cart.map((item) => ({
      productId: item.productId || item.id,
      size: item.size,
      quantity: item.quantity
    }));

    await cartDoc.save();
    await cartDoc.populate("items.productId");
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

    const cartDoc = await getOrCreateCart(userId);
    cartDoc.items.pull({ _id: itemId });
    await cartDoc.save();
    await cartDoc.populate("items.productId");

    return res.json(cartDoc);
  } catch (err) {
    console.error("Remove from cart error:", err);
    return res.status(500).json({ message: "Failed to remove item from cart", error: err.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartDoc = await getOrCreateCart(userId);
    cartDoc.items = [];
    await cartDoc.save();

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
