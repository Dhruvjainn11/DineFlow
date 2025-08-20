// routes/analyticsRoutes.js
import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { requireAdvancedAnalytics } from '../middleware/featureMiddleware.js';
import { validateQueryPagination, handleValidationErrors } from '../middleware/validationMiddleware.js';
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import Cafe from "../models/Cafe.js";

const router = express.Router();

/**
 * @desc    Debug analytics data
 * @route   GET /api/analytics/debug
 * @access  Private (admin/super-admin only)
 */
router.get("/debug", protect, allowRoles("admin", "super-admin"), async (req, res) => {
  try {
    let cafeId;
    if (req.user.role === 'super-admin') {
      cafeId = req.query.cafeId || null;
    } else {
      cafeId = req.user.cafeId?._id || req.user.cafeId;
    }
    const cafeFilter = cafeId ? { cafeId } : {};
    
    console.log('🔍 Debug Analytics - CafeId:', cafeId);
    console.log('🔍 Debug Analytics - Filter:', cafeFilter);
    
    // Get all orders for debugging
    const allOrders = await Order.find(cafeFilter).sort({ createdAt: -1 }).limit(10);
    console.log('🔍 Debug Analytics - Recent Orders:', allOrders.length);
    
    // Log each order details
    allOrders.forEach((order, index) => {
      console.log(`Order ${index + 1}:`, {
        id: order._id,
        cafeId: order.cafeId,
        totalPrice: order.totalPrice,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt
      });
    });
    
    // Count by payment status
    const statusCounts = await Order.aggregate([
      { $match: cafeFilter },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 }, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    
    console.log('🔍 Debug Analytics - Status Counts:', statusCounts);
    
    res.json({
      success: true,
      debug: {
        cafeId,
        cafeFilter,
        totalOrders: allOrders.length,
        recentOrders: allOrders.map(o => ({
          id: o._id,
          cafeId: o.cafeId,
          totalPrice: o.totalPrice,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt
        })),
        statusCounts
      }
    });
  } catch (err) {
    console.error("Debug Analytics Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * @desc    Get analytics summary for cafe
 * @route   GET /api/analytics/summary
 * @access  Private (admin/super-admin only)
 */
router.get("/summary", protect, allowRoles("admin", "super-admin"), validateQueryPagination, handleValidationErrors, async (req, res) => {
  try {
    // Get user's cafeId (null for super admin)
    let cafeId;
    if (req.user.role === 'super-admin') {
      cafeId = req.query.cafeId || null;
    } else {
      // For regular users, get cafeId from populated object or direct reference
      cafeId = req.user.cafeId?._id || req.user.cafeId;
    }
    
    // Build base filter for cafe-specific queries
    const cafeFilter = cafeId ? { cafeId } : {};
    
    console.log('📊 Analytics Summary - User:', req.user.role, 'CafeId:', cafeId);
    console.log('📊 Analytics Summary - Filter:', cafeFilter);
    
    // Total Orders
    const totalOrders = await Order.countDocuments(cafeFilter);

    // Payment breakdown
    const [pendingPayments, requestedPayments, completedPayments] = await Promise.all([
      Order.countDocuments({ ...cafeFilter, paymentStatus: "Pending" }),
      Order.countDocuments({ ...cafeFilter, paymentStatus: "Requested" }),
      Order.countDocuments({ ...cafeFilter, paymentStatus: "Completed" }),
    ]);

    // Total Revenue - from all orders (including pending payments for better tracking)
    const totalRevenueAgg = await Order.aggregate([
      { $match: cafeFilter },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Completed Revenue - only from completed payments
    const completedRevenueAgg = await Order.aggregate([
      { $match: { ...cafeFilter, paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const completedRevenue = completedRevenueAgg[0]?.total || 0;

    // Get 7-day daily statistics
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Get all orders from the last 7 days
    const dailyStats = await Order.aggregate([
      {
        $match: {
          ...cafeFilter,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt"
            }
          },
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "Completed"] },
                "$totalPrice",
                0
              ]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Fill in missing days with zero values
    const dailyStatsMap = {};
    dailyStats.forEach(stat => {
      dailyStatsMap[stat._id] = {
        date: stat._id,
        orders: stat.orders,
        revenue: stat.revenue
      };
    });

    const completeDailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      
      completeDailyStats.push({
        date: dateStr,
        orders: dailyStatsMap[dateStr]?.orders || 0,
        revenue: dailyStatsMap[dateStr]?.revenue || 0
      });
    }

    // Get today's specific stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await Order.aggregate([
      {
        $match: {
          ...cafeFilter,
          createdAt: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: null,
          orders: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [
                { $eq: ["$paymentStatus", "Completed"] },
                "$totalPrice",
                0
              ]
            }
          }
        }
      }
    ]);

    const todayData = todayStats[0] || { orders: 0, revenue: 0 };

    // Get all tables with their current orders
    const allTables = await Table.find(cafeFilter).populate({
      path: "currentOrder",
      model: "Order",
      options: { sort: { createdAt: -1 } }, // latest order first
    });

    // Count table statuses
    const tableStatusCounts = {
      EMPTY: 0,
      ORDERED: 0,
      PREPARING: 0,
      SERVED: 0,
      PAID: 0,
    };

    allTables.forEach((table) => {
      const latestOrder = table.currentOrder?.[0]; // latest order if exists
      if (!latestOrder) {
        tableStatusCounts.EMPTY++;
      } else {
        const status = latestOrder.status;
        if (tableStatusCounts[status] !== undefined) {
          tableStatusCounts[status]++;
        }
      }
    });

    console.log('📊 Analytics Summary - Results:', {
      totalOrders,
      totalRevenue,
      completedRevenue,
      pendingPayments,
      requestedPayments,
      completedPayments
    });
    
    res.json({
      success: true,
      data: {
        totalOrders,
        payments: {
          pending: pendingPayments,
          requested: requestedPayments,
          completed: completedPayments,
          totalRevenue,
          completedRevenue,
        },
        tables: {
          total: allTables.length,
          Available: allTables.filter((t) => t.status === "Available").length,
          Occupied: allTables.filter((t) => t.status === "Occupied").length,
          ...tableStatusCounts,
        },
        dailyStats: completeDailyStats,
        todayStats: todayData,
      }
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to load analytics", 
      error: err.message 
    });
  }
});

/**
 * @desc    Get advanced analytics with date filtering
 * @route   GET /api/analytics/advanced
 * @access  Private (admin/super-admin only) - Pro feature
 */
router.get("/advanced", protect, allowRoles("admin", "super-admin"), requireAdvancedAnalytics, async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    let cafeId;
    if (req.user.role === 'super-admin') {
      cafeId = req.query.cafeId || null;
    } else {
      cafeId = req.user.cafeId?._id || req.user.cafeId;
    }
    
    // Verify cafe access for non-super-admin users
    if (req.user.role !== 'super-admin' && !req.user.cafeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - no cafe assigned'
      });
    }
    
    // Build date filter
    const dateFilter = cafeId ? { cafeId } : {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    // Get detailed analytics
    const [
      orderTrends,
      revenueTrends,
      popularItems,
      peakHours,
      paymentMethodBreakdown
    ] = await Promise.all([
      // Order trends
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              $dateToString: {
                format: period === 'daily' ? "%Y-%m-%d" : "%Y-%m",
                date: "$createdAt"
              }
            },
            orders: { $sum: 1 },
            revenue: { $sum: "$totalPrice" },
            avgOrderValue: { $avg: "$totalPrice" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Revenue trends by payment status
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: period === 'daily' ? "%Y-%m-%d" : "%Y-%m",
                  date: "$createdAt"
                }
              },
              status: "$paymentStatus"
            },
            revenue: { $sum: "$totalPrice" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1, "_id.status": 1 } }
      ]),
      
      // Popular menu items
      Order.aggregate([
        { $match: { ...dateFilter, status: { $ne: 'Cancelled' } } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            totalOrdered: { $sum: "$items.quantity" },
            totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
            avgPrice: { $avg: "$items.price" }
          }
        },
        { $sort: { totalOrdered: -1 } },
        { $limit: 10 }
      ]),
      
      // Peak hours analysis
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            orders: { $sum: 1 },
            revenue: { $sum: "$totalPrice" }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      
      // Payment method breakdown
      Order.aggregate([
        { $match: { ...dateFilter, paymentStatus: 'Completed' } },
        {
          $group: {
            _id: "$paymentDetails.method",
            count: { $sum: 1 },
            revenue: { $sum: "$totalPrice" }
          }
        }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        period,
        dateRange: { startDate, endDate },
        orderTrends,
        revenueTrends,
        popularItems,
        peakHours,
        paymentMethodBreakdown,
        generatedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Advanced analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate advanced analytics',
      error: error.message
    });
  }
});



export default router;
