const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.params.id || req.user.id;
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.id = user._id.toString();
  return res.json(user);
});

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
  const formattedUsers = users.map(u => ({ ...u, id: u._id.toString() }));
  return res.json(formattedUsers);
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateFields = { ...(req.body || {}) };
  delete updateFields.password;

  const user = await User.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { returnDocument: "after", runValidators: true }
  ).select("-password").lean();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.id = user._id.toString();
  return res.json(user);
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndDelete(id).lean();

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ message: "User deleted successfully", id });
});

module.exports = {
  getUserProfile,
  getAllUsers,
  updateUser,
  deleteUser
};
