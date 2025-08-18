// server/middleware/validationMiddleware.js
import { body, param, query, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Validation error handler
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Common validation rules
export const validateObjectId = (fieldName) => {
  return param(fieldName).custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error(`Invalid ${fieldName}`);
    }
    return true;
  });
};

export const validateCafeId = () => {
  return [
    body('cafeId').optional().isMongoId().withMessage('Invalid cafe ID'),
    query('cafeId').optional().isMongoId().withMessage('Invalid cafe ID')
  ];
};

// Auth validation
export const validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('cafeId').optional().isMongoId().withMessage('Invalid cafe ID'),
  handleValidationErrors
];

// Cafe validation
export const validateCafeCreation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Cafe name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subdomain').optional().matches(/^[a-z0-9-]+$/).isLength({ min: 3, max: 30 })
    .withMessage('Subdomain must be 3-30 characters, lowercase letters, numbers, and hyphens only'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('planType').optional().isIn(['basic', 'pro']).withMessage('Invalid plan type'),
  body('adminUser.username').optional().trim().isLength({ min: 3 }).withMessage('Admin username must be at least 3 characters'),
  body('adminUser.password').optional().isLength({ min: 6 }).withMessage('Admin password must be at least 6 characters'),
  handleValidationErrors
];

export const validateCafeUpdate = [
  validateObjectId('id'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Cafe name must be 2-100 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('subdomain').optional().matches(/^[a-z0-9-]+$/).isLength({ min: 3, max: 30 })
    .withMessage('Invalid subdomain format'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  handleValidationErrors
];

// Menu validation
export const validateMenuCreation = [
  body('name').trim().notEmpty().withMessage('Menu item name is required'),
  body('category').isMongoId().withMessage('Valid category ID is required'),
  
  // Custom validation for price/sizes
  body().custom((value, { req }) => {
    const { price, sizes } = req.body;
    
    // If no sizes, price is required
    if (!sizes || sizes.length === 0) {
      if (!price && price !== 0) {
        throw new Error('Base price is required when no sizes are provided');
      }
      if (isNaN(Number(price))) {
        throw new Error('Price must be a valid number');
      }
      if (Number(price) < 0) {
        throw new Error('Price must be positive');
      }
    }
    
    // If sizes exist, validate each
    if (sizes && sizes.length > 0) {
      if (!Array.isArray(sizes)) {
        throw new Error('Sizes must be an array');
      }
      sizes.forEach(size => {
        if (!size.label || !size.price) {
          throw new Error('Each size must have both label and price');
        }
        if (isNaN(Number(size.price))) {
          throw new Error('Size prices must be numbers');
        }
      });
    }
    
    return true;
  }),
  
  // Other validations...
  handleValidationErrors
];

export const validateMenuUpdate = [
  validateObjectId('id'),
  body('name').optional().trim().notEmpty().withMessage('Menu item name cannot be empty'),
  body('category').optional().isMongoId().withMessage('Valid category ID required'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('preparationTime').optional().isInt({ min: 1, max: 300 }).withMessage('Invalid preparation time'),
  body('spicyLevel').optional().isInt({ min: 0, max: 5 }).withMessage('Spicy level must be 0-5'),
  handleValidationErrors
];

// Category validation
export const validateCategoryCreation = [
  body('name').trim().notEmpty().withMessage('Category name is required'),
  body('cafeId').optional().isMongoId().withMessage('Invalid cafe ID'),
  handleValidationErrors
];

export const validateCategoryUpdate = [
  validateObjectId('id'),
  body('name').optional().trim().notEmpty().withMessage('Category name cannot be empty'),
  handleValidationErrors
];

// Order validation
export const validateOrderCreation = [
  body('tableId').isMongoId().withMessage('Valid table ID is required'),
  body('cafeId').isMongoId().withMessage('Valid cafe ID is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  body('items.*.menuItem').isMongoId().withMessage('Valid menu item ID required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  handleValidationErrors
];

export const validateOrderStatusUpdate = [
  validateObjectId('id'),
  body('status').isIn(['Pending', 'In Progress', 'Ready', 'Completed']).withMessage('Invalid status'),
  handleValidationErrors
];

// Table validation
export const validateTableCreation = [
  body('tableNumber').isInt({ min: 1 }).withMessage('Valid table number is required'),
  body('cafeId').optional().isMongoId().withMessage('Valid cafe ID required'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Capacity must be 1-20'),
  body('tableName').optional().trim().isLength({ max: 50 }).withMessage('Table name cannot exceed 50 characters'),
  body('location').optional().trim().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  handleValidationErrors
];

export const validateTableUpdate = [
  validateObjectId('id'),
  body('status').optional().isIn(['Available', 'Occupied', 'Reserved', 'Maintenance']).withMessage('Invalid status'),
  body('capacity').optional().isInt({ min: 1, max: 20 }).withMessage('Invalid capacity'),
  handleValidationErrors
];

// Payment validation
export const validatePaymentSettings = [
  validateObjectId('cafeId'),
  body('gateway').isIn(['razorpay', 'stripe', 'paypal']).withMessage('Invalid payment gateway'),
  body('settings').isObject().withMessage('Settings must be an object'),
  handleValidationErrors
];

export const validatePaymentCreation = [
  body('cafeId').isMongoId().withMessage('Valid cafe ID required'),
  body('tableNumber').isInt({ min: 1 }).withMessage('Valid table number required'),
  body('gateway').isIn(['razorpay', 'stripe']).withMessage('Invalid payment gateway'),
  handleValidationErrors
];

// Query validation
export const validatePaginationQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  handleValidationErrors
];

export const validateQueryPagination = validatePaginationQuery;
