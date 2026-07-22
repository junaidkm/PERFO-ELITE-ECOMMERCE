const express = require("express");
const {
  getWishlist,
  addToWishlist,
  toggleWishlist,
  updateWishlist,
  removeFromWishlist,
  clearWishlist
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getWishlist);
router.get("/:userId", protect, getWishlist);
router.post("/", protect, addToWishlist);
router.post("/toggle", protect, toggleWishlist);
router.put("/", protect, updateWishlist);
router.put("/:userId", protect, updateWishlist);
router.delete("/clear", protect, clearWishlist);
router.delete("/:productId", protect, removeFromWishlist);

module.exports = router;
