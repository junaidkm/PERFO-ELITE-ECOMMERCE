const Order = require("../models/Order");
const User = require("../models/User");

// @desc    Get orders (user's own orders, or all orders if admin)
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let orders;
    if (req.user.role === "admin") {
      orders = await Order.find().populate("userId", "name");
    } else {
      orders = await Order.find({ userId: req.user.id });
    }

    // Format orders for frontend compatibility (e.g. inject userName for admin panel)
    const formattedOrders = orders.map((order) => {
      const orderObj = order.toJSON();
      if (req.user.role === "admin" && order.userId && typeof order.userId === "object") {
        orderObj.userId = order.userId.id || order.userId._id;
        orderObj.userName = order.userId.name;
      }
      return orderObj;
    });

    return res.json(formattedOrders);
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

// @desc    Create a new order for the logged-in user
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }
    if (!address || !address.name || !address.phone || !address.city || !address.pincode || !address.addressLine) {
      return res.status(400).json({ message: "Shipping address is incomplete" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const newOrder = new Order({
      userId: req.user.id,
      items,
      total,
      address,
      paymentMethod
    });

    await newOrder.save();

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

// @desc    Cancel an order
// @route   PUT /api/orders/:orderId/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const query = req.user.role === "admin" ? { _id: orderId } : { _id: orderId, userId: req.user.id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "Cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    order.status = "Cancelled";
    await order.save();

    return res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    return res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};

module.exports = {
  getOrders,
  createOrder,
  cancelOrder
};
