const express = require("express");
const { getAdminDashboardStats } = require("../controllers/adminController");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect, admin);

router.get("/dashboard", getAdminDashboardStats);

module.exports = router;
