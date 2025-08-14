// server/routes/tableRoutes.js
import express from 'express';
import Table from '../models/Table.js';
import Cafe from '../models/Cafe.js';
import Order from '../models/Order.js';
import QRCode from 'qrcode';
import { protect, checkPermission, ensureCafeAccess, checkSubscription, checkPlanLimits } from '../middleware/authMiddleware.js';
import { 
  validateTableCreation, 
  validateTableUpdate, 
  validateObjectId, 
  handleValidationErrors 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// @desc    Get all tables for a cafe
// @route   GET /api/tables
// @access  Private (Admin, Cafe Admin, Kitchen, Waiter)
router.get('/', protect, checkSubscription, async (req, res) => {
  try {
    const { cafeId } = req.query;
    
    // Build filter based on user role
    let filter = {};
    if (req.user.isSuperAdmin()) {
      if (cafeId) filter.cafeId = cafeId;
    } else {
      filter.cafeId = req.user.cafeId._id;
    }
    
    if (!filter.cafeId && !req.user.isSuperAdmin()) {
      return res.status(400).json({
        success: false,
        message: 'cafeId is required'
      });
    }
    
    const tables = await Table.find(filter)
      .populate('currentOrder')
      .populate('cafeId', 'name features')
      .sort({ sortOrder: 1, tableNumber: 1 });
    
    res.json({
      success: true,
      data: tables,
      count: tables.length
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch tables',
      error: error.message 
    });
  }
});

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private (Admin, Cafe Admin with table management permission)
router.post('/', 
  protect, 
  checkSubscription, 
  checkPlanLimits,
  checkPermission('canManageTables'), 
  validateTableCreation, 
  async (req, res) => {
  try {
    const { tableNumber, tableName, capacity, location, cafeId } = req.body;
    
    // Determine cafe ID
    const userCafeId = req.user.isSuperAdmin() ? cafeId : req.user.cafeId._id;
    
    if (!userCafeId) {
      return res.status(400).json({
        success: false,
        message: 'Cafe ID is required'
      });
    }
    
    // Get cafe details for QR generation
    const cafe = await Cafe.findById(userCafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }
    
    // Check if table number already exists for this cafe
    const existingTable = await Table.findOne({ 
      cafeId: userCafeId, 
      tableNumber 
    });
    
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table ${tableNumber} already exists for this cafe`
      });
    }
    
    // Create table
    const tableData = {
      cafeId: userCafeId,
      tableNumber,
      tableName: tableName || '',
      capacity: capacity || 4,
      location: location || '',
      status: 'Available',
      isActive: true
    };
    
    const newTable = new Table(tableData);
    
    // Generate QR code
    const qrData = newTable.getQRCodeData(cafe);
    const qrCodeDataUrl = await QRCode.toDataURL(qrData.url, {
      errorCorrectionLevel: qrData.styling.errorCorrectionLevel,
      color: {
        dark: qrData.styling.primaryColor,
        light: qrData.styling.backgroundColor
      },
      width: qrData.styling.size,
      margin: qrData.styling.margin
    });
    
    newTable.qrCode = qrCodeDataUrl;
    newTable.qrCodeUrl = qrData.url;
    newTable.qrCodeType = qrData.isPremium ? 'premium' : 'basic';
    
    const savedTable = await newTable.save();
    
    // Populate for response
    await savedTable.populate('cafeId', 'name features');
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('tableCreated', savedTable);
    
    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: savedTable
    });
    
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create table',
      error: error.message 
    });
  }
});

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private (Admin, Cafe Admin with table management permission)
router.put('/:id', 
  protect, 
  checkSubscription, 
  checkPlanLimits,
  checkPermission('canManageTables'), 
  validateTableUpdate, 
  async (req, res) => {
  try {
    const { status, currentOrder, tableName, capacity, location, sortOrder } = req.body;
    
    // Find existing table and verify ownership
    const existingTable = await Table.findById(req.params.id);
    if (!existingTable) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    // Check cafe ownership
    const userCafeId = req.user.isSuperAdmin() ? existingTable.cafeId : req.user.cafeId._id;
    if (existingTable.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this table'
      });
    }
    
    // Build update object
    const updateData = {};
    if (status) updateData.status = status;
    if (currentOrder !== undefined) updateData.currentOrder = currentOrder;
    if (tableName !== undefined) updateData.tableName = tableName;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (location !== undefined) updateData.location = location;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    
    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('currentOrder').populate('cafeId', 'name features');
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('tableUpdated', updatedTable);
    
    res.json({
      success: true,
      message: 'Table updated successfully',
      data: updatedTable
    });
    
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update table',
      error: error.message 
    });
  }
});

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private (Admin, Cafe Admin with table management permission)
router.delete('/:id', 
  protect, 
  checkSubscription, 
  checkPlanLimits,
  checkPermission('canManageTables'), 
  validateObjectId('id'),
  handleValidationErrors,
  async (req, res) => {
  try {
    // Find existing table and verify ownership
    const existingTable = await Table.findById(req.params.id);
    if (!existingTable) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    // Check cafe ownership
    const userCafeId = req.user.isSuperAdmin() ? existingTable.cafeId : req.user.cafeId._id;
    if (existingTable.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this table'
      });
    }
    
    // Check if table has active orders
    if (existingTable.currentOrder && existingTable.currentOrder.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete table with active orders. Please complete all orders first.'
      });
    }
    
    // Soft delete - mark as inactive instead of hard delete
    existingTable.isActive = false;
    existingTable.status = 'Maintenance';
    await existingTable.save();
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('tableDeleted', req.params.id);
    
    res.json({
      success: true,
      message: 'Table deactivated successfully'
    });
    
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete table',
      error: error.message 
    });
  }
});

// @desc    Get current order for a table (Public for customers)
// @route   GET /api/tables/:id/current-order
// @access  Public (for customer view)
router.get('/:id/current-order', 
  validateObjectId('id'),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find table by ID (not table number for security)
    const table = await Table.findById(id).populate('currentOrder');
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    if (!table.currentOrder || table.currentOrder.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No current order for this table'
      });
    }
    
    // Get the most recent order
    const currentOrderId = Array.isArray(table.currentOrder) 
      ? table.currentOrder[table.currentOrder.length - 1] 
      : table.currentOrder;
    
    const order = await Order.findById(currentOrderId)
      .populate('items.menuItem')
      .populate('cafeId', 'name theme settings');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        table: {
          id: table._id,
          number: table.tableNumber,
          name: table.tableName,
          status: table.status
        },
        order
      }
    });
    
  } catch (error) {
    console.error('Error fetching current order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch current order',
      error: error.message 
    });
  }
});

export default router;
