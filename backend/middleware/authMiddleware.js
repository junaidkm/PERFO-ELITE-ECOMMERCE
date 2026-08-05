const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  const token =
    req.cookies?.token ||
    (req.headers?.authorization?.startsWith("Bearer") && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account has been blocked" });
    }

    req.user = user;
    req.user.id = user._id.toString();
    return next();
  } catch (err) {
    console.error("JWT verification error:", err.message);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ message: "Access denied. Admin authorization required." });
};

module.exports = { protect, admin };
