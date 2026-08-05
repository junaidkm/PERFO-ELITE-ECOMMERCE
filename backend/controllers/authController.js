const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  const userExists = await User.exists({ email: email.toLowerCase() });
  if (userExists) {
    return res.status(400).json({ message: "User already exists" });
  }

  const user = await User.create({ name, email, password });
  const token = generateToken(user._id);

  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.blocked
    }
  });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  if (user.blocked) {
    return res.status(403).json({ message: "Your account is blocked" });
  }

  await User.findByIdAndUpdate(user._id, {
    $set: { isOnline: true, lastLogin: new Date().toISOString() }
  });

  const token = generateToken(user._id);
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      blocked: user.blocked
    }
  });
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await User.findByIdAndUpdate(req.user.id, {
      $set: { isOnline: false }
    }).lean();
  }

  res.clearCookie("token", { ...COOKIE_OPTIONS, maxAge: 0 });
  return res.json({ message: "Logged out successfully" });
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
