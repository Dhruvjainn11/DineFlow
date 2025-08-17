// server/routes/menuRoutes.js
import express from 'express';
import MenuItem from '../models/Menu.js';
import Category from '../models/Category.js';
import multer from 'multer';
import { protect, checkPermission, ensureCafeAccess, checkSubscription, checkPlanLimits } from '../middleware/authMiddleware.js';
import { 
  validateMenuCreation, 
  validateMenuUpdate, 
  validateObjectId, 
  validateCafeId,
  handleValidationErrors 
} from '../middleware/validationMiddleware.js';

const router = express.Router();
const textUpload = multer();

// @desc    Get all menu items for a cafe
// @route   GET /api/menu?cafeId=:cafeId (public for customers)
// @route   GET /api/menu (authenticated for admin)
// @access  Public for customers, Private for admin
router.get('/', 
  validateCafeId(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { cafeId, category, available, search, popular, tags } = req.query;
    
    // Build filter object
    let filter = {};
    
    // Check if this is an authenticated request
    const isAuthenticated = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    
    if (isAuthenticated) {
      // This is an admin request - require authentication
      try {
        await new Promise((resolve, reject) => {
          protect(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        // Admin users see their cafe's menu
        if (!req.user.isSuperAdmin()) {
          filter.cafeId = req.user.cafeId._id;
        } else if (cafeId) {
          filter.cafeId = cafeId;
        }
      } catch (authError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed' 
        });
      }
    } else {
      // This is a public customer request - require cafeId
      if (!cafeId) {
        return res.status(400).json({
          success: false,
          message: 'cafeId is required for public access'
        });
      }
      filter.cafeId = cafeId;
    }
    
    // Apply additional filters
    if (category) filter.category = category;
    if (available !== undefined) filter.available = available === 'true';
    if (popular === 'true') filter.isPopular = true;
    if (tags) filter.tags = { $in: tags.split(',') };
    
    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const menuItems = await MenuItem.find(filter)
      .populate('category', 'name description imageUrl')
      .populate('cafeId', 'name theme settings')
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    
    res.json({
      success: true,
      data: menuItems,
      count: menuItems.length
    });
    
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching menu items', 
      error: error.message 
    });
  }
});

// @desc    Get a single menu item by ID
// @route   GET /api/menu/:id?cafeId=:cafeId (public for customers)
// @route   GET /api/menu/:id (authenticated for admin)
// @access  Public for customers, Private for admin
router.get('/:id', 
  validateObjectId('id'),
  validateCafeId(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { cafeId } = req.query;
    let filter = { _id: req.params.id };
    
    // Check if this is an authenticated request
    const isAuthenticated = req.headers.authorization && req.headers.authorization.startsWith('Bearer');
    
    if (isAuthenticated) {
      try {
        await new Promise((resolve, reject) => {
          protect(req, res, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        
        if (!req.user.isSuperAdmin()) {
          filter.cafeId = req.user.cafeId._id;
        } else if (cafeId) {
          filter.cafeId = cafeId;
        }
      } catch (authError) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication failed' 
        });
      }
    } else {
      if (!cafeId) {
        return res.status(400).json({
          success: false,
          message: 'cafeId is required for public access'
        });
      }
      filter.cafeId = cafeId;
    }
    
    const menuItem = await MenuItem.findOne(filter)
      .populate('category', 'name description imageUrl')
      .populate('cafeId', 'name theme settings');
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    res.json({
      success: true,
      data: menuItem
    });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching menu item', 
      error: error.message 
    });
  }
});

// @desc    Create a menu item (supports sizes and ingredients)
// @route   POST /api/menu
// @access  Private (Admin, Cafe Admin with menu management permission)
router.post('/', protect, checkSubscription, checkPlanLimits('createMenuItem'), checkPermission('canManageMenu'), validateMenuCreation, express.json(), async (req, res) => {
  try {
    let { name, description, price, imageUrl, category, available, jain, sizes, ingredients, tags, preparationTime, spicyLevel, isPopular, isSpecial } = req.body;
    
    console.log("Request Body:", req.body);
    
    // Basic validation is now handled by validateMenuCreation middleware
    
    // Verify category belongs to the same cafe
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(400).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    const userCafeId = req.user.isSuperAdmin() ? categoryDoc.cafeId : req.user.cafeId._id;
    if (categoryDoc.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Category does not belong to your cafe'
      });
    }
    
    // Parse sizes from JSON string to array
    let parsedSizes = [];
if (sizes && Array.isArray(sizes)) {
  parsedSizes = sizes; // Already an array
}
    
    // Validate pricing - must have either base price or sizes
    if (!price && (!parsedSizes || parsedSizes.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Either base price or at least one size must be provided'
      });
    }
    
    // Validate sizes if provided
    if (parsedSizes && Array.isArray(parsedSizes)) {
      for (const size of parsedSizes) {
        if (!size.label || typeof size.price !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each size must have a label and a numeric price'
          });
        }
      }
    }
    
    // Convert ingredients string to array
    const ingredientsArray = ingredients
      ? ingredients.split(',').map(item => item.trim()).filter(item => item)
      : [];
      
    // Convert tags string to array
    const tagsArray = tags
      ? tags.split(',').map(item => item.trim()).filter(item => item)
      : [];
    
    // Create menu item data
    const menuItemData = {
      name,
      description: description || '',
      ingredients: ingredientsArray,
      price: price ? parseFloat(price) : 0,
      imageUrl: imageUrl || '',
      category,
      cafeId: userCafeId,
      available: available === 'true' || available === true,
      jain: jain === 'true' || jain === true,
      sizes: parsedSizes,
      tags: tagsArray,
      preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
      spicyLevel: spicyLevel ? parseInt(spicyLevel) : 0,
      isPopular: isPopular === 'true' || isPopular === true,
      isSpecial: isSpecial === 'true' || isSpecial === true
    };
    
    const newMenuItem = new MenuItem(menuItemData);
    const savedMenuItem = await newMenuItem.save();
    
    // Populate the saved item for response
    await savedMenuItem.populate('category', 'name description');
    
    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('menuCreated', savedMenuItem);
    
    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      data: savedMenuItem
    });
    
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating menu item', 
      error: error.message 
    });
  }
});
  
