// server/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import Table from "../models/Table.js";
import MenuItem from "../models/Menu.js";
import { protect, allowRoles } from "../middleware/authMiddleware.js";

const router = express.Router();

// Place a new order
router.post("/", async (req, res) => {
  try {
    const { tableNumber, items } = req.body;
    
    // Convert to number if needed
    const tableNum = Number(tableNumber);
    
    // Find table by number (not _id)
    const table = await Table.findOne({ tableNumber: tableNum });
    if (!table) {
      return res.status(404).json({ error: `Table ${tableNum} not found` });
    }

    // Rest of your order processing...
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
    
    let totalPrice = 0;
    items.forEach(orderItem => {
      const menuItem = menuItems.find(mi => mi._id.toString() === orderItem.menuItem);
      if (menuItem) totalPrice += menuItem.price * orderItem.quantity;
    });

    const newOrder = new Order({
      tableNumber: table._id, // Use table's ObjectId
      items,
      totalPrice
    });

    await Table.findByIdAndUpdate(table._id, {
      status: "Occupied",
      currentOrder: newOrder._id
    });

    // emit real time update for placing order 
    const populatedOrder = await newOrder.populate("tableNumber items.menuItem")
    const io = req.app.get("io");
io.emit("newOrder", populatedOrder);

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
    
  } catch (err) {
    console.error("Error placing order:", err);
    res.status(500).json({ error: err.message });
  }
});

// 🔒 Get all orders (for kitchen or admin)
router.get("/", async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: { $ne: "Completed" } , status: { $ne: "Completed" }})
      .populate("tableNumber")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});
// 🔒 Get all orders (for admin)
router.get("/payment", async (req, res) => {
  try {
    const orders = await Order.find({ paymentStatus: { $ne: "Completed" }})
      .populate("tableNumber")
      .populate("items.menuItem")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// Get orders for a table (used by customers)
router.get("/:tableNumber", async (req, res) => {
  try {
    const orders = await Order.find({
      tableNumber: req.params.tableNumber,
    }).populate("items.menuItem");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to get orders" });
  }
});

router.get("/:id/orders", async (req, res) => {
  const { id } = req.params;

  // First get the table's _id from the tableNumber
  const table = await Table.findOne({ tableNumber: id });
  if (!table) return res.status(404).json({ error: "Table not found" });

  // Then find all orders associated with this table
  const orders = await Order.find({ tableNumber: table._id , paymentStatus: { $ne: "Completed" }  })
    .populate("items.menuItem")
    .sort({ createdAt: -1 });

  res.json(orders);
});


// Update order status (used by kitchen/admin)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Emit real-time update using io

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// PUT /orders/:id/status
router.put("/:id/status", async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    
    { status },
    { new: true }
  ).populate("tableNumber items.menuItem");

  req.app.get("io").emit("orderUpdated", order);

  const io = req.app.get("io");
  io.emit("orderStatusUpdated", order); // 📢 send to all clients

  if (order.status === "Completed") {
    console.log("Emitting orderStatusUpdated with:", order);
    io.emit("orderCompleted", order);
  }

  res.json(order);
});

// GET /orders?status=Pending,In Progress
router.get("/", async (req, res) => {
  const statuses = req.query.status?.split(",") || [];
  const filter = statuses.length ? { status: { $in: statuses } } : {};

  const orders = await Order.find(filter)
    .populate("tableNumber items.menuItem")
    .sort({ createdAt: -1 });

  res.json(orders);
});

// GET /orders?view=payment
router.get("/", async (req, res) => {
 try {
    const { view } = req.query;

    if (view === "payment") {
      const orders = await Order.find({
        paymentStatus: { $ne: "Completed" } // 👈 exclude completed
      })
        .populate("tableNumber")
        .sort({ updatedAt: -1 });

      return res.json(orders);
    }

    // fallback if view is not "payment"
    res.status(400).json({ message: "Invalid view parameter" });
  } catch (err) {
    console.error("Error fetching admin payment orders", err);
    res.status(500).json({ message: "Server error" });
  }
});


// Customer requests payment
router.put("/:id/request-payment", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "Requested",
        paymentRequestedAt: new Date(),
      },
      { new: true }
    ).populate("tableNumber items.menuItem");

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Emit event for admin notification
    const io = req.app.get("io");
    io.emit("paymentRequested", updatedOrder);
    console.log(updatedOrder);
    

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to request payment" });
  }
});

// Admin marks payment completed
router.put("/:id/payment-complete", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        paymentStatus: "Completed",
        paymentCompletedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Optionally, update table status to Available

    await Table.findOneAndUpdate(
      { currentOrder: updatedOrder._id },
      { status: "Available", currentOrder: null }
    );

    // Emit event for frontend update
    const io = req.app.get("io");
    io.emit("paymentCompleted", updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: "Failed to complete payment" });
  }
});

export default router;
