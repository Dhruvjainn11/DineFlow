// routes/analyticsRoutes.js
import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { requireAdvancedAnalytics } from '../middleware/featureMiddleware.js';
// import { validateQueryPagination, handleValidationErrors } from '../middleware/validationMiddleware.js';
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
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
        status: order.status,
        createdAt: order.createdAt
      });
    });
    
    // Count by payment status
    const statusCounts = await Order.aggregate([
      { $match: cafeFilter },
      { $group: { _id: '$paymentStatus', count: { $sum: 1 }, totalRevenue: { $sum: '$totalAmount' } } }
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
          totalAmount: o.totalAmount,
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
router.get("/summary", protect, allowRoles("admin", "super-admin"), async (req, res) => {
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
    
    // Debug: Check today's orders and their payment status
    const todayDebug = new Date();
    todayDebug.setHours(0, 0, 0, 0);
    const tomorrowDebug = new Date(todayDebug);
    tomorrowDebug.setDate(tomorrowDebug.getDate() + 1);
    
    const todayOrdersDebug = await Order.find({
      ...cafeFilter,
      createdAt: { $gte: todayDebug, $lt: tomorrowDebug }
    }).select('paymentStatus totalAmount totalPrice');
    
    console.log('🔍 Today\'s orders debug:', todayOrdersDebug.map(o => ({
      paymentStatus: o.paymentStatus,
      totalAmount: o.totalAmount,
      totalPrice: o.totalPrice
    })));
    
    // Calculate manual total for verification
    const manualTotal = todayOrdersDebug.reduce((sum, order) => {
      const amount = order.totalAmount || order.totalPrice || 0;
      console.log('Order amount:', amount, 'from totalAmount:', order.totalAmount, 'totalPrice:', order.totalPrice);
      return sum + amount;
    }, 0);
    console.log('🔍 Manual total calculation:', manualTotal);
    
    // Check Pro plan status first
    let isProPlan = false;
    console.log('🔍 Starting Pro plan detection for user role:', req.user.role);
    console.log('🔍 User cafeId:', req.user.cafeId);
    
    try {
      if (req.user.role === 'super-admin') {
        isProPlan = true;
        console.log('✅ Super admin detected - Pro plan enabled');
      } else if (req.user.cafeId) {
        console.log('🔍 Fetching cafe with ID:', req.user.cafeId._id || req.user.cafeId);
        const cafe = await Cafe.findById(req.user.cafeId._id || req.user.cafeId);
        console.log('🏪 Cafe found:', cafe?.name, 'Plan:', cafe?.subscription?.planType);
        isProPlan = cafe?.subscription?.planType === 'pro';
        console.log('✅ Pro plan check result:', isProPlan);
      } else {
        console.log('⚠️ No cafeId found for user');
      }
    } catch (error) {
      console.error('❌ Error in Pro plan detection:', error);
    }
    
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
      { $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", "$totalPrice"] } } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Completed Revenue - only from completed payments
    const completedRevenueAgg = await Order.aggregate([
      { $match: { ...cafeFilter, paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$totalAmount", "$totalPrice"] } } } },
    ]);
    const completedRevenue = completedRevenueAgg[0]?.total || 0;

    // Get 7-day statistics for ALL users (Basic and Pro)
    const daysBack = 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    
    console.log('📊 Analytics - 7 days for all users:', { isProPlan, userRole: req.user.role });

    // Get all orders from the specified period
    const dailyStats = await Order.aggregate([
      {
        $match: {
          ...cafeFilter,
          createdAt: { $gte: startDate }
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
                "$totalAmount",
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

    // Fill in missing days with zero values (7 days for all users)
    const dailyStatsMap = {};
    dailyStats.forEach(stat => {
      dailyStatsMap[stat._id] = {
        date: stat._id,
        orders: stat.orders,
        revenue: stat.revenue,
        totalPotentialRevenue: stat.totalPotentialRevenue || 0
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
        revenue: dailyStatsMap[dateStr]?.revenue || 0,
        totalPotentialRevenue: dailyStatsMap[dateStr]?.totalPotentialRevenue || 0
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
                { $ifNull: ["$totalAmount", "$totalPrice"] },
                0
              ]
            }
          },
          totalPotentialRevenue: { $sum: { $ifNull: ["$totalAmount", "$totalPrice"] } }
        }
      }
    ]);

    const todayData = todayStats[0] || { orders: 0, revenue: 0, totalPotentialRevenue: 0 };
    
    // Ensure totalPotentialRevenue exists
    if (!todayData.totalPotentialRevenue) {
      todayData.totalPotentialRevenue = manualTotal;
    }
    
    console.log('📊 Today stats result:', todayData);
    console.log('📊 Today orders with payment status:', todayOrdersDebug.length);
    console.log('📊 Raw today stats from aggregation:', todayStats);
    console.log('📊 Manual total vs aggregation total:', manualTotal, 'vs', todayData.totalPotentialRevenue);

    // Basic popular items (7-day period for all users)
    const popularItemsData = await Order.aggregate([
      { $match: { ...cafeFilter, createdAt: { $gte: startDate } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.menuItem",
          totalOrdered: { $sum: "$items.quantity" }
        }
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: isProPlan ? 10 : 5 },
      {
        $lookup: {
          from: "menuitems",
          localField: "_id",
          foreignField: "_id",
          as: "menuItem"
        }
      }
    ]);
    
    // Get all tables with their current orders (needed for Pro calculations)
    const allTables = await Table.find(cafeFilter).populate({
      path: "currentOrder",
      model: "Order",
      options: { sort: { createdAt: -1 } }, // latest order first
    });

    // Generate 30-day data and Pro features for Pro users
    let thirtyDayStats = [];
    let peakHour = 'N/A';
    let tableTurnover = 0;
    
    if (isProPlan) {
      // Get peak hour from orders
      const peakHourData = await Order.aggregate([
        { $match: cafeFilter },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            orders: { $sum: 1 }
          }
        },
        { $sort: { orders: -1 } },
        { $limit: 1 }
      ]);
      
      if (peakHourData.length > 0) {
        const hour = peakHourData[0]._id;
        peakHour = `${hour}:00-${hour + 1}:00`;
      }
      
      // Calculate table turnover (orders per table per day)
      if (allTables.length > 0 && totalOrders > 0) {
        tableTurnover = (totalOrders / allTables.length / 30).toFixed(1);
      }
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      console.log('🔄 Generating 30-day data for Pro user, from:', thirtyDaysAgo.toISOString());
      
      const thirtyDayData = await Order.aggregate([
        {
          $match: {
            ...cafeFilter,
            createdAt: { $gte: thirtyDaysAgo }
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
            revenue: { $sum: "$totalAmount" }
          }
        },
        { $sort: { _id: 1 } }
      ]);
      
      console.log('📊 30-day raw data count:', thirtyDayData.length);
      
      // Fill missing days
      const thirtyDayStatsMap = {};
      thirtyDayData.forEach(stat => {
        thirtyDayStatsMap[stat._id] = {
          date: stat._id,
          orders: stat.orders,
          revenue: stat.revenue
        };
      });
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        thirtyDayStats.push({
          date: dateStr,
          orders: thirtyDayStatsMap[dateStr]?.orders || 0,
          revenue: thirtyDayStatsMap[dateStr]?.revenue || 0
        });
      }
      
      console.log('📈 Final 30-day stats count:', thirtyDayStats.length);
    }



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
      completedPayments,
      isProPlan,
      thirtyDayStatsLength: thirtyDayStats.length
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
        todayStats: {
          orders: todayData.orders || 0,
          revenue: todayData.revenue || 0,
          totalPotentialRevenue: todayData.totalPotentialRevenue || manualTotal,
          _id: todayData._id
        },
        planType: isProPlan ? 'pro' : 'basic',
        daysBack: 7,
        // Popular items (different limits for different plans)
        popularItems: popularItemsData,
        thirtyDayStats: thirtyDayStats,
        peakHour: peakHour,
        tableTurnover: tableTurnover
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
            revenue: { $sum: "$totalAmount" },
            avgOrderValue: { $avg: "$totalAmount" }
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
            revenue: { $sum: "$totalAmount" },
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
            revenue: { $sum: "$totalAmount" }
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
            revenue: { $sum: "$totalAmount" }
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
