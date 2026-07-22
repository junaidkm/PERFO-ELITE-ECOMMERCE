const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes by verifying JWT Bearer tokens.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "default_jwt_secret_key_123"
      );

      req.user = await User.findById(decoded.id);

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
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

/**
 * Middleware to restrict route access strictly to admin users.
 */
const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied, admin authorization required" });
  }
};

module.exports = { protect, admin };
