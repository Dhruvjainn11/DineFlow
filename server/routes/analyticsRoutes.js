// routes/analyticsRoutes.js
import express from "express";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import Order from "../models/Order.js";
import Table from "../models/Table.js";

const router = express.Router();

router.get("/summary", protect, allowRoles("admin"), async (req, res) => {
  try {
    // Total Orders
    const totalOrders = await Order.countDocuments();

    // Payment breakdown
    const [pendingPayments, requestedPayments, completedPayments] = await Promise.all([
      Order.countDocuments({ paymentStatus: "Pending" }),
      Order.countDocuments({ paymentStatus: "Requested" }),
      Order.countDocuments({ paymentStatus: "Completed" }),
    ]);

    // Total Revenue
    const totalRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "Completed" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // Get all tables with their current orders
    const allTables = await Table.find().populate({
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

    res.json({
      totalOrders,
      payments: {
        pending: pendingPayments,
        requested: requestedPayments,
        completed: completedPayments,
        totalRevenue,
      },
      tables: {
        total: allTables.length,
        Available: allTables.filter((t) => t.status === "Available").length,
        Occupied: allTables.filter((t) => t.status === "Occupied").length,
        ...tableStatusCounts,
      },
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Failed to load analytics", error: err.message });
  }
});


export default router;
