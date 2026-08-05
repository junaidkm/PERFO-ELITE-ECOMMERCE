const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const asyncHandler = require("../middleware/asyncHandler");

const getAdminDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalProducts, totalOrders, revenueResult, stockStats, recentOrders] = await Promise.all([
    User.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]),
    Product.aggregate([
      { $unwind: "$sizes" },
      { $group: { _id: "$sizes.stock", count: { $sum: 1 } } }
    ]),
    Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean()
  ]);

  const totalRevenue = revenueResult[0]?.totalRevenue || 0;

  const stockCounts = {};
  for (const stat of stockStats) {
    if (stat._id) stockCounts[stat._id] = stat.count;
  }

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 6);
  sevenDaysAgo.setUTCHours(0, 0, 0, 0);

  const dailySalesAgg = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: sevenDaysAgo },
        status: { $ne: "Cancelled" }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        sales: { $sum: "$total" }
      }
    }
  ]);

  const salesMap = {};
  for (const item of dailySalesAgg) {
    if (item._id) salesMap[item._id] = item.sales;
  }

  const salesData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dateKey = d.toISOString().split("T")[0];
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
    salesData.push({ date: dateStr, sales: salesMap[dateKey] || 0 });
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
});

module.exports = {
  getAdminDashboardStats
};
