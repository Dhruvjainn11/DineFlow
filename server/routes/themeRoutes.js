import express from 'express';
import Cafe from '../models/Cafe.js';
import { protect, allowRoles } from '../middleware/authMiddleware.js';
import { validateObjectId } from '../middleware/validationMiddleware.js';

const router = express.Router();

// @desc    Get cafe theme
// @route   GET /api/theme/:cafeId
// @access  Public (for customer-side theme loading)
router.get('/:cafeId', validateObjectId('cafeId'), async (req, res) => {
  try {
    const { cafeId } = req.params;
    
    const cafe = await Cafe.findById(cafeId)
      .select('theme features name')
      .lean();
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Return theme with feature flags
    res.json({
      success: true,
      data: {
        theme: cafe.theme || {
          primaryColor: '#3B82F6',
          secondaryColor: '#F3F4F6',
          logoUrl: '',
          fontFamily: 'Inter'
        },
        features: {
          customBranding: cafe.features?.customBranding || false,
          whiteLabel: cafe.features?.whiteLabel || false
        },
        cafeName: cafe.name
      }
    });

  } catch (error) {
    console.error('Error fetching cafe theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theme',
      error: error.message
    });
  }
});

// @desc    Update cafe theme
// @route   PUT /api/theme/:cafeId
// @access  Private (Cafe Admin only)
router.put('/:cafeId', protect, validateObjectId('cafeId'), async (req, res) => {
  try {
    const { cafeId } = req.params;
    const { theme } = req.body;
    
    // Get the actual cafe ID from user
    const userCafeId = req.user.cafeId?._id?.toString() || req.user.cafeId?.toString();
    
    // Check if user is admin of this cafe or super admin
    if (!req.user.isSuperAdmin() && userCafeId !== cafeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cafe = await Cafe.findById(cafeId);
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Check if cafe has theme customization feature
    if (!cafe.hasFeature('themeCustomization') && !req.user.isSuperAdmin()) {
      return res.status(403).json({
        success: false,
        message: 'Theme customization is not available in your current plan'
      });
    }

    // Validate theme data
    const validationErrors = validateThemeData(theme);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid theme data',
        errors: validationErrors
      });
    }

    // Update theme
    cafe.theme = {
      ...cafe.theme,
      ...theme
    };

    await cafe.save();

    res.json({
      success: true,
      message: 'Theme updated successfully',
      data: {
        theme: cafe.theme
      }
    });

  } catch (error) {
    console.error('Error updating cafe theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update theme',
      error: error.message
    });
  }
});

// @desc    Reset cafe theme to default
// @route   POST /api/theme/:cafeId/reset
// @access  Private (Cafe Admin only)
router.post('/:cafeId/reset', protect, validateObjectId('cafeId'), async (req, res) => {
  try {
    const { cafeId } = req.params;
    
    // Get the actual cafe ID from user
    const userCafeId = req.user.cafeId?._id?.toString() || req.user.cafeId?.toString();
    
    // Check if user is admin of this cafe or super admin
    if (!req.user.isSuperAdmin() && userCafeId !== cafeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const cafe = await Cafe.findById(cafeId);
    
    if (!cafe) {
      return res.status(404).json({
        success: false,
        message: 'Cafe not found'
      });
    }

    // Reset to default theme
    cafe.theme = {
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      logoUrl: '',
      fontFamily: 'Inter'
    };

    await cafe.save();

    res.json({
      success: true,
      message: 'Theme reset to default successfully',
      data: {
        theme: cafe.theme
      }
    });

  } catch (error) {
    console.error('Error resetting cafe theme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset theme',
      error: error.message
    });
  }
});

// @desc    Get theme presets
// @route   GET /api/theme/presets
// @access  Public
router.get('/presets', async (req, res) => {
  try {
    const presets = [
      {
        id: 'default',
        name: 'DineFlow Blue',
        description: 'Classic blue theme',
        primaryColor: '#3B82F6',
        secondaryColor: '#F3F4F6',
        fontFamily: 'Inter'
      },
      {
        id: 'warm',
        name: 'Warm Amber',
        description: 'Cozy amber theme',
        primaryColor: '#F59E0B',
        secondaryColor: '#FEF3C7',
        fontFamily: 'Inter'
      },
      {
        id: 'elegant',
        name: 'Elegant Purple',
        description: 'Sophisticated purple',
        primaryColor: '#8B5CF6',
        secondaryColor: '#F3E8FF',
        fontFamily: 'Poppins'
      },
      {
        id: 'fresh',
        name: 'Fresh Green',
        description: 'Natural green theme',
        primaryColor: '#10B981',
        secondaryColor: '#ECFDF5',
        fontFamily: 'Inter'
      },
      {
        id: 'bold',
        name: 'Bold Red',
        description: 'Energetic red theme',
        primaryColor: '#EF4444',
        secondaryColor: '#FEF2F2',
        fontFamily: 'Montserrat'
      },
      {
        id: 'professional',
        name: 'Professional Gray',
        description: 'Clean gray theme',
        primaryColor: '#6B7280',
        secondaryColor: '#F9FAFB',
        fontFamily: 'Source Sans Pro'
      }
    ];

    res.json({
      success: true,
      data: presets
    });

  } catch (error) {
    console.error('Error fetching theme presets:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch theme presets',
      error: error.message
    });
  }
});

// Helper function to validate theme data
function validateThemeData(theme) {
  const errors = [];

  // Validate primary color
  if (!theme.primaryColor || !/^#[0-9A-F]{6}$/i.test(theme.primaryColor)) {
    errors.push('Primary color must be a valid hex color');
  }

  // Validate secondary color
  if (!theme.secondaryColor || !/^#[0-9A-F]{6}$/i.test(theme.secondaryColor)) {
    errors.push('Secondary color must be a valid hex color');
  }

  // Validate font family
  const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro'];
  if (!theme.fontFamily || !validFonts.includes(theme.fontFamily)) {
    errors.push('Font family must be one of: ' + validFonts.join(', '));
  }

  // Validate logo URL if provided
  if (theme.logoUrl && theme.logoUrl.trim()) {
    const urlRegex = /^(https?:\/\/)|(data:image\/)/;
    if (!urlRegex.test(theme.logoUrl)) {
      errors.push('Logo URL must be a valid HTTP/HTTPS URL or data URL');
    }
  }

  return errors;
}

export default router;