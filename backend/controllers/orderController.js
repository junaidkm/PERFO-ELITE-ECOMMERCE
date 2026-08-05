const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
  const formattedOrders = orders.map(o => ({ ...o, id: o._id.toString() }));
  return res.json(formattedOrders);
});

const getAllAdminOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();
  const formattedOrders = orders.map(o => ({ ...o, id: o._id.toString() }));
  return res.json(formattedOrders);
});

const createOrder = asyncHandler(async (req, res) => {
  const { items, total, address, paymentMethod } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
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

  const responseObj = newOrder.toObject();
  responseObj.id = responseObj._id.toString();

  return res.status(201).json(responseObj);
});

const cancelOrder = asyncHandler(async (req, res) => {
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

  order.id = order._id.toString();
  return res.json({ message: "Order cancelled successfully", order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
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

  order.id = order._id.toString();
  return res.json(order);
});

const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findByIdAndDelete(orderId).lean();

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  return res.json({ message: "Order deleted successfully", id: orderId });
});

module.exports = {
  getOrders,
  getAllAdminOrders,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  deleteOrder
};
