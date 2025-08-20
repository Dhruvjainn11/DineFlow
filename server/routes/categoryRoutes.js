// server/routes/categoryRoutes.js
import express from 'express';
import Category from '../models/Category.js';
import MenuItem from '../models/Menu.js';
import { protect, allowRoles, checkPermission, checkSubscription } from '../middleware/authMiddleware.js';
import { 
  validateCategoryCreation, 
  validateCategoryUpdate, 
  validateObjectId, 
  validateCafeId, 
  handleValidationErrors 
} from '../middleware/validationMiddleware.js';

const router = express.Router();


// @desc    Get all categories for a cafe
// @route   GET /api/categories?cafeId=:cafeId (public for customers)
// @route   GET /api/categories (authenticated for admin)
// @access  Public for customers, Private for admin
router.get('/', 
  validateCafeId(),
  handleValidationErrors,
  async (req, res) => {
  try {
    const { cafeId } = req.query;
    let filter = {};
    
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
        
        // Admin users see their cafe's categories
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
    
    const categories = await Category.find(filter)
      .sort({ sortOrder: 1, name: 1 })
      .lean();
      
    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch categories',
      error: error.message 
    });
  }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin, Cafe Admin with menu management permission)
router.post('/', protect, checkSubscription, checkPermission('canManageMenu'), validateCategoryCreation, async (req, res) => {
  try {
    const { name, description, imageUrl } = req.body;
    
    // Basic validation is now handled by validateCategoryCreation middleware
    
    const userCafeId = req.user.isSuperAdmin() ? req.body.cafeId : req.user.cafeId._id;
    
    if (!userCafeId) {
      return res.status(400).json({
        success: false,
        message: 'Cafe ID is required'
      });
    }
    
    // Check if category name already exists for this cafe
    const existingCategory = await Category.findOne({ 
      name: name.trim(), 
      cafeId: userCafeId 
    });
    
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists for your cafe'
      });
    }
    
    const categoryData = {
      name: name.trim(),
      cafeId: userCafeId,
      description: description || '',
      imageUrl: imageUrl || '',
      isActive: true
    };
    
    const newCategory = new Category(categoryData);
    const savedCategory = await newCategory.save();
    
    // Emit real-time event
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('category:created', savedCategory);
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: savedCategory
    });
    
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Emit error event for real-time updates
    const io = req.app.get('io');
    const userCafeId = req.user.isSuperAdmin() ? req.body.cafeId : req.user.cafeId._id;
    if (io && userCafeId) {
      io.to(`cafe-${userCafeId}`).emit('category:error', { message: error.message, operation: 'create' });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create category',
      error: error.message 
    });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin, Cafe Admin with menu management permission)
router.put('/:id', protect, checkSubscription, checkPermission('canManageMenu'), validateCategoryUpdate, async (req, res) => {
  try {
    const { name, description, imageUrl, isActive } = req.body;
    
    // Basic validation is now handled by validateCategoryUpdate middleware
    
    // First, find the existing category and verify ownership
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check cafe ownership
    const userCafeId = req.user.isSuperAdmin() ? existingCategory.cafeId : req.user.cafeId._id;
    if (existingCategory.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this category'
      });
    }
    
    // Check if new name conflicts with existing categories (if name is being changed)
    if (name.trim() !== existingCategory.name) {
      const nameConflict = await Category.findOne({
        name: name.trim(),
        cafeId: userCafeId,
        _id: { $ne: req.params.id }
      });
      
      if (nameConflict) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists for your cafe'
        });
      }
    }
    
    const updateData = {
      name: name.trim(),
      description: description || existingCategory.description,
      imageUrl: imageUrl !== undefined ? imageUrl : existingCategory.imageUrl,
      isActive: isActive !== undefined ? isActive : existingCategory.isActive
    };
    
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    // Emit real-time update event
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('category:updated', updatedCategory);
    
    res.json({
      success: true,
      message: 'Category updated successfully',
      data: updatedCategory
    });
    
  } catch (error) {
    console.error('Error updating category:', error);
    
    // Emit error event for real-time updates
    const io = req.app.get('io');
    const userCafeId = req.user.isSuperAdmin() ? existingCategory?.cafeId : req.user.cafeId._id;
    if (io && userCafeId) {
      io.to(`cafe-${userCafeId}`).emit('category:error', { message: error.message, operation: 'update' });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update category',
      error: error.message 
    });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin, Cafe Admin with menu management permission)
router.delete('/:id', protect, checkSubscription, checkPermission('canManageMenu'), validateObjectId('id'), handleValidationErrors, async (req, res) => {
  try {
    // First, find the existing category and verify ownership
    const existingCategory = await Category.findById(req.params.id);
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }
    
    // Check cafe ownership
    const userCafeId = req.user.isSuperAdmin() ? existingCategory.cafeId : req.user.cafeId._id;
    if (existingCategory.cafeId.toString() !== userCafeId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this category'
      });
    }
    
    // Check if category has menu items
    const menuItemsCount = await MenuItem.countDocuments({ 
      category: req.params.id 
    });
    
    if (menuItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${menuItemsCount} menu items are using this category. Please move or delete those items first.`
      });
    }
    
    // Delete the category
    await Category.findByIdAndDelete(req.params.id);
    
    // Emit real-time delete event
    const io = req.app.get('io');
    io.to(`cafe-${userCafeId}`).emit('category:deleted', req.params.id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting category:', error);
    
    // Emit error event for real-time updates
    const io = req.app.get('io');
    const userCafeId = req.user.isSuperAdmin() ? existingCategory?.cafeId : req.user.cafeId._id;
    if (io && userCafeId) {
      io.to(`cafe-${userCafeId}`).emit('category:error', { message: error.message, operation: 'delete' });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete category',
      error: error.message 
    });
  }
});

export default router;
