import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { requireAdvancedAnalytics } from '../middleware/featureMiddleware.js';
import { validateQueryPagination, handleValidationErrors } from '../middleware/validationMiddleware.js';
import { checkExpiredSubscriptions } from '../jobs/subscriptionCron.js';
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



/**
 * @desc    Manually check and update expired subscriptions
 * @route   POST /api/super-admin/check-expired-subscriptions
 * @access  Private (Super Admin only)
 */
router.post('/check-expired-subscriptions', protect, allowRoles('super-admin'), async (req, res) => {
  try {
    const result = await checkExpiredSubscriptions();
    res.json({
      success: true,
      message: `Checked subscriptions. ${result.expiredCount} expired subscriptions updated.`,
      data: result
    });
  } catch (error) {
    console.error('Manual subscription check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check expired subscriptions',
      error: error.message
    });
  }
});

/**
 * @desc    Update cafe subscription status
 * @route   PUT /api/super-admin/cafes/:cafeId/subscription
 * @access  Private (Super Admin only)
 */
router.put('/cafes/:cafeId/subscription', protect, allowRoles('super-admin'), async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { status, planType, endDate } = req.body;

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Update subscription
    if (status) cafe.subscription.status = status;
    if (planType) cafe.subscription.planType = planType;
    if (endDate) cafe.subscription.endDate = new Date(endDate);
    
    // Update cafe status based on subscription
    if (status === 'active') {
      cafe.status = 'active';
    } else if (status === 'inactive') {
      cafe.status = 'inactive';
    }

    await cafe.save();

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        cafeId: cafe._id,
        name: cafe.name,
        subscription: cafe.subscription,
        status: cafe.status
      }
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message
    });
  }
});

/**
 * @desc    Extend cafe subscription manually
 * @route   PUT /api/super-admin/cafes/:cafeId/extend-subscription
 * @access  Private (Super Admin only)
 */
router.put('/cafes/:cafeId/extend-subscription', protect, allowRoles('super-admin'), async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { extensionDays, reason } = req.body;

    // Validation
    if (!extensionDays || extensionDays < 1 || extensionDays > 365) {
      return res.status(400).json({
        success: false,
        message: 'Extension days must be between 1 and 365'
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Extension reason is required'
      });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    if (!cafe.subscription) {
      return res.status(400).json({
        success: false,
        message: 'Cafe has no subscription to extend'
      });
    }

    // Calculate new end date
    const currentEndDate = cafe.subscription.endDate || new Date();
    const extendFromDate = currentEndDate > new Date() ? currentEndDate : new Date();
    const newEndDate = new Date(extendFromDate.getTime() + (extensionDays * 24 * 60 * 60 * 1000));

    // Add to extension history
    cafe.subscription.extensionHistory.push({
      extendedBy: req.user._id,
      extensionDays,
      reason,
      previousEndDate: cafe.subscription.endDate,
      newEndDate,
      extendedAt: new Date()
    });

    // Update subscription
    cafe.subscription.endDate = newEndDate;
    cafe.subscription.status = 'active';
    cafe.status = 'active';

    await cafe.save();

    res.json({
      success: true,
      message: `Subscription extended by ${extensionDays} days`,
      data: {
        cafeId: cafe._id,
        name: cafe.name,
        extensionDays,
        newEndDate,
        subscription: cafe.subscription
      }
    });
  } catch (error) {
    console.error('Subscription extension error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to extend subscription',
      error: error.message
    });
  }
});

export default router;