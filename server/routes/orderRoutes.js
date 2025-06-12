// server/routes/orderRoutes.js
import express from 'express';
import Order from '../models/Order.js';
import Table from '../models/Table.js';
import MenuItem from '../models/Menu.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Place a new order
router.post('/', async (req, res) => {
  try {
    const { tableNumber, items } = req.body;

    // Fetch all involved menu items from DB
    const menuItemIds = items.map(item => item.menuItem);
    const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });

    // Calculate totalPrice
    let totalPrice = 0;
    items.forEach(orderItem => {
      const menuItem = menuItems.find(mi => mi._id.toString() === orderItem.menuItem);
      if (menuItem) {
        totalPrice += menuItem.price * orderItem.quantity;
      }
    });

    // Create new order with totalPrice
    const newOrder = new Order({
      tableNumber,
      items,
      totalPrice,
    });

    if(newOrder){
      // Update table status to Occupied
      await Table.findByIdAndUpdate(tableNumber, {
        status: 'Occupied',
        currentOrder: newOrder._id,
      });
    }

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// 🔒 Get all orders (for kitchen or admin)
router.get('/', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('tableNumber')
      .populate('items.menuItem')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// Get orders for a table (used by customers)
router.get('/table/:tableNumber', async (req, res) => {
  try {
    const orders = await Order.find({ tableNumber: req.params.tableNumber }).populate('items.menuItem');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Update order status (used by kitchen/admin)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

     // Emit real-time update using io
    const io = req.app.get('io');
    io.emit('orderStatusUpdated', updatedOrder); // 📢 send to all clients

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// Customer requests payment
router.put('/:id/request-payment', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus: 'Requested',
        paymentRequestedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Emit event for admin notification
    const io = req.app.get('io');
    io.emit('paymentRequested', updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to request payment' });
  }
});

// Admin marks payment completed
router.put('/:id/payment-complete', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus: 'Completed',
        paymentCompletedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Optionally, update table status to Available
   
    await Table.findOneAndUpdate(
      { currentOrder: updatedOrder._id },
      { status: 'Available', currentOrder: null }
    );

    // Emit event for frontend update
    const io = req.app.get('io');
    io.emit('paymentCompleted', updatedOrder);

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete payment' });
  }
});

export default router;
