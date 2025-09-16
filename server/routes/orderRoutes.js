// server/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/Menu.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";
import { 
  validateOrderCreation, 
  validateOrderStatusUpdate, 
  validateObjectId, 
  handleValidationErrors 
} from '../middleware/validationMiddleware.js';
import { calculateOrderTotal } from '../utils/gstCalculator.js';

const router = express.Router();

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Public (customer facing)
 */
router.post("/", validateOrderCreation ,async (req, res) => {
  try {
    const { tableId, items } = req.body;

    if (!tableId) {
      return res.status(400).json({ success: false, message: "tableId is required" });
    }
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Order items are required" });
    }

    // ✅ Get table + cafe from DB
    const table = await Table.findById(tableId).populate("cafeId");
    if (!table) {
      return res.status(404).json({ success: false, message: "Table not found" });
    }

    const cafeId = table.cafeId._id;
    const tableNumber = table.tableNumber;

    let calculatedTotalPrice = 0;
    const finalOrderItems = [];

    // Grab all menu items in one query
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({
      _id: { $in: menuItemIds },
      cafeId: cafeId
    });

    // Validate + calculate prices
    for (const orderItem of items) {
      const menuItem = menuItems.find(mi => mi._id.toString() === orderItem.menuItem);
      if (!menuItem) {
        return res.status(404).json({
          success: false,
          message: `Menu item with ID ${orderItem.menuItem} not found in this cafe.`
        });
      }

      let itemPrice = menuItem.price;

      if (menuItem.sizes?.length > 0 && orderItem.sizeLabel) {
        const selectedSize = menuItem.sizes.find(s => s.label === orderItem.sizeLabel);
        if (!selectedSize) {
          return res.status(400).json({
            success: false,
            message: `Invalid size '${orderItem.sizeLabel}' for item '${menuItem.name}'.`
          });
        }
        itemPrice = selectedSize.price;
      }

      finalOrderItems.push({
        ...orderItem,
        itemPrice,
        size: orderItem.sizeLabel
          ? { label: orderItem.sizeLabel, price: itemPrice }
          : undefined,
      });

      calculatedTotalPrice += itemPrice * orderItem.quantity;
    }

    // --- GST & Final Price Calculation ---
    const cafe = table.cafeId;
    const orderCalculation = calculateOrderTotal(finalOrderItems, cafe.settings || {});


    // ✅ Create order
    const newOrder = new Order({
      cafeId,
      tableNumber,
      items: finalOrderItems,
      subtotal: orderCalculation.subtotal,
      gstDetails: orderCalculation.gstDetails,
      serviceCharge: orderCalculation.serviceCharge,
      discount: orderCalculation.discount,
      totalAmount: orderCalculation.totalAmount,
      roundOffAmount: orderCalculation.roundOffAmount,
      finalAmount: orderCalculation.finalAmount,
      status: "Pending",
      paymentStatus: "Pending",
    });

    await newOrder.save();

    // Update table status
    await Table.findByIdAndUpdate(table._id, {
      status: "Occupied",
      currentOrder: newOrder._id,
    });

    const populatedOrder = await newOrder.populate("items.menuItem");

    // Emit to cafe-specific socket room
    const io = req.app.get("io");
    io.to(`cafe-${cafeId}`).emit("newOrder", populatedOrder);
    
    // Also emit print event for admin panel auto-print
    if (cafe.settings?.printerSettings?.enabled) {
      io.to(`cafe-${cafeId}`).emit("autoPrintOrder", orderData);
    }

    // AUTO-PRINT TICKET
    const orderData = {
      orderNumber: populatedOrder._id.toString().slice(-4),
      tableNumber: tableNumber,
      createdAt: populatedOrder.createdAt,
      total: populatedOrder.finalAmount,
      planType: cafe.subscription?.planType || 'basic',
      cafeName: cafe.name,
      items: populatedOrder.items.map(item => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.itemPrice
      }))
    };
    
    // Use simple printer (console + manual setup)
    const { printToSimplePrinter } = await import('../utils/simplePrinter.js');
    await printToSimplePrinter(orderData, cafe.settings);

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: populatedOrder,
    });
  } catch (error) {
    console.error("Error placing order:", error);
    
    // Emit error event for real-time updates
    const io = req.app.get("io");
    if (io && cafeId) {
      io.to(`cafe-${cafeId}`).emit('orderError', { message: error.message, operation: 'create' });
    }
    
    res.status(500).json({
      success: false,
      message: "Failed to place order",
      error: error.message,
    });
  }
});


