// server/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/Menu.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js"; // Assume these are implemented

const router = express.Router();

/**
 * @desc    Place a new order
 * @route   POST /api/orders
 * @access  Public (customer facing)
 */
router.post("/", async (req, res) => {
  try {
    const { tableNumber, items } = req.body;
    
    // Find table by its primitive number and get its ObjectId
    const table = await Table.findOne({ tableNumber: Number(tableNumber) });
    if (!table) {
      return res.status(404).json({ error: `Table ${tableNumber} not found` });
    }

    let calculatedTotalPrice = 0;
    const finalOrderItems = [];

    // Use a Promise.all to fetch all menu items in one go for efficiency
    // This is the correct approach to get all menu items at once.
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    // Validate and calculate prices for each item
    for (const orderItem of items) {
      const menuItem = menuItems.find(mi => mi._id.toString() === orderItem.menuItem);
      if (!menuItem) {
        return res.status(404).json({ error: `Menu item with ID ${orderItem.menuItem} not found.` });
      }

      let itemPrice = menuItem.price;
      // If the item has sizes, find the correct price
      if (menuItem.sizes && menuItem.sizes.length > 0 && orderItem.sizeLabel) {
        const selectedSize = menuItem.sizes.find(s => s.label === orderItem.sizeLabel);
        if (!selectedSize) {
          return res.status(400).json({ error: `Invalid size '${orderItem.sizeLabel}' for item '${menuItem.name}'.` });
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
      tableNumber: table.tableNumber, // Store primitive table number per schema
      items: finalOrderItems,
      totalPrice: calculatedTotalPrice,
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
    req.app.get("io").emit("newOrder", populatedOrder);
    
    res.status(201).json(populatedOrder);
    
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * @desc    Get all orders (admin/kitchen view)
 * @route   GET /api/orders
 * @access  Private (protect, allowRoles('admin', 'kitchen'))
 */
router.get("/", protect, allowRoles('admin', 'kitchen'), async (req, res) => {
  try {
    const { status, view, lastDays, dateFrom, dateTo } = req.query;
    let filter = {};

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
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

/**
 * @desc    Get all orders for a specific table
 * @route   GET /api/orders/table/:tableNumber
 * @access  Public (customer view)
 */
router.get("/table/:tableNumber", async (req, res) => {
  try {
    const table = await Table.findOne({ tableNumber: Number(req.params.tableNumber) });
    if (!table) return res.status(404).json({ error: "Table not found" });

    const orders = await Order.find({
      tableNumber: table.tableNumber,
      paymentStatus: { $ne: "Completed" }
    }).populate("items.menuItem").sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to get orders" });
  }
});

/**
 * @desc    Update order status
 * @route   PUT /api/orders/:id/status
 * @access  Private (protect, allowRoles('admin', 'kitchen'))
 */
router.put("/:id/status", protect, allowRoles('admin', 'kitchen'), async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: "Status is required." });

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("items.menuItem");

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    req.app.get("io").emit("orderStatusUpdated", updatedOrder);

    if (updatedOrder.status === "Completed") {
      req.app.get("io").emit("orderCompleted", updatedOrder);
    }
    
    res.json(updatedOrder);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to update order status" });
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
    if (!table) return res.status(404).json({ error: "Table not found" });

    const updatedOrders = await Order.updateMany(
      { tableNumber: table.tableNumber, paymentStatus: { $ne: "Completed" } },
      { paymentStatus: "Requested", paymentRequestedAt: new Date() }
    );
    
    const orders = await Order.find({ tableNumber: table.tableNumber, paymentStatus: "Requested" })
      .populate("items.menuItem");

    req.app.get("io").emit("paymentRequestedBulk", { tableId: table.tableNumber, orders });

    res.json({ message: "Payment requested for all unpaid orders", orders });
  } catch (err) {
    console.error("Failed to request bulk payment", err);
    res.status(500).json({ error: "Failed to request bulk payment" });
  }
});


/**
 * @desc    Admin marks all orders for a table as paid
 * @route   PUT /api/orders/table/:tableNumber/payment-complete-all
 * @access  Private (protect, allowRoles('admin'))
 */
router.put("/table/:tableNumber/payment-complete-all", protect, allowRoles('admin'), async (req, res) => {
  try {
    const tableNum = Number(req.params.tableNumber);
    const table = await Table.findOne({ tableNumber: tableNum });
    if (!table) return res.status(404).json({ error: "Table not found" });

    const updatedOrders = await Order.updateMany(
      { tableNumber: table.tableNumber, paymentStatus: { $ne: "Completed" } },
      { paymentStatus: "Completed", paymentCompletedAt: new Date() }
    );

    await Table.findByIdAndUpdate(table._id, {
      status: "Available",
      currentOrder: null,
    });

    req.app.get("io").emit("paymentCompletedBulk", { tableId: table.tableNumber, orderIds: updatedOrders.modifiedCount });

    res.json({ message: "All orders marked as paid", updatedCount: updatedOrders.modifiedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to mark payment complete for table" });
  }
});

// The previous two PUT routes for single order payment request/complete are now redundant
// as the bulk routes cover the main use cases. If you want to keep them,
// ensure they are properly protected.

export default router;