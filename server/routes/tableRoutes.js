// server/routes/tableRoutes.js
import express from 'express';
import Table from '../models/Table.js';
import QRCode  from 'qrcode';
import Order from '../models/Order.js'; // Assuming you have a QR code generation library

const router = express.Router();

// ✅ GET all tables
router.get('/', async (req, res) => {
  try {
    const tables = await Table.find().populate('currentOrder');
    res.json(tables);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

// ➕ POST create a new table
router.post('/', async (req, res) => {
  try {
    const { tableNumber } = req.body;

    // Create the URL or unique identifier to encode in QR
  const qrText = `http://192.168.31.34:5173/table/${tableNumber}`; // Adjust this URL as needed

   const qrCodeDataUrl = await QRCode.toDataURL(qrText);

    const newTable = new Table({ tableNumber, qrCode:qrCodeDataUrl });
    const saved = await newTable.save();

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('tableCreated', newTable);  // broadcast to all clients

    res.status(201).json(saved);
  } catch (err) {    
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// 📝 PUT update a table (status/order)
router.put('/:id', async (req, res) => {
  try {
    const { status, currentOrder } = req.body;

    const updated = await Table.findByIdAndUpdate(
      req.params.id,
      { status, currentOrder },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Table not found' });
    }

    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('tableUpdated', updated);  // broadcast to all clients

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update table' });
  }
});

// ❌ DELETE a table
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Table.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Table not found' });
    }
    // Emit Socket.IO event
    const io = req.app.get('io');
    io.emit('tableDeleted', deleted);  // broadcast to all clients
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

router.get("/:id/current-order", async (req, res) => {
  const { id } = req.params;
  const table = await Table.findOne({ tableNumber: id }).populate("currentOrder");
  if (!table || !table.currentOrder) return res.status(404).json({ error: "No current order" });

  const order = await Order.findById(table.currentOrder)
    .populate("items.menuItem")
    .populate("tableNumber");

  res.json(order);
});

export default router;
