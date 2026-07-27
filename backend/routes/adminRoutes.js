const express = require("express");
const { getAdminDashboardStats } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", protect, admin, getAdminDashboardStats);

module.exports = router;
