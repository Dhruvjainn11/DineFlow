// server/routes/paymentRoutes.js
import express from 'express';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { requireOnlinePayments } from '../middleware/featureMiddleware.js';
import { 
  validatePaymentSettings, 
  validatePaymentCreation, 
  validateObjectId, 
  handleValidationErrors 
} from '../middleware/validationMiddleware.js';
import paymentService from '../services/paymentService.js';
import Order from '../models/Order.js';
import Cafe from '../models/Cafe.js';
import Table from '../models/Table.js';

const router = express.Router();

/**
 * @desc    Get payment configuration for a cafe
 * @route   GET /api/payments/config/:cafeId
 * @access  Public (needed for customer payments)
 */
router.get('/config/:cafeId', validateObjectId('cafeId'), handleValidationErrors, async (req, res) => {
  try {
    const cafe = await Cafe.findById(req.params.cafeId);
    if (!cafe) {
      return res.status(404).json({ 
        success: false,
        message: 'Cafe not found' 
      });
    }

    const config = paymentService.getPaymentConfig(cafe);
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error getting payment config:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get payment configuration',
      error: error.message 
    });
  }
});

/**
 * @desc    Create online payment order (Razorpay/Stripe)
 * @route   POST /api/payments/create-order
 * @access  Public (customer can create payment)
 */
router.post('/create-order', validatePaymentCreation, async (req, res) => {
  try {
    const { cafeId, tableNumber, gateway } = req.body;

    // Find all unpaid orders for the table
    const orders = await Order.find({
      cafeId,
      tableNumber: Number(tableNumber),
      paymentStatus: { $ne: 'Completed' }
    });

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'No unpaid orders found' 
      });
    }

    // Calculate total amount using finalAmount for round-off
    const totalAmount = orders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || order.totalPrice), 0);

    // Create payment order based on gateway
    let paymentOrder;
    if (gateway === 'razorpay') {
      paymentOrder = await paymentService.createRazorpayOrder(
        cafeId,
        orders[0]._id, // Use first order ID as reference
        totalAmount
      );
    } else if (gateway === 'stripe') {
      paymentOrder = await paymentService.createStripePaymentIntent(
        cafeId,
        orders[0]._id,
        totalAmount
      );
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment gateway' 
      });
    }

    // Store payment order ID in orders for tracking
    await Order.updateMany(
      {
        cafeId,
        tableNumber: Number(tableNumber),
        paymentStatus: { $ne: 'Completed' }
      },
      {
        $set: {
          paymentRequestedAt: new Date(),
          [`paymentDetails.${gateway}OrderId`]: paymentOrder.id
        }
      }
    );

    res.json({
      success: true,
      paymentOrder,
      totalAmount,
      orderIds: orders.map(o => o._id),
      gateway
    });

  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create payment order',
      error: error.message 
    });
  }
});

/**
 * @desc    Verify and complete Razorpay payment
 * @route   POST /api/payments/verify-razorpay
 * @access  Public (customer verification)
 */
router.post('/verify-razorpay', async (req, res) => {
  try {
    const { cafeId, tableNumber, paymentData } = req.body;

    // Verify payment with Razorpay
    const verification = await paymentService.verifyRazorpayPayment(cafeId, paymentData);

    if (!verification.isValid) {
      return res.status(400).json({ 
        success: false,
        message: verification.error 
      });
    }

    // Update all orders for the table
    const orders = await Order.find({
      cafeId,
      tableNumber: Number(tableNumber),
      paymentStatus: { $ne: 'Completed' }
    });

    // Update each order with payment details
    for (const order of orders) {
      await paymentService.updateOrderPaymentStatus(order._id, verification.payment);
    }

    // Update table status
    const table = await Table.findOne({ 
      cafeId, 
      tableNumber: Number(tableNumber) 
    });
    if (table) {
      await Table.findByIdAndUpdate(table._id, {
        status: 'Available',
        currentOrder: null
      });
    }

    // Emit socket event for real-time updates
    req.app.get('io').emit('paymentCompletedBulk', {
      tableId: Number(tableNumber),
      cafeId,
      orderIds: orders.map(o => o._id),
      paymentMethod: 'razorpay'
    });

    res.json({
      success: true,
      message: 'Payment verified and orders updated',
      orders: orders.length,
      amount: verification.payment.amount
    });

  } catch (error) {
    console.error('Error verifying Razorpay payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify payment',
      error: error.message 
    });
  }
});

/**
 * @desc    Verify and complete Stripe payment
 * @route   POST /api/payments/verify-stripe
 * @access  Public (customer verification)
 */
