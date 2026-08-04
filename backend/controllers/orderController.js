const Order = require("../models/Order");

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (err) {
    console.error("Get orders error:", err);
    return res.status(500).json({ message: "Failed to fetch orders", error: err.message });
  }
};

const getAllAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();
    return res.json(orders);
  } catch (err) {
    console.error("Get all admin orders error:", err);
    return res.status(500).json({ message: "Failed to fetch all orders", error: err.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const { items, total, address, paymentMethod } = req.body;

    if (!items || typeof items !== "object" || typeof items.length !== "number" || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }
    if (!address || !address.name || !address.phone || !address.city || !address.pincode || !address.addressLine) {
      return res.status(400).json({ message: "Shipping address is incomplete" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    const newOrder = await Order.create({
      userId: req.user.id,
      items,
      total,
      address,
      paymentMethod
    });

    return res.status(201).json(newOrder);
  } catch (err) {
    console.error("Create order error:", err);
    return res.status(500).json({ message: "Failed to place order", error: err.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: req.user.id, status: { $ne: "Cancelled" } },
      { $set: { status: "Cancelled" } },
      { returnDocument: "after" }
    ).lean();

    if (!order) {
      const existingOrder = await Order.findOne({ _id: orderId, userId: req.user.id }).lean();
      if (existingOrder) {
        return res.status(400).json({ message: "Order is already cancelled" });
      }
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order cancelled successfully", order });
  } catch (err) {
    console.error("Cancel order error:", err);
    return res.status(500).json({ message: "Failed to cancel order", error: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { returnDocument: "after", runValidators: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (err) {
    console.error("Update order status error:", err);
    return res.status(500).json({ message: "Failed to update order status", error: err.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ message: "Order deleted successfully", id: orderId });
  } catch (err) {
    console.error("Delete order error:", err);
    return res.status(500).json({ message: "Failed to delete order", error: err.message });
  }
};

module.exports = {
  getOrders,
  getAllAdminOrders,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  deleteOrder
};
