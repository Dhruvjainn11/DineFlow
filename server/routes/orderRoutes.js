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

const router = express.Router();

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Public (customer facing)
 */
router.post("/", validateOrderCreation, async (req, res) => {
  try {
    const { tableNumber, items, cafeId } = req.body;
    
    // Find table by its primitive number and get its ObjectId, ensure it belongs to the cafe
    const table = await Table.findOne({ 
      tableNumber: Number(tableNumber),
      cafeId: cafeId 
    });
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: `Table ${tableNumber} not found in this cafe` 
      });
    }

    let calculatedTotalPrice = 0;
    const finalOrderItems = [];

    // Use a Promise.all to fetch all menu items in one go for efficiency
    // This is the correct approach to get all menu items at once.
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ 
      _id: { $in: menuItemIds },
      cafeId: cafeId // Ensure menu items belong to the same cafe
    });

    // Validate and calculate prices for each item
    for (const orderItem of items) {
      const menuItem = menuItems.find(mi => mi._id.toString() === orderItem.menuItem);
      if (!menuItem) {
        return res.status(404).json({ 
          success: false,
          message: `Menu item with ID ${orderItem.menuItem} not found in this cafe.` 
        });
      }

      let itemPrice = menuItem.price;
      // If the item has sizes, find the correct price
      if (menuItem.sizes && menuItem.sizes.length > 0 && orderItem.sizeLabel) {
        const selectedSize = menuItem.sizes.find(s => s.label === orderItem.sizeLabel);
        if (!selectedSize) {
          return res.status(400).json({ 
            success: false,
            message: `Invalid size '${orderItem.sizeLabel}' for item '${menuItem.name}'.` 
          });
        }
        itemPrice = selectedSize.price;
      } else {
        // Use the base price if no size is specified
        itemPrice = menuItem.price;
      }

      // Add item to the final order array with the validated price
      finalOrderItems.push({
        ...orderItem, // Keep other properties like quantity, remark
        itemPrice, // Store the server-side validated price
        // Ensure size is handled correctly
        size: orderItem.sizeLabel ? { label: orderItem.sizeLabel, price: itemPrice } : undefined,
      });

      calculatedTotalPrice += itemPrice * orderItem.quantity;
    }

    const newOrder = new Order({
      cafeId: cafeId,
      tableNumber: table.tableNumber, // Store primitive table number per schema
      items: finalOrderItems,
      subtotal: calculatedTotalPrice,
      totalPrice: calculatedTotalPrice, // Will be recalculated with tax/service charge if needed
      status: "Pending",
      paymentStatus: "Pending",
    });

    await newOrder.save();

    await Table.findByIdAndUpdate(table._id, {
      status: "Occupied",
      currentOrder: newOrder._id
    });

    // Populate and emit the new order (only menu items; tableNumber is a Number)
    const populatedOrder = await newOrder.populate("items.menuItem");
    
    // Emit to cafe-specific room for better organization
    const io = req.app.get("io");
    io.to(`cafe-${cafeId}`).emit("newOrder", populatedOrder);
    
    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder
    });
    
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to place order',
      error: error.message 
    });
  }
});

/**
 * @desc    Get all orders (admin/kitchen view)
 * @route   GET /api/orders
 * @access  Private (protect, allowRoles('admin', 'kitchen'))
 */
router.get("/", protect, allowRoles('admin', 'staff', 'cashier'), async (req, res) => {
  try {
    const { status, view, lastDays, dateFrom, dateTo } = req.query;
    
    // Filter by user's cafe (unless super admin)
    let filter = {};
    if (!req.user.isSuperAdmin()) {
      filter.cafeId = req.user.cafeId._id;
    }

    if (view === "payment") {
      filter.paymentStatus = { $ne: "Completed" };
    } else {
      // Default kitchen/admin view
      filter.status = { $ne: "Completed" };
    }

    if (status) {
      filter.status = { $in: status.split(",") };
    }

    // Date range filtering
    const createdAtFilter = {};
    if (lastDays && !isNaN(Number(lastDays))) {
      const days = Number(lastDays);
      const from = new Date();
      from.setDate(from.getDate() - days);
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
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders",
      error: error.message 
    });
  }
});

/**
 * @desc    Get all orders for a specific table
 * @route   GET /api/orders/table/:tableNumber
 * @access  Public (customer view)
 */
router.get("/table/:tableNumber", validateObjectId('tableNumber'), handleValidationErrors, async (req, res) => {
  try {
    // Find table by table number
    const table = await Table.findOne({ tableNumber: Number(req.params.tableNumber) });
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: "Table not found" 
      });
    }

    const orders = await Order.find({
      cafeId: table.cafeId, // Ensure orders belong to the same cafe
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
    console.error('Error fetching table orders:', error);
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
router.put("/table/:tableNumber/request-payment", async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: Number(req.params.tableNumber) });
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
      tableId: table.tableNumber, 
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
    const table = await Table.findOne({ tableNumber: tableNum });
    if (!table) {
      return res.status(404).json({ 
        success: false,
        message: "Table not found" 
      });
    }

    // Check if user has access to this table's cafe
    if (!req.user.isSuperAdmin() && 
        table.cafeId.toString() !== req.user.cafeId._id.toString()) {
      return res.status(403).json({ 
        success: false,
        message: "Access denied to this table" 
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

    // Emit to cafe-specific room
    const io = req.app.get("io");
    io.to(`cafe-${table.cafeId}`).emit("paymentCompletedBulk", { 
      tableId: table.tableNumber, 
      orderIds: updatedOrders.modifiedCount 
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