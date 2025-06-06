// routes/analyticsRoutes.js
import express from 'express';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Table from '../models/Table.js';

const router = express.Router();

router.get('/summary', protect, allowRoles('admin'), async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();

    const pendingPayments = await Order.countDocuments({ paymentStatus: 'Pending' });
    const requestedPayments = await Order.countDocuments({ paymentStatus: 'Requested' });
    const completedPayments = await Order.countDocuments({ paymentStatus: 'Complete' });

    const totalTables = await Table.countDocuments();
    const occupiedTables = await Table.countDocuments({ status: 'Occupied' });
    const freeTables = await Table.countDocuments({ status: 'Available' });

    res.json({
      totalOrders,
      payments: {
        pending: pendingPayments,
        requested: requestedPayments,
        complete: completedPayments,
      },
      tables: {
        total: totalTables,
        occupied: occupiedTables,
        free: freeTables,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load analytics', error: err.message });
  }
});


export default router;
