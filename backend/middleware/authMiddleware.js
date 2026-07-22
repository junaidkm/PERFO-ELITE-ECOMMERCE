const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware to protect routes by verifying JWT.
 * Primary: reads token from secure httpOnly cookie (req.cookies.token).
 * Fallback: reads Bearer token from Authorization header (for API clients).
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Prefer the secure httpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Fallback: Authorization: Bearer <token>
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
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

