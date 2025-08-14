// server/routes/qrRoutes.js
import express from 'express';
import QRCode from 'qrcode';
import { protect, allowRoles, checkPermission, ensureCafeAccess, checkSubscription } from '../middleware/authMiddleware.js';
import { checkFeatureAccess, requirePremiumQR } from '../middleware/featureMiddleware.js';
import { validateObjectId, validateTableCreation, handleValidationErrors } from '../middleware/validationMiddleware.js';
import Table from '../models/Table.js';
import Cafe from '../models/Cafe.js';

const router = express.Router();

/**
 * @desc    Generate QR code for a table
 * @route   GET /api/qr/table/:tableId
 * @access  Private (Admin, Cafe Admin)
 */
router.get('/table/:tableId', 
  protect, 
  checkSubscription,
  validateObjectId('tableId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { tableId } = req.params;
      const { format = 'dataurl', size = 300, margin = 1 } = req.query;

      // Find table and verify ownership
      const table = await Table.findById(tableId).populate('cafeId');
      if (!table) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      // Check cafe access
      if (!req.user.isSuperAdmin() && table.cafeId._id.toString() !== req.user.cafeId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this table'
        });
      }

      const cafe = table.cafeId;
      const qrData = table.getQRCodeData(cafe);

      // Generate QR code options based on plan
      const qrOptions = {
        errorCorrectionLevel: qrData.styling.errorCorrectionLevel,
        type: 'image/png',
        quality: 0.92,
        margin: parseInt(margin) || qrData.styling.margin,
        color: {
          dark: qrData.styling.primaryColor,
          light: qrData.styling.backgroundColor,
        },
        width: parseInt(size) || qrData.styling.size,
      };

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(qrData.url, qrOptions);

      // Update table QR code info
      table.qrCode = qrCodeUrl;
      table.qrCodeUrl = qrData.url;
      table.qrCodeType = qrData.isPremium ? 'premium' : 'basic';
      await table.save();

      res.json({
        success: true,
        message: 'QR code generated successfully',
        data: {
          qrCode: format === 'dataurl' ? qrCodeUrl : null,
          table: {
            id: table._id,
            number: table.tableNumber,
            name: table.tableName,
            location: table.location
          },
          url: qrData.url,
          features: {
            isPremium: qrData.isPremium,
            customBranding: qrData.branding.isWhiteLabel,
            customDomain: !!qrData.branding.customDomain
          },
          instructions: qrData.instructions
        }
      });

    } catch (error) {
      console.error('Error generating QR code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code',
        error: error.message
      });
    }
  }
);

/**
 * @desc    Generate QR codes for all tables in bulk
 * @route   POST /api/qr/bulk/:cafeId
 * @access  Private (Admin, Cafe Admin)
 */
router.post('/bulk/:cafeId',
  protect,
  checkSubscription,
  checkPermission('canManageTables'),
  ensureCafeAccess,
  validateObjectId('cafeId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { cafeId } = req.params;
      const { format = 'dataurl', size = 300, regenerate = false } = req.body;

      // Find cafe
      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        return res.status(404).json({
          success: false,
          message: 'Cafe not found'
        });
      }

      // Find all active tables
      const tables = await Table.find({ 
        cafeId,
        isActive: true
      }).sort({ sortOrder: 1, tableNumber: 1 });

      if (tables.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No active tables found for this cafe'
        });
      }

      const results = [];

      // Generate QR codes for each table
      for (const table of tables) {
        try {
          // Skip if QR already exists and not regenerating
          if (table.qrCode && !regenerate) {
            results.push({
              tableId: table._id,
              tableNumber: table.tableNumber,
              qrCode: format === 'dataurl' ? table.qrCode : null,
              url: table.qrCodeUrl,
              status: 'existing'
            });
            continue;
          }

          const qrData = table.getQRCodeData(cafe);

          // Generate QR code options
          const qrOptions = {
            errorCorrectionLevel: qrData.styling.errorCorrectionLevel,
            type: 'image/png',
            quality: 0.92,
            margin: qrData.styling.margin,
            color: {
              dark: qrData.styling.primaryColor,
              light: qrData.styling.backgroundColor,
            },
            width: parseInt(size) || qrData.styling.size,
          };

          const qrCodeUrl = await QRCode.toDataURL(qrData.url, qrOptions);

          // Update table
          table.qrCode = qrCodeUrl;
          table.qrCodeUrl = qrData.url;
          table.qrCodeType = qrData.isPremium ? 'premium' : 'basic';
          await table.save();

          results.push({
            tableId: table._id,
            tableNumber: table.tableNumber,
            tableName: table.tableName,
            qrCode: format === 'dataurl' ? qrCodeUrl : null,
            url: qrData.url,
            status: 'generated'
          });

        } catch (tableError) {
          console.error(`Error generating QR for table ${table.tableNumber}:`, tableError);
          results.push({
            tableId: table._id,
            tableNumber: table.tableNumber,
            status: 'error',
            error: tableError.message
          });
        }
      }

      res.json({
        success: true,
        message: `QR codes processed for ${tables.length} tables`,
        data: {
          total: tables.length,
          generated: results.filter(r => r.status === 'generated').length,
          existing: results.filter(r => r.status === 'existing').length,
          errors: results.filter(r => r.status === 'error').length,
          results
        }
      });

    } catch (error) {
      console.error('Error generating bulk QR codes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bulk QR codes',
        error: error.message
      });
    }
  }
);

