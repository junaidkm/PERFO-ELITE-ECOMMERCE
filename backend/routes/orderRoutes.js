const express = require("express");
const {
  getOrders,
  createOrder,
  cancelOrder
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getOrders);
router.post("/", protect, createOrder);
router.put("/:orderId/cancel", protect, cancelOrder);

module.exports = router;
