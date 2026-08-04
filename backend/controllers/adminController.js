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

    const stockCounts = {};
    for (const stat of stockStats) {
      if (stat._id) stockCounts[stat._id] = stat.count;
    }

    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

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

    const salesMap = {};
    for (const item of dailySalesAgg) {
      if (item._id) salesMap[item._id] = item.sales;
    }

    const salesData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesData[i] = { date: dateStr, sales: salesMap[dateStr] || 0 };
    }

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