router.post('/verify-stripe', async (req, res) => {
  try {
    const { cafeId, tableNumber, paymentIntentId } = req.body;

    // Verify payment with Stripe
    const verification = await paymentService.verifyStripePayment(cafeId, paymentIntentId);

    if (!verification.isValid) {
      return res.status(400).json({ 
        success: false,
        message: verification.error 
      });
    }

    // Update all orders for the table
    const orders = await Order.find({
      cafeId,
      tableNumber: Number(tableNumber),
      paymentStatus: { $ne: 'Completed' }
    });

    // Update each order with payment details
    for (const order of orders) {
      await paymentService.updateOrderPaymentStatus(order._id, verification.payment);
    }

    // Update table status
    const table = await Table.findOne({ 
      cafeId, 
      tableNumber: Number(tableNumber) 
    });
    if (table) {
      await Table.findByIdAndUpdate(table._id, {
        status: 'Available',
        currentOrder: null
      });
    }

    // Emit socket event for real-time updates
    req.app.get('io').emit('paymentCompletedBulk', {
      tableId: Number(tableNumber),
      cafeId,
      orderIds: orders.map(o => o._id),
      paymentMethod: 'stripe'
    });

    res.json({
      success: true,
      message: 'Payment verified and orders updated',
      orders: orders.length,
      amount: verification.payment.amount
    });

  } catch (error) {
    console.error('Error verifying Stripe payment:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to verify payment',
      error: error.message 
    });
  }
});

/**
 * @desc    Update cafe payment gateway settings
 * @route   PUT /api/payments/settings/:cafeId
 * @access  Private (cafe admin only)
 */
router.put('/settings/:cafeId', protect, allowRoles('admin', 'super-admin'), requireOnlinePayments, validatePaymentSettings, async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { gateway, settings } = req.body;

    // Verify user has access to this cafe
    if (req.user.role !== 'super-admin' && req.user.cafeId?.toString() !== cafeId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this cafe' 
      });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ 
        success: false,
        message: 'Cafe not found' 
      });
    }

    // Check if cafe has online payments feature
    if (!cafe.hasFeature('onlinePayments')) {
      return res.status(403).json({ 
        success: false,
        message: 'Online payments not available. Upgrade to Pro plan to access this feature.',
        code: 'FEATURE_NOT_AVAILABLE' 
      });
    }

    // Update payment settings based on gateway
    if (gateway === 'razorpay') {
      cafe.paymentDetails.razorpay = {
        keyId: settings.keyId || '',
        keySecret: settings.keySecret || '',
        enabled: settings.enabled || false
      };
    } else if (gateway === 'stripe') {
      cafe.paymentDetails.stripe = {
        publishableKey: settings.publishableKey || '',
        secretKey: settings.secretKey || '',
        enabled: settings.enabled || false
      };
    } else if (gateway === 'paypal') {
      cafe.paymentDetails.paypal = {
        clientId: settings.clientId || '',
        clientSecret: settings.clientSecret || '',
        enabled: settings.enabled || false
      };
    } else {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid payment gateway' 
      });
    }

    await cafe.save();

    res.json({
      success: true,
      message: `${gateway} settings updated successfully`
    });

  } catch (error) {
    console.error('Error updating payment settings:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update payment settings',
      error: error.message 
    });
  }
});

/**
 * @desc    Get payment analytics for cafe
 * @route   GET /api/payments/analytics/:cafeId
 * @access  Private (cafe admin only)
 */
router.get('/analytics/:cafeId', protect, allowRoles('admin', 'super-admin'), requireOnlinePayments, validateObjectId('cafeId'), handleValidationErrors, async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { startDate, endDate } = req.query;

    // Verify user has access to this cafe
    if (req.user.role !== 'super-admin' && req.user.cafeId?.toString() !== cafeId) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this cafe' 
      });
    }

    const cafe = await Cafe.findById(cafeId);
    if (!cafe) {
      return res.status(404).json({ 
        success: false,
        message: 'Cafe not found' 
      });
    }

    // Build date filter
    const dateFilter = { cafeId };
    if (startDate && endDate) {
      dateFilter.paymentCompletedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get payment analytics
    const [
      totalOrders,
      onlinePayments,
      offlinePayments,
      gatewayBreakdown
    ] = await Promise.all([
      // Total completed orders
      Order.countDocuments({
        ...dateFilter,
        paymentStatus: 'Completed'
      }),

      // Online payments
      Order.aggregate([
        {
          $match: {
            ...dateFilter,
            paymentStatus: 'Completed',
            'paymentDetails.method': 'online'
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalPrice' }
          }
        }
      ]),

      // Offline payments
      Order.aggregate([
        {
          $match: {
            ...dateFilter,
            paymentStatus: 'Completed',
            'paymentDetails.method': { $ne: 'online' }
          }
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalPrice' }
          }
        }
      ]),

      // Gateway breakdown
      Order.aggregate([
        {
          $match: {
            ...dateFilter,
            paymentStatus: 'Completed',
            'paymentDetails.method': 'online'
          }
        },
        {
          $group: {
            _id: '$paymentDetails.gateway',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalPrice' }
          }
        }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        onlinePayments: onlinePayments[0] || { count: 0, totalAmount: 0 },
        offlinePayments: offlinePayments[0] || { count: 0, totalAmount: 0 },
        gatewayBreakdown
      }
    });

  } catch (error) {
    console.error('Error getting payment analytics:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get payment analytics',
      error: error.message 
    });
  }
});

