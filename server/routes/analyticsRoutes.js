// routes/analyticsRoutes.js
import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";

const router = express.Router();

router.get("/summary", protect, allowRoles("admin"), async (req, res) => {
  try {
    // Order stats
    const totalOrders = await Order.countDocuments();
    const pendingPayments = await Order.countDocuments({
      paymentStatus: "Pending",
    });
    const requestedPayments = await Order.countDocuments({
      paymentStatus: "Requested",
    });
    const completedPayments = await Order.countDocuments({
      paymentStatus: "Completed",
    });

    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Table stats
    const totalTables = await Table.countDocuments();
    const statusCounts = await Table.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const tableStatus = statusCounts.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      totalOrders,
      payments: {
        pending: pendingPayments,
        requested: requestedPayments,
        completed: completedPayments,
        totalRevenue,
      },
      tables: {
        total: totalTables,
        ...tableStatus, // e.g. { EMPTY: 4, ORDERED: 2, DONE: 1 }
      },
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res
      .status(500)
      .json({ message: "Failed to load analytics", error: err.message });
  }
});

export default router;
