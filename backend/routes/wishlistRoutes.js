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

router.use(protect);

router.get("/", getWishlist);
router.get("/:userId", getWishlist);
router.post("/", addToWishlist);
router.post("/toggle", toggleWishlist);
router.put("/", updateWishlist);
router.put("/:userId", updateWishlist);
router.delete("/clear", clearWishlist);
router.delete("/:productId", removeFromWishlist);

module.exports = router;
