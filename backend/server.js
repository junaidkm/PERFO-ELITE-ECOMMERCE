require("dotenv").config();
const cors = require("cors");

const express = require("express");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
connectDB();

app.use(express.json());

// Import Route Handlers
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Import Middleware
const { protect } = require("./middleware/authMiddleware");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

// Rate Limiting Middleware
app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// Public API Routes
app.use("/api/products", productRoutes);
app.use("/api/auth", authRoutes);

// Protected API Routes (Requires Authentication Token)
app.use("/api/users", protect, userRoutes);
app.use("/api/cart", protect, cartRoutes);
app.use("/api/wishlist", protect, wishlistRoutes);
app.use("/api/orders", protect, orderRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});