// server/routes/cafeRoutes.js
import express from 'express';
import Cafe from '../models/Cafe.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { 
  validateCafeCreation, 
  validateCafeUpdate, 
  validatePaginationQuery, 
  validateObjectId 
} from '../middleware/validationMiddleware.js';

const router = express.Router();

// @desc    Create a new cafe (Super Admin only)
// @route   POST /api/cafes
// @access  Private (Super Admin)
router.post('/', protect, allowRoles('super-admin'), validateCafeCreation, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    await session.startTransaction();
    
    const {
      name,
      email,
      subdomain,
      phone,
      address,
      planType,
      theme,
      settings,
      adminUser
    } = req.body;

    console.log('=== CAFE CREATION ROUTE DEBUG ===');
    console.log('Received data:', req.body);

    // Check if cafe with email already exists
    const existingCafe = await Cafe.findOne({ email }).session(session);
    if (existingCafe) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Cafe with this email already exists'
      });
    }

    // Check if subdomain is taken (if provided)
    if (subdomain) {
      const existingSubdomain = await Cafe.findOne({ subdomain }).session(session);
      if (existingSubdomain) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: 'This subdomain is already taken'
        });
      }
    }

    // If adminUser is provided, check username uniqueness GLOBALLY
    if (adminUser && adminUser.username) {
      const existingUsername = await User.findOne({ 
        username: adminUser.username 
      }).session(session);
      
      if (existingUsername) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Username "${adminUser.username}" is already taken. Please choose a different username.`
        });
      }
    }

    // Create cafe object
    const cafeData = {
      name: name.trim(),
      email: email.trim(),
      subscription: {
        planType: planType || 'basic',
        status: 'trial'
      }
    };

    // Add optional fields only if they exist and are not empty
    if (phone && phone.trim()) {
      // Clean phone number - remove non-digits
      const cleanPhone = phone.replace(/\D/g, '');
      if (cleanPhone.length >= 10) {
        cafeData.phone = cleanPhone;
      }
    }

    if (address && typeof address === 'object') {
      const cleanAddress = {};
      Object.keys(address).forEach(key => {
        if (address[key] && address[key].toString().trim()) {
          cleanAddress[key] = address[key].toString().trim();
        }
      });
      
      // Only add address if it has at least one field
      if (Object.keys(cleanAddress).length > 0) {
        cafeData.address = cleanAddress;
      }
    }

    // Add subdomain only for Pro plan
    if (planType === 'pro' && subdomain && subdomain.trim()) {
      cafeData.subdomain = subdomain.trim();
    }

    // Add theme if provided
    if (theme) {
      cafeData.theme = theme;
    }

    // Add settings if provided
    if (settings) {
      cafeData.settings = settings;
    }

    console.log('Creating cafe with data:', cafeData);

    // Create the cafe
    const cafe = new Cafe(cafeData);
    await cafe.save({ session });

    console.log('Cafe created successfully:', cafe._id);

    let createdUser = null;

    // Admin user credentials are mandatory
    if (!adminUser || !adminUser.username || !adminUser.password) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Admin user credentials are required (username and password)'
      });
    }

    // Create cafe admin user
    const { username, password, profile } = adminUser;

    if (password.length < 6) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: 'Admin password must be at least 6 characters long'
      });
    }

      // Prepare user profile data
      const userProfile = {};
      if (profile && typeof profile === 'object') {
        if (profile.firstName && profile.firstName.trim()) {
          userProfile.firstName = profile.firstName.trim();
        }
        if (profile.lastName && profile.lastName.trim()) {
          userProfile.lastName = profile.lastName.trim();
        }
        if (profile.phone && profile.phone.trim()) {
          userProfile.phone = profile.phone.trim();
        }
      }

      console.log('Creating admin user with username:', username.trim());

      const user = new User({
        username: username.trim(),
        password: password.trim(),
        role: 'admin',
        cafeId: cafe._id,
        profile: userProfile
      });

      await user.save({ session });
      
      console.log('Admin user created successfully:', user._id);

      // Update cafe with admin user reference
      cafe.adminUser = user._id;
      await cafe.save({ session });
      
      // Store user for response (without password)
      createdUser = {
        _id: user._id,
        username: user.username,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt
      };
    
 
    // Commit the transaction
    await session.commitTransaction();

    // Prepare response data
    const responseData = {
      _id: cafe._id,
      name: cafe.name,
      email: cafe.email,
      phone: cafe.phone,
      address: cafe.address,
      subdomain: cafe.subdomain,
      subscription: cafe.subscription,
      theme: cafe.theme,
      settings: cafe.settings,
      adminUser: createdUser,
      createdAt: cafe.createdAt,
      updatedAt: cafe.updatedAt
    };

    console.log('=== CAFE CREATION SUCCESS ===');
    console.log('Response data:', responseData);

    res.status(201).json({
      success: true,
      message: 'Cafe created successfully',
      data: responseData
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('=== CAFE CREATION ERROR ===');
    console.error('Error creating cafe:', error);
    console.error('Error stack:', error.stack);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue)[0];
      const duplicateValue = error.keyValue[duplicateField];
      
      let message;
      switch (duplicateField) {
        case 'email':
          message = 'A cafe with this email already exists';
          break;
        case 'username':
          message = `Username "${duplicateValue}" is already taken. Please choose a different username.`;
          break;
        case 'subdomain':
          message = 'This subdomain is already taken';
          break;
        default:
          message = `${duplicateField} "${duplicateValue}" is already in use`;
      }

      return res.status(400).json({
        success: false,
        message: message,
        error: 'Duplicate key error'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      message: 'Failed to create cafe',
      error: error.message
    });
  } finally {
    await session.endSession();
  }
});
// @desc    Get all cafes (Super Admin only)
// @route   GET /api/cafes
// @access  Private (Super Admin)
router.get('/', protect, allowRoles('super-admin'), validatePaginationQuery, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      planType,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (planType) {
      filter['subscription.planType'] = planType;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch cafes
    const cafes = await Cafe.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-paymentDetails') // Exclude sensitive payment details
      .lean();

    // Get total count for pagination
    const total = await Cafe.countDocuments(filter);

    res.json({
      success: true,
      data: {
        cafes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalCafes: total,
          hasNext: skip + parseInt(limit) < total,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching cafes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cafes',
      error: error.message
    });
  }
});

// @desc    Get cafe by ID
// @route   GET /api/cafes/:id
// @access  Private (Super Admin or Cafe Admin)
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the actual cafe ID - handle both populated and non-populated cases
    const userCafeId = req.user.cafeId?._id?.toString() || req.user.cafeId?.toString();
    
    // Check if user is super admin or cafe admin of this cafe
    if (!req.user.isSuperAdmin() && userCafeId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cafe = await Cafe.findById(id);
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Remove sensitive payment details for non-super admins
    const cafeData = cafe.toObject();
    if (!req.user.isSuperAdmin()) {
      delete cafeData.paymentDetails;
    }

    res.json({
      success: true,
      data: cafeData
    });

  } catch (error) {
    console.error('Error fetching cafe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cafe',
      error: error.message
    });
  }
});

// @desc    Update cafe
// @route   PUT /api/cafes/:id
// @access  Private (Super Admin or Cafe Admin)
router.put('/:id', protect, validateCafeUpdate, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the actual cafe ID - handle both populated and non-populated cases
    const userCafeId = req.user.cafeId?._id?.toString() || req.user.cafeId?.toString();
    
    // Check if user is super admin or cafe admin of this cafe
    if (!req.user.isSuperAdmin() && userCafeId !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cafe = await Cafe.findById(id);
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    const {
      name,
      email,
      subdomain,
      phone,
      address,
      theme,
      settings,
      paymentDetails,
      subscription,
      status
    } = req.body;

    // Update basic info
    if (name) cafe.name = name;
    if (email) cafe.email = email;
    if (phone) cafe.phone = phone;
    if (address) cafe.address = { ...cafe.address, ...address };

    // Update theme (only if cafe has theme customization feature)
    if (theme && cafe.hasFeature('themeCustomization')) {
      cafe.theme = { ...cafe.theme, ...theme };
    }

    // Update settings
    if (settings) {
      cafe.settings = { ...cafe.settings, ...settings };
    }

    // Update payment details (only for cafe admins of pro plans or super admins)
    if (paymentDetails && (req.user.isSuperAdmin() || 
        (req.user.role === 'admin' && cafe.hasFeature('onlinePayments')))) {
      cafe.paymentDetails = { ...cafe.paymentDetails, ...paymentDetails };
    }

    // Update subdomain (only for pro plan and super admin)
    if (subdomain && req.user.isSuperAdmin() && cafe.subscription.planType === 'pro') {
      // Check if subdomain is taken
      const existingSubdomain = await Cafe.findOne({ 
        subdomain, 
        _id: { $ne: id } 
      });
      if (existingSubdomain) {
        return res.status(400).json({ 
          success: false, 
          message: 'This subdomain is already taken' 
        });
      }
      cafe.subdomain = subdomain;
    }

    // Update subscription (only super admin)
    if (subscription && req.user.isSuperAdmin()) {
      cafe.subscription = { ...cafe.subscription, ...subscription };
    }

    // Update status (only super admin)
    if (status && req.user.isSuperAdmin()) {
      cafe.status = status;
    }

    await cafe.save();

    // Remove sensitive data from response
    const responseData = cafe.toObject();
    if (!req.user.isSuperAdmin()) {
      delete responseData.paymentDetails;
    }

    res.json({
      success: true,
      message: 'Cafe updated successfully',
      data: responseData
    });

  } catch (error) {
    console.error('Error updating cafe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update cafe',
      error: error.message
    });
  }
});

// @desc    Delete cafe (Super Admin only)
// @route   DELETE /api/cafes/:id
// @access  Private (Super Admin)
router.delete('/:id', protect, allowRoles('super-admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { id } = req.params;

    const cafe = await Cafe.findById(id);
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Soft delete - just mark as inactive
    cafe.status = 'inactive';
    await cafe.save();

    // Also deactivate all users of this cafe
    await User.updateMany(
      { cafeId: id },
      { isActive: false }
    );

    res.json({
      success: true,
      message: 'Cafe deactivated successfully'
    });

  } catch (error) {
    console.error('Error deleting cafe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete cafe',
      error: error.message
    });
  }
});

// @desc    Get cafe statistics (Super Admin only)
// @route   GET /api/cafes/stats/overview
// @access  Private (Super Admin)
router.get('/stats/overview', protect, allowRoles('super-admin'), async (req, res) => {
  try {
    const totalCafes = await Cafe.countDocuments();
    const activeCafes = await Cafe.countDocuments({ status: 'active' });
    const trialCafes = await Cafe.countDocuments({ 'subscription.status': 'trial' });
    const proCafes = await Cafe.countDocuments({ 'subscription.planType': 'pro' });
    const basicCafes = await Cafe.countDocuments({ 'subscription.planType': 'basic' });

    // Get recent cafes
    const recentCafes = await Cafe.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email subscription.planType createdAt status');

    res.json({
      success: true,
      data: {
        overview: {
          totalCafes,
          activeCafes,
          trialCafes,
          proCafes,
          basicCafes
        },
        recentCafes
      }
    });

  } catch (error) {
    console.error('Error fetching cafe statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
});

// @desc    Reactivate cafe (Super Admin only)
// @route   PUT /api/cafes/:id/reactivate
// @access  Private (Super Admin)
router.put('/:id/reactivate', protect, allowRoles('super-admin'), validateObjectId('id'), async (req, res) => {
  try {
    const { id } = req.params;

    const cafe = await Cafe.findById(id);
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Reactivate the cafe
    cafe.status = 'active';
    await cafe.save();

    // Also reactivate all users of this cafe
    await User.updateMany(
      { cafeId: id },
      { isActive: true }
    );

    res.json({
      success: true,
      message: 'Cafe reactivated successfully',
      data: cafe
    });

  } catch (error) {
    console.error('Error reactivating cafe:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate cafe',
      error: error.message
    });
  }
});

export default router;
