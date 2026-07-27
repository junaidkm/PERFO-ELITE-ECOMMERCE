const express = require("express");
const {
  getUserProfile,
  getAllUsers,
  updateUser,
  deleteUser
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// User profile route
router.get("/profile", protect, getUserProfile);

// Admin user management routes
router.get("/", protect, admin, getAllUsers);
router.get("/:id", protect, getUserProfile);
router.put("/:id", protect, admin, updateUser);
router.patch("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