// @desc    Update a menu item
// @route   PUT /api/menu/:id
// @access  Private (Admin, Cafe Admin with menu management permission)
router.put('/:id', protect, checkSubscription, checkPermission('canManageMenu'), validateMenuUpdate, express.json(), async (req, res) => {
  try {
    let { name, description, price, imageUrl, category, available, jain, sizes, ingredients, tags, preparationTime, spicyLevel, isPopular, isSpecial } = req.body;

    // First, find the existing menu item and verify ownership
    const existingMenuItem = await MenuItem.findById(req.params.id);
    if (!existingMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check cafe ownership
    const userCafeId = req.user.isSuperAdmin() ? existingMenuItem.cafeId : req.user.cafeId._id;
    if (existingMenuItem.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this menu item'
      });
    }

    // Basic validation is now handled by validateMenuUpdate middleware

    // If category is being updated, verify it belongs to the same cafe
    if (category && category !== existingMenuItem.category.toString()) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc || categoryDoc.cafeId.toString() !== userCafeId.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category or category does not belong to your cafe'
        });
      }
    }

    // Parse sizes from JSON string to array
     let parsedSizes = [];
    if (sizes && Array.isArray(sizes)) {
      parsedSizes = sizes; // Already an array
    } else if (sizes && typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sizes format'
        });
      }
    }

    // Validate pricing - must have either base price or sizes
    if (!price && (!parsedSizes || parsedSizes.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Either base price or at least one size must be provided'
      });
    }

    // Validate sizes if provided
    if (parsedSizes && Array.isArray(parsedSizes)) {
      for (const size of parsedSizes) {
        if (!size.label || typeof size.price !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Each size must have a label and a numeric price'
          });
        }
      }
    }

    // Convert ingredients and tags strings to arrays
    const ingredientsArray = ingredients
      ? ingredients.split(',').map(item => item.trim()).filter(item => item)
      : [];
      
    const tagsArray = tags
      ? tags.split(',').map(item => item.trim()).filter(item => item)
      : [];

    // Prepare update data
    const updateData = {
      name,
      description: description || '',
      price: price ? parseFloat(price) : 0,
      imageUrl: imageUrl || '',
      available: available === 'true' || available === true,
      jain: jain === 'true' || jain === true,
      sizes: parsedSizes,
      ingredients: ingredientsArray,
      tags: tagsArray,
      preparationTime: preparationTime ? parseInt(preparationTime) : undefined,
      spicyLevel: spicyLevel ? parseInt(spicyLevel) : 0,
      isPopular: isPopular === 'true' || isPopular === true,
      isSpecial: isSpecial === 'true' || isSpecial === true
    };

    // Add category to update if provided
    if (category) {
      updateData.category = category;
    }

    const updatedMenuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name description');

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('menuUpdated', updatedMenuItem);

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      data: updatedMenuItem
    });
    
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating menu item', 
      error: error.message 
    });
  }
});

// @desc    Delete a menu item
// @route   DELETE /api/menu/:id
// @access  Private (Admin, Cafe Admin with menu management permission)
router.delete('/:id', protect, checkSubscription, checkPermission('canManageMenu'), validateObjectId('id'), handleValidationErrors, async (req, res) => {
  try {
    // First, find the existing menu item and verify ownership
    const existingMenuItem = await MenuItem.findById(req.params.id);
    if (!existingMenuItem) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found'
      });
    }

    // Check cafe ownership
    const userCafeId = req.user.isSuperAdmin() ? existingMenuItem.cafeId : req.user.cafeId._id;
    if (existingMenuItem.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this menu item'
      });
    }

    // Delete the menu item
    await MenuItem.findByIdAndDelete(req.params.id);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('menuDeleted', req.params.id);

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting menu item', 
      error: error.message 
    });
  }
});

export default router;