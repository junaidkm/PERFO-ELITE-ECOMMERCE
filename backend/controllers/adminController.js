const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getAdminDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const stockStats = await Product.aggregate([
      { $unwind: "$sizes" },
      { $group: { _id: "$sizes.stock", count: { $sum: 1 } } }
    ]);

    const stockCounts = Object.fromEntries(stockStats.map(({ _id, count }) => [_id, count]));

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailySalesAgg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          status: { $ne: "Cancelled" }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%b %d", date: "$createdAt" } },
          sales: { $sum: "$total" }
        }
      }
    ]);

    const salesMap = Object.fromEntries(dailySalesAgg.map(({ _id, sales }) => [_id, sales]));

    const salesData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { date: dateStr, sales: salesMap[dateStr] || 0 };
    });

    return res.json({
      stats: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue,
        inStock: stockCounts["In Stock"] || 0,
        outOfStock: stockCounts["Out of Stock"] || 0
      },
      recentOrders,
      salesData
    });
  } catch (err) {
    console.error("Admin dashboard stats error:", err);
    return res.status(500).json({ message: "Failed to load dashboard metrics", error: err.message });
  }
};

module.exports = {
  getAdminDashboardStats
};
