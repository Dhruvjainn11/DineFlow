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
router.post(
  '/', 
  protect, 
  checkSubscription, 
  checkPlanLimits('createTable'), 
  checkPermission('canManageTables'), 
  validateTableCreation, 
  handleValidationErrors,
  async (req, res) => {
    try {
      const { tableNumber, cafeId } = req.body;
      const { user } = req;

      console.log("Received table creation request:", req.body);
      console.log("User making request:", user.username, user.role);
      
      // Resolve correct cafe
      let resolvedCafeId = cafeId;
      if (!user.isSuperAdmin()) {
        if (!user.cafeId) {
          return res.status(400).json({ 
            success: false,
            message: 'Cafe association required' 
          });
        }
        resolvedCafeId = user.cafeId._id || user.cafeId;
      }

      const cafe = await Cafe.findById(resolvedCafeId);
      if (!cafe) {
        return res.status(404).json({ message: 'Cafe not found' });
      }

      // Prevent duplicate tables
      const existingTable = await Table.findOne({ 
        cafeId: resolvedCafeId, 
        tableNumber 
      });
      if (existingTable) {
        return res.status(400).json({ message: 'Table already exists in this cafe' });
      }

      // Create new table
      const newTable = new Table({
        tableNumber,
        cafeId: resolvedCafeId,
        createdBy: user._id
      });

      // QR Code Data
      const qrData = newTable.getQRCodeData(cafe);

      // Default QR styling (safeguard if method not implemented)
      const qrOptions = newTable.getQRCodeOptions?.(cafe) || {
        color: { dark: '#000000', light: '#ffffff' },
        width: 300,
        margin: 1,
        errorCorrectionLevel: 'M'
      };

      // Generate QR Code with timeout (5s)
      try {
        newTable.qrCode = await Promise.race([
          QRCode.toDataURL(qrData.url, qrOptions),
          new Promise((_, reject) => setTimeout(() => reject(new Error('QR code generation timeout')), 5000))
        ]);
      } catch (qrError) {
        console.error('QR code generation failed:', qrError.message);

        // Fallback placeholder with unique table info
        newTable.qrCode = `data:image/svg+xml;base64,${Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
             <rect width="200" height="200" fill="white"/>
             <text x="100" y="100" font-size="20" text-anchor="middle" fill="black">
               Table ${tableNumber}
             </text>
           </svg>`
        ).toString('base64')}`;
      }

      // Attach QR metadata
      newTable.qrCodeUrl = qrData.url;
      newTable.qrCodeType = qrData.isPremium ? 'premium' : 'basic';
      newTable.qrCodeStyling = qrData.styling;

      // Save
      await newTable.save();

      // Emit socket update
      const io = req.app.get('io');
      if (io) {
        io.to(`cafe-${resolvedCafeId.toString()}`).emit('tableCreated', newTable);
      }

      res.status(201).json({
        success: true,
        message: 'Table created successfully',
        data: await Table.findById(newTable._id).populate('cafeId', 'name location')
      });
    } catch (error) {
      console.error('Error creating table:', error.stack || error);
      res.status(500).json({ 
        success: false,
        message: 'Server error', 
        error: error.message 
      });
    }
  }
);

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private (Admin, Cafe Admin with table management permission)
router.put('/:id', 
  protect, 
  checkSubscription, 
  checkPlanLimits('manageTable'),
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
  checkPlanLimits('manageTable'),
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
    
    // Perform hard delete
    await Table.findByIdAndDelete(req.params.id);
    
    // Emit Socket.IO event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('tableDeleted', req.params.id);
    
    res.json({
      success: true,
      message: 'Table deleted successfully',
      data: {
        _id: req.params.id
      }
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

// @desc    Generate QR code for a table (background task)
// @route   PUT /api/tables/:id/generate-qr
// @access  Private (Admin, Cafe Admin with table management permission)
router.put('/:id/generate-qr', 
  protect, 
  checkSubscription, 
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
    
    // Get cafe details for QR generation
    const cafe = await Cafe.findById(userCafeId);
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }
    
    // Generate QR code with extended timeout for background process
    const qrData = existingTable.getQRCodeData(cafe);
    
    try {
      const qrCodeDataUrl = await Promise.race([
        QRCode.toDataURL(qrData.url, {
          errorCorrectionLevel: qrData.styling.errorCorrectionLevel,
          color: {
            dark: qrData.styling.primaryColor,
            light: qrData.styling.backgroundColor
          },
          width: qrData.styling.size,
          margin: qrData.styling.margin
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('QR generation timeout')), 10000) // 10s timeout for background
        )
      ]);
      
      // Update table with new QR code
      existingTable.qrCode = qrCodeDataUrl;
      existingTable.qrCodeUrl = qrData.url;
      existingTable.qrCodeType = qrData.isPremium ? 'premium' : 'basic';
      await existingTable.save();
      
      res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          qrCode: qrCodeDataUrl,
          qrCodeUrl: qrData.url,
          qrCodeType: existingTable.qrCodeType
        }
      });
      
    } catch (qrError) {
      console.error('Background QR generation failed:', qrError.message);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: qrError.message
      });
    }
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to generate QR code',
      error: error.message 
    });
  }
});

export default router;
