const express = require("express");
const {
  getUserProfile,
  getAllUsers,
  updateUser,
  deleteUser
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/profile", protect, getUserProfile);
router.get("/:id", protect, getUserProfile);

router.get("/", protect, admin, getAllUsers);
router.put("/:id", protect, admin, updateUser);
router.patch("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
