const express = require("express");
const {
  getOrders,
  getAllAdminOrders,
  createOrder,
  cancelOrder,
  updateOrderStatus,
  deleteOrder
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// User routes
router.get("/", protect, getOrders);
router.post("/", protect, createOrder);
router.put("/:orderId/cancel", protect, cancelOrder);

// Admin routes
router.get("/admin/all", protect, admin, getAllAdminOrders);
router.put("/:orderId/status", protect, admin, updateOrderStatus);
router.delete("/:orderId", protect, admin, deleteOrder);

module.exports = router;
