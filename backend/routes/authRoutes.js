const express = require("express");
const { registerUser, loginUser, logoutUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Register a new user
router.post("/register", registerUser);

// Login user
router.post("/login", loginUser);

// Logout user (requires authentication token)
router.post("/logout", protect, logoutUser);

module.exports = router;
