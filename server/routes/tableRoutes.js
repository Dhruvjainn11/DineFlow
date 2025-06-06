// server/routes/tableRoutes.js
import express from 'express';
import Table from '../models/Table.js';
import QRCode  from 'qrcode'; // Assuming you have a QR code generation library

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
  const qrText = `localhost:5130//yourapp.com/table/${tableNumber}`; // Adjust this URL as needed

   const qrCodeDataUrl = await QRCode.toDataURL(qrText);

    const newTable = new Table({ tableNumber, qrCode:qrCodeDataUrl });
    const saved = await newTable.save();
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
    res.json({ message: 'Table deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete table' });
  }
});

export default router;
