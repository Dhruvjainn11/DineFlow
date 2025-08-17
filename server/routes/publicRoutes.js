// server/routes/publicRoutes.js
import express from 'express';
import Table from '../models/Table.js';
import Cafe from '../models/Cafe.js';
import Menu from '../models/Menu.js';

const router = express.Router();

// @desc    Get cafe and table info for QR scan
// @route   GET /api/public/cafe/:cafeId/table/:tableId
// @access  Public
router.get('/cafe/:cafeId/table/:tableId', async (req, res) => {
  try {
    const { cafeId, tableId } = req.params;
    
    // Find table and populate cafe info
    const table = await Table.findById(tableId).populate('cafeId');
    
    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }
    
    // Verify table belongs to the specified cafe
    if (table.cafeId._id.toString() !== cafeId) {
      return res.status(400).json({
        success: false,
        message: 'Table does not belong to this cafe'
      });
    }
    
    // Get cafe menu
    const menuItems = await Menu.find({ cafeId }).populate('category');
    
    res.json({
      success: true,
      data: {
        cafe: {
          id: table.cafeId._id,
          name: table.cafeId.name,
          theme: table.cafeId.theme,
          settings: table.cafeId.settings
        },
        table: {
          id: table._id,
          number: table.tableNumber,
          name: table.tableName,
          status: table.status
        },
        menu: menuItems
      }
    });
    
  } catch (error) {
    console.error('Error fetching cafe/table info:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

export default router;