const User = require("../models/User");

// Get user profile by ID or logged-in user
const getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Get user profile error:", err);
    return res.status(500).json({ message: "Failed to get user profile", error: err.message });
  }
};

// Admin: Get all users using Mongoose query
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 })
    return res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    return res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
};

// Admin: Update user status, role, or block using Mongoose findByIdAndUpdate
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { returnDocument: "after", runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Update user error:", err);
    return res.status(500).json({ message: "Failed to update user", error: err.message });
  }
};

// Admin: Delete user using Mongoose findByIdAndDelete
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted successfully", id });
  } catch (err) {
    console.error("Delete user error:", err);
    return res.status(500).json({ message: "Failed to delete user", error: err.message });
  }
};

module.exports = {
  getUserProfile,
  getAllUsers,
  updateUser,
  deleteUser
};
