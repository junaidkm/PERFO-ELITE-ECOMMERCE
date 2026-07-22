const express = require("express");
const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getCart);
router.get("/:userId", protect, getCart);
router.post("/", protect, addToCart);
router.put("/", protect, updateCart);
router.put("/:userId", protect, updateCart);
router.delete("/clear", protect, clearCart);
router.delete("/:itemId", protect, removeFromCart);

module.exports = router;