/**
 * @desc    Webhook for payment success (can be called by payment gateways or admin)
 * @route   POST /api/payments/webhook/success
 * @access  Public (for payment gateway webhooks)
 */
router.post('/webhook/success', async (req, res) => {
  try {
    const { tableId, cafeId, paymentMethod = 'cash', transactionId } = req.body;

    if (!tableId) {
      return res.status(400).json({ 
        success: false,
        message: 'tableId is required' 
      });
    }

    // Find table to get table number
    let tableNumber = tableId;
    let actualCafeId = cafeId;
    
    // If tableId is an ObjectId, find the table
    if (tableId.match(/^[0-9a-fA-F]{24}$/)) {
      const table = await Table.findById(tableId);
      if (table) {
        tableNumber = table.tableNumber;
        actualCafeId = table.cafeId;
      }
    }

    // Update all unpaid orders for this table
    const updatedOrders = await Order.updateMany(
      { 
        cafeId: actualCafeId,
        tableNumber: Number(tableNumber), 
        paymentStatus: { $ne: "Completed" } 
      },
      { 
        paymentStatus: "Completed", 
        paymentCompletedAt: new Date(),
        'paymentDetails.method': paymentMethod,
        'paymentDetails.transactionId': transactionId || `manual-${Date.now()}`
      }
    );

    // Get the completed orders
    const completedOrders = await Order.find({
      cafeId: actualCafeId,
      tableNumber: Number(tableNumber),
      paymentStatus: "Completed"
    }).populate('items.menuItem');

    // Update table status
    await Table.updateOne(
      { cafeId: actualCafeId, tableNumber: Number(tableNumber) },
      {
        status: "Available",
        currentOrder: null
      }
    );

    // Emit socket events for real-time updates
    const io = req.app.get('io');
    if (io) {
      // Emit bulk payment completed
      io.to(`cafe-${actualCafeId}`).emit('paymentCompletedBulk', {
        tableId: tableNumber.toString(),
        cafeId: actualCafeId,
        orderIds: completedOrders.map(o => o._id),
        paymentMethod
      });

      // Emit individual payment completed events
      completedOrders.forEach(order => {
        io.to(`cafe-${actualCafeId}`).emit('paymentCompleted', order);
      });
    }

    res.json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        ordersUpdated: updatedOrders.modifiedCount,
        totalAmount: completedOrders.reduce((sum, order) => sum + (order.finalAmount || order.totalAmount || order.totalPrice), 0)
      }
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process payment',
      error: error.message 
    });
  }
});

/**
 * @desc    Process refund for an order
 * @route   POST /api/payments/refund
 * @access  Private (admin only)
 */
router.post('/refund', protect, allowRoles('admin', 'super-admin'), requireOnlinePayments, async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }

    // Verify user has access to this cafe
    if (req.user.role !== 'super-admin' && req.user.cafeId?.toString() !== order.cafeId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied to this order' 
      });
    }

    // Check if order was paid online
    if (order.paymentDetails.method !== 'online') {
      return res.status(400).json({ 
        success: false,
        message: 'Refunds only available for online payments' 
      });
    }

    // Process refund
    const refundResult = await paymentService.processRefund(
      order.cafeId,
      order.paymentDetails.transactionId,
      amount || order.totalPrice,
      order.paymentDetails.gateway
    );

    if (!refundResult.success) {
      return res.status(400).json({ 
        success: false,
        message: refundResult.error 
      });
    }

    // Update order with refund information
    order.paymentDetails.refund = {
      amount: amount || order.totalPrice,
      reason: reason || '',
      processedAt: new Date(),
      refundId: refundResult.refund.id,
      status: 'processed'
    };

    await order.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      refund: refundResult.refund
    });

  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process refund',
      error: error.message 
    });
  }
});

export default router;
