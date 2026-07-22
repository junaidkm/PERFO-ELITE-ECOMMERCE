const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_jwt_secret_key_123", {
    expiresIn: "30d"
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({
      _id: crypto.randomUUID(),
      name,
      email,
      password, // will be hashed by User pre-save hook
      role: "user",
      blocked: false,
      isOnline: false,
      lastLogin: ""
    });

    await user.save();

    return res.status(201).json({
      token: generateToken(user._id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        blocked: user.blocked
      }
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Please enter email and password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (user.blocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    user.isOnline = true;
    user.lastLogin = new Date().toISOString();
    await user.save();

    return res.json({
      token: generateToken(user._id),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        blocked: user.blocked
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// @desc    Logout user & update online status
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.isOnline = false;
      await user.save();
    }
    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Logout failed", error: err.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