/**
 * @desc    Get all orders (admin/kitchen view)
 * @route   GET /api/orders
 * @access  Private (protect, allowRoles('admin', 'kitchen'))
 */
router.get("/", async (req, res) => {
  try {
    const { cafeId, status, view, lastDays, dateFrom, dateTo } = req.query;
    let filter = {};

    // Check if request is authenticated
    const isAuthenticated = req.headers.authorization && req.headers.authorization.startsWith("Bearer");

    if (isAuthenticated) {
      // Authenticated request → must pass through protect + roles
      try {
        await new Promise((resolve, reject) => {
          protect(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Only allow staff/admin/cashier roles
        if (!['admin', 'staff', 'cashier'].includes(req.user.role)) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }

        // Filter by user's cafe (unless superadmin)
        if (!req.user.isSuperAdmin()) {
          filter.cafeId = req.user.cafeId._id;
        } else if (cafeId) {
          filter.cafeId = cafeId;
        }

      } catch (authError) {
        return res.status(401).json({ success: false, message: "Authentication failed" });
      }

    } else {
      // Public customer request
      if (!cafeId) {
        return res.status(400).json({ success: false, message: "cafeId is required for public access" });
      }
      filter.cafeId = cafeId;
    }

    // Default filters
    if (view === "payment") {
      filter.paymentStatus = { $ne: "Completed" };
    } else {
      filter.status = { $ne: "Completed" };
    }

    if (status) {
      filter.status = { $in: status.split(",") };
    }

    // Date range filters
    const createdAtFilter = {};
    if (lastDays && !isNaN(Number(lastDays))) {
      const from = new Date();
      from.setDate(from.getDate() - Number(lastDays));
      createdAtFilter.$gte = from;
    }
    if (dateFrom) {
      const from = new Date(dateFrom);
      if (!isNaN(from.getTime())) createdAtFilter.$gte = from;
    }
    if (dateTo) {
      const to = new Date(dateTo);
      if (!isNaN(to.getTime())) createdAtFilter.$lte = to;
    }
    if (Object.keys(createdAtFilter).length > 0) {
      filter.createdAt = createdAtFilter;
    }

    const orders = await Order.find(filter)
      .populate("items.menuItem")
      .populate("cafeId", "name")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders",
      error: error.message 
    });
  }
});


/**
 * @desc    Get all orders for a specific table
 * @route   GET /api/orders/table/:tableId
 * @access  Public (customer view)
 */
router.get("/table/:tableId",validateObjectId("tableId") ,async (req, res) => {
  try {
    // Find table by ID
    const table = await Table.findById(req.params.tableId);
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: "Table not found" 
      });
    }

    const orders = await Order.find({
      cafeId: table.cafeId,
      tableNumber: table.tableNumber,
      paymentStatus: { $ne: "Completed" }
    }).populate("items.menuItem")
      .populate("cafeId", "name")
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Error fetching table orders:', {
      error: error.message,
      stack: error.stack,
      params: req.params
    });
    res.status(500).json({ 
      success: false,
      message: "Failed to get orders",
      error: error.message 
    });
  }
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (protect, allowRoles('admin', 'kitchen'))
 */