/**
 * @desc    Get QR code analytics (Pro feature)
 * @route   GET /api/qr/analytics/:tableId
 * @access  Private (Admin, Cafe Admin - Pro plan only)
 */
router.get('/analytics/:tableId',
  protect,
  checkSubscription,
  requirePremiumQR,
  validateObjectId('tableId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { tableId } = req.params;
      const { days = 7 } = req.query;

      const table = await Table.findById(tableId);
      if (!table) {
        return res.status(404).json({
          success: false,
          message: 'Table not found'
        });
      }

      // Check cafe access
      if (!req.user.isSuperAdmin() && table.cafeId.toString() !== req.user.cafeId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied to this table'
        });
      }

      const analytics = table.getQRAnalyticsSummary(parseInt(days));

      res.json({
        success: true,
        message: 'QR analytics retrieved successfully',
        data: {
          table: {
            id: table._id,
            number: table.tableNumber,
            name: table.tableName
          },
          period: `${days} days`,
          analytics
        }
      });

    } catch (error) {
      console.error('Error getting QR analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get QR analytics',
        error: error.message
      });
    }
  }
);

/**
 * @desc    Track QR code scan (Public endpoint)
 * @route   POST /api/qr/scan/:tableId
 * @access  Public
 */
router.post('/scan/:tableId',
  validateObjectId('tableId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { tableId } = req.params;
      const { userAgent, ipAddress, referrer } = req.body;

      const table = await Table.findById(tableId).populate('cafeId');
      if (!table || !table.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Table not found or inactive'
        });
      }

      const cafe = table.cafeId;

      // Only track analytics for Pro plan
      if (cafe.hasFeature('premiumQRCodes')) {
        await table.updateQRAnalytics({
          userAgent,
          ipAddress,
          referrer
        });
      }

      // Generate menu URL for customer
      const menuUrl = table.generateQRCodeUrl(cafe).replace('/order/', '/menu/');

      res.json({
        success: true,
        message: 'QR scan tracked',
        data: {
          table: {
            id: table._id,
            number: table.tableNumber,
            name: table.tableName,
            location: table.location,
            capacity: table.capacity,
            status: table.status
          },
          cafe: {
            id: cafe._id,
            name: cafe.name,
            theme: cafe.theme
          },
          menuUrl,
          orderUrl: table.generateQRCodeUrl(cafe)
        }
      });

    } catch (error) {
      console.error('Error tracking QR scan:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to track QR scan',
        error: error.message
      });
    }
  }
);

/**
 * @desc    Get QR design options (Pro feature)
 * @route   GET /api/qr/design-options/:cafeId
 * @access  Private (Admin, Cafe Admin - Pro plan only)
 */
router.get('/design-options/:cafeId',
  protect,
  checkSubscription,
  requirePremiumQR,
  ensureCafeAccess,
  validateObjectId('cafeId'),
  handleValidationErrors,
  async (req, res) => {
    try {
      const { cafeId } = req.params;

      const cafe = await Cafe.findById(cafeId);
      if (!cafe) {
        return res.status(404).json({
          success: false,
          message: 'Cafe not found'
        });
      }

      res.json({
        success: true,
        message: 'QR design options retrieved',
        data: {
          colors: {
            primary: cafe.theme.primaryColor || '#3B82F6',
            secondary: cafe.theme.secondaryColor || '#F3F4F6',
            available: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#000000']
          },
          sizes: [
            { label: 'Small', value: 200, recommended: false },
            { label: 'Medium', value: 300, recommended: true },
            { label: 'Large', value: 400, recommended: false },
            { label: 'Extra Large', value: 500, recommended: false }
          ],
          errorCorrection: [
            { label: 'Low (7%)', value: 'L', description: 'For clean environments' },
            { label: 'Medium (15%)', value: 'M', description: 'Standard usage' },
            { label: 'Quartile (25%)', value: 'Q', description: 'Industrial usage' },
            { label: 'High (30%)', value: 'H', description: 'With logo overlay' }
          ],
          formats: [
            { label: 'PNG (Base64)', value: 'dataurl', description: 'For web display' },
            { label: 'PNG (File)', value: 'png', description: 'For download' },
            { label: 'SVG', value: 'svg', description: 'Vector format' }
          ],
          branding: {
            logoSupported: cafe.hasFeature('customBranding'),
            customColorsSupported: true,
            whiteLabel: cafe.hasFeature('whiteLabel')
          }
        }
      });

    } catch (error) {
      console.error('Error getting QR design options:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get design options',
        error: error.message
      });
    }
  }
);

export default router;
