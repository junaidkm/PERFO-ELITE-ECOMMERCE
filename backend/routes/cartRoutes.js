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

router.use(protect);

router.get("/", getCart);
router.get("/:userId", getCart);
router.post("/", addToCart);
router.put("/", updateCart);
router.put("/:userId", updateCart);
router.delete("/clear", clearCart);
router.delete("/:itemId", removeFromCart);

module.exports = router;
