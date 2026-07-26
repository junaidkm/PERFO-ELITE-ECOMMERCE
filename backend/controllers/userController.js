const User = require("../models/User");


const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    if (String(req.user.id) !== String(userId))  {
      return res.status(403).json({ message: "Access denied, unauthorized resource access" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ message: "Failed to get user profile", error: err.message });
  }
};

module.exports = {
  getUserProfile
};

