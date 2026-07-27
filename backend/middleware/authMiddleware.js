const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Authentication middleware to protect routes
const protect = async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers?.authorization?.startsWith("Bearer") &&
      req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = await User.findById(decoded.id).select("-password").exec();

    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (req.user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Admin authorization middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied. Admin authorization required." });
  }
};

// Generic role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({
        message: `Access denied. Role '${req.user?.role || "guest"}' is not authorized.`
      });
    }
  };
};

module.exports = { protect, admin, authorize };
