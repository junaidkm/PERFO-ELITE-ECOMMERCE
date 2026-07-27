const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. Total document counts using Mongoose countDocuments
    const [totalUsers, totalProducts, totalOrders] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments()
    ]);

    // 2. Total Revenue using Mongoose Aggregate pipeline
    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // 3. Stock counts using Mongoose Aggregate pipeline ($unwind + $group)
    const stockStats = await Product.aggregate([
      { $unwind: "$sizes" },
      {
        $group: {
          _id: "$sizes.stock",
          count: { $sum: 1 }
        }
      }
    ]);

    let inStock = 0;
    let outOfStock = 0;
    stockStats.forEach((st) => {
      if (st._id === "In Stock") inStock = st.count;
      else if (st._id === "Out of Stock") outOfStock = st.count;
    });

    // 4. Recent 5 Orders using Mongoose populate & limit
    const recentOrders = await Order.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    // 5. Sales trend for the last 7 days using Mongoose Aggregate pipeline
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
          _id: {
            $dateToString: { format: "%b %d", date: "$createdAt" }
          },
          sales: { $sum: "$total" }
        }
      }
    ]);

    const salesMap = {};
    dailySalesAgg.forEach((item) => {
      salesMap[item._id] = item.sales;
    });

    const salesData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      salesData.push({
        date: dateStr,
        sales: salesMap[dateStr] || 0
      });
    }

    return res.json({
      stats: {
        users: totalUsers,
        products: totalProducts,
        orders: totalOrders,
        revenue: totalRevenue,
        inStock,
        outOfStock
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
