const Cart = require("../models/Cart");

// Helper function to find or create cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [] });
    await cart.save();
  }
  return cart;
};

// @desc    Get user cart items
// @route   GET /api/cart or GET /api/cart/:userId
// @access  Private
const getCart = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cart = await getOrCreateCart(userId);
    return res.json(cart.items || []);
  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ message: "Failed to fetch cart", error: err.message });
  }
};

// @desc    Add item to cart collection
// @route   POST /api/cart
// @access  Private
const addToCart = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId;
    const { productId, name, img, price, size, quantity = 1 } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!productId || !size) {
      return res.status(400).json({ message: "Product ID and size are required" });
    }

    const cart = await getOrCreateCart(userId);
    const existingIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.size === size
    );

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += Number(quantity);
    } else {
      cart.items.push({
        productId,
        name,
        img,
        price,
        size,
        quantity: Number(quantity)
      });
    }

    await cart.save();
    return res.status(200).json(cart.items);
  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ message: "Failed to add to cart", error: err.message });
  }
};

// @desc    Update whole cart items array in Cart collection
// @route   PUT /api/cart or PUT /api/cart/:userId
// @access  Private
const updateCart = async (req, res) => {
  try {
    const userId = req.params.userId || (req.user && req.user.id) || req.body.userId;
    const { cart } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: "Cart must be an array of items" });
    }

    const cartDoc = await getOrCreateCart(userId);
    cartDoc.items = cart;
    await cartDoc.save();

    return res.json(cartDoc.items);
  } catch (err) {
    console.error("Update cart error:", err);
    return res.status(500).json({ message: "Failed to update cart", error: err.message });
  }
};

// @desc    Remove an item from cart in Cart collection
// @route   DELETE /api/cart/:itemId
// @access  Private
const removeFromCart = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.query.userId || req.body.userId;
    const { itemId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const cartDoc = await getOrCreateCart(userId);
    cartDoc.items = cartDoc.items.filter(
      (item) => item.id !== itemId && item._id !== itemId && item.productId !== itemId
    );
    await cartDoc.save();

    return res.json(cartDoc.items);
  } catch (err) {
    console.error("Remove from cart error:", err);
    return res.status(500).json({ message: "Failed to remove item from cart", error: err.message });
  }
};

// @desc    Clear user cart in Cart collection
// @route   DELETE /api/cart
// @access  Private
const clearCart = async (req, res) => {
  try {
    const userId = (req.user && req.user.id) || req.body.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

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