router.put("/:id/status", protect, allowRoles('admin', 'staff', 'cashier'), validateOrderStatusUpdate, async (req, res) => {
  const { status } = req.body;
  // Basic validation is now handled by validateOrderStatusUpdate middleware

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.menuItem");

    if (!updatedOrder) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }
    
    // Check if user has access to this order's cafe
    if (!req.user.isSuperAdmin() && 
        updatedOrder.cafeId.toString() !== req.user.cafeId._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied to this order" 
      });
    }

    // Emit to cafe-specific room
    const io = req.app.get("io");
    io.to(`cafe-${updatedOrder.cafeId}`).emit("orderStatusUpdated", updatedOrder);

    if (updatedOrder.status === "Completed") {
      io.to(`cafe-${updatedOrder.cafeId}`).emit("orderCompleted", updatedOrder);
    }
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    
    // Emit error event for real-time updates
    const io = req.app.get("io");
    const userCafeId = req.user.isSuperAdmin() ? req.body.cafeId : req.user.cafeId._id;
    if (io && userCafeId) {
      io.to(`cafe-${userCafeId}`).emit('orderError', { message: error.message, operation: 'update' });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Failed to update order status",
      error: error.message 
    });
  }
});

/**
 * @desc    Customer requests payment for all their open orders
 * @route   PUT /api/orders/table/:tableNumber/request-payment
 * @access  Public (customer view)
 */
router.put("/table/:tableId/request-payment",validateObjectId("tableId")  ,async (req, res) => {
  try {
const table = await Table.findById(req.params.tableId);
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: "Table not found" 
      });
    }

    const updatedOrders = await Order.updateMany(
      { 
        cafeId: table.cafeId, // Ensure orders belong to the same cafe
        tableNumber: table.tableNumber, 
        paymentStatus: { $ne: "Completed" } 
      },
      { paymentStatus: "Requested", paymentRequestedAt: new Date() }
    );
    
    const orders = await Order.find({ 
      cafeId: table.cafeId,
      tableNumber: table.tableNumber, 
      paymentStatus: "Requested" 
    }).populate("items.menuItem");

    // Emit to cafe-specific room
    const io = req.app.get("io");
    io.to(`cafe-${table.cafeId}`).emit("paymentRequestedBulk", { 
       tableId: table.tableNumber.toString(), 
      orders 
    });

    res.json({ 
      success: true,
      message: "Payment requested for all unpaid orders", 
      data: { orders, count: orders.length }
    });
  } catch (error) {
    console.error("Failed to request bulk payment", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to request bulk payment",
      error: error.message 
    });
  }
});


/**
 * @desc    Admin marks all orders for a table as paid
 * @route   PUT /api/orders/table/:tableNumber/payment-complete-all
 * @access  Private (protect, allowRoles('admin'))
 */
router.put("/table/:tableNumber/payment-complete-all", protect, allowRoles('admin', 'cashier'), async (req, res) => {
  try {
    const tableNum = Number(req.params.tableNumber);
    const userCafeId = req.user.cafeId?._id || req.user.cafeId;
    
    const table = await Table.findOne({ 
      tableNumber: tableNum,
      cafeId: userCafeId 
    });
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: "Table not found" 
      });
    }


    
    const updatedOrders = await Order.updateMany(
      { 
        cafeId: table.cafeId,
        tableNumber: table.tableNumber, 
        paymentStatus: { $ne: "Completed" } 
      },
      { paymentStatus: "Completed", paymentCompletedAt: new Date() }
    );

    await Table.findByIdAndUpdate(table._id, {
      status: "Available",
      currentOrder: null,
    });

    // Get the updated orders to emit proper data
    const completedOrders = await Order.find({
      cafeId: table.cafeId,
      tableNumber: table.tableNumber,
      paymentStatus: "Completed"
    });

    // Emit to cafe-specific room
    const io = req.app.get("io");
    io.to(`cafe-${table.cafeId}`).emit("paymentCompletedBulk", { 
      tableId: table.tableNumber.toString(), 
      cafeId: table.cafeId,
      orderIds: completedOrders.map(o => o._id)
    });

    // Also emit individual payment completed events for each order
    completedOrders.forEach(order => {
      io.to(`cafe-${table.cafeId}`).emit("paymentCompleted", order);
    });

    res.json({ 
      success: true,
      message: "All orders marked as paid", 
      data: { updatedCount: updatedOrders.modifiedCount }
    });
  } catch (error) {
    console.error('Error completing table payment:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to mark payment complete for table",
      error: error.message 
    });
  }
});

// The previous two PUT routes for single order payment request/complete are now redundant
// as the bulk routes cover the main use cases. If you want to keep them,
// ensure they are properly protected.

export default router;