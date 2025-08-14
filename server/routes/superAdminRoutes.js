import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { requireAdvancedAnalytics } from '../middleware/featureMiddleware.js';
import { validateQueryPagination, handleValidationErrors } from '../middleware/validationMiddleware.js';
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Cafe from "../models/Cafe.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * @desc    Get system-wide analytics for super-admin
 * @route   GET /api/super-admin/analytics
 * @access  Private (super-admin only)
 */
router.get("/analytics", protect, allowRoles("super-admin"), async (req, res) => {
    try {
      const [totalCafes, totalUsers, totalOrders, totalRevenueAgg, topCafes] = await Promise.all([
        Cafe.countDocuments(),
        User.countDocuments(),
        Order.countDocuments(),
        Order.aggregate([
          { $match: { paymentStatus: "Completed" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]),
        Order.aggregate([
          { $match: { paymentStatus: "Completed" } },
          { $group: { _id: "$cafeId", revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "cafes",
              localField: "_id",
              foreignField: "_id",
              as: "cafe",
            },
          },
          { $unwind: "$cafe" },
        ]),
      ]);
  
     // Compute last 7 days stats
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
sevenDaysAgo.setHours(0, 0, 0, 0);

const dailyStats = await Order.aggregate([
  {
    $match: {
      createdAt: { $gte: sevenDaysAgo },
      paymentStatus: "Completed",
    },
  },
  {
    $group: {
      _id: {
        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
      },
      revenue: { $sum: "$totalPrice" },
      orders: { $sum: 1 },
    },
  },
  { $sort: { _id: 1 } },
]);

// Fill missing days
const statsMap = {};
dailyStats.forEach(stat => {
  statsMap[stat._id] = stat;
});

const filledStats = [];
for (let i = 6; i >= 0; i--) {
  const date = new Date();
  date.setDate(date.getDate() - i);
  const dateStr = date.toISOString().split("T")[0];
  filledStats.push({
    date: dateStr,
    revenue: statsMap[dateStr]?.revenue || 0,
    orders: statsMap[dateStr]?.orders || 0,
  });
}

res.json({
  success: true,
  data: {
    totalCafes,
    totalUsers,
    totalOrders,
    totalRevenue: totalRevenueAgg[0]?.total || 0,
    topCafes,
    dailyStats: filledStats, // 👈 added
  },
});

    } catch (error) {
      console.error("Super Admin Analytics Error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to load super admin analytics",
        error: error.message,
      });
    }
});



export default router;