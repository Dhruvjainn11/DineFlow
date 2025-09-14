// server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Cafe from '../models/Cafe.js';

export const protect = async (req, res, next) => {
  let token;

  // Check if the header exists and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Split to get the token
      token = req.headers.authorization.split(' ')[1];



      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to request with cafe details
      req.user = await User.findById(decoded.id)
        .populate({
          path: 'cafeId',
          select: 'name subdomain features subscription theme settings status'
        })
        .select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Check if user is active
      if (!req.user.isActive) {
        return res.status(401).json({ message: 'Account deactivated' });
      }

      // For non-super admin users, check if cafe is active and subscription is valid
      if (req.user.cafeId) {
        if (req.user.cafeId.status !== 'active') {
          return res.status(401).json({ 
            success: false,
            message: 'Cafe account suspended',
            code: 'CAFE_SUSPENDED'
          });
        }
        
        // Check subscription expiry
        const cafe = await Cafe.findById(req.user.cafeId._id || req.user.cafeId);
        if (cafe && cafe.isSubscriptionExpired()) {
          // Auto-update status to inactive if expired
          if (cafe.subscription.status !== 'inactive') {
            cafe.subscription.status = 'inactive';
            cafe.status = 'inactive';
            await cafe.save();
          }
          
          return res.status(401).json({ 
            success: false,
            message: 'Subscription expired. Please renew your plan.',
            code: 'SUBSCRIPTION_EXPIRED'
          });
        }
      }

      // Update last login
      req.user.lastLogin = new Date();
      await req.user.save();

      next(); // Move to next middleware
    } catch (err) {
         console.error('JWT Verification Error:', err.message);
      res.status(401).json({ message: 'Token failed' });
    }
  } else {
    res.status(401).json({ message: 'No token provided' });
  }
};


export const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Middleware to check if user has specific permission
export const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({ 
        message: `Access denied. Permission required: ${permission}` 
      });
    }
    next();
  };
};

// Middleware to check if cafe has specific feature
export const checkFeature = (feature) => {
  return (req, res, next) => {
    // Super admin can access all features
    if (req.user.isSuperAdmin()) {
      return next();
    }

    if (!req.user.cafeId || !req.user.cafeId.features || !req.user.cafeId.features[feature]) {
      return res.status(403).json({ 
        message: `Feature not available in your current plan: ${feature}` 
      });
    }
    next();
  };
};

// Middleware to ensure cafe isolation (non-super admins can only access their cafe data)
export const ensureCafeAccess = (req, res, next) => {
  // Super admin can access all cafes
  if (req.user.isSuperAdmin()) {
    return next();
  }

  // Extract cafeId from different sources
  const cafeId = req.params.cafeId || req.query.cafeId || req.body.cafeId;
  
  if (cafeId && cafeId !== req.user.cafeId.toString()) {
    return res.status(403).json({ 
      message: 'Access denied to this cafe data' 
    });
  }

  next();
};

// Middleware to check subscription status
export const checkSubscription = (req, res, next) => {
  // Super admin bypasses subscription checks
  if (req.user.isSuperAdmin()) {
    return next();
  }

  if (!req.user.cafeId || !req.user.cafeId.subscription) {
    return res.status(403).json({ 
      message: 'No active subscription' 
    });
  }

  const subscription = req.user.cafeId.subscription;
  const now = new Date();

  // Check if subscription is active or in trial
  if (subscription.status === 'inactive' || subscription.status === 'suspended') {
    return res.status(403).json({ 
      message: 'Subscription inactive or suspended' 
    });
  }

  // Check if trial has expired
  if (subscription.status === 'trial' && subscription.trialEndDate < now) {
    return res.status(403).json({ 
      message: 'Trial period has expired. Please upgrade your subscription.' 
    });
  }

  // Check if paid subscription has expired
  if (subscription.status === 'active' && subscription.endDate < now) {
    return res.status(403).json({ 
      message: 'Subscription has expired. Please renew your subscription.' 
    });
  }

  next();
};

// Middleware to check subscription plan limits
export const checkPlanLimits = (action) => {
  return async (req, res, next) => {
    // Super admin bypasses all limits
    if (req.user.isSuperAdmin()) {
      return next();
    }

    if (!req.user.cafeId || !req.user.cafeId.subscription) {
      return res.status(403).json({ 
        message: 'No active subscription' 
      });
    }

    const subscription = req.user.cafeId.subscription;
    const planType = subscription.planType;

    try {
      switch (action) {
        case 'createMenuItem':
          // Unlimited menu items for all plans
          break;

        case 'createTable':
        case 'manageTable':
          // Basic QR functionality is available in Basic plan
          // Advanced QR features (premium design, custom branding) require Pro
          if (planType === 'basic') {
            // Check current table count for Basic plan (limit: 10 tables)
            const Table = (await import('../models/Table.js')).default;
            const currentCount = await Table.countDocuments({ cafeId: req.user.cafeId._id, isActive: true });
            
            if (currentCount >= 10) {
              return res.status(403).json({
                success: false,
                message: 'Basic plan limit reached. Maximum 10 tables allowed. Upgrade to Pro for unlimited tables.',
                planLimit: {
                  current: currentCount,
                  limit: 10,
                  planType: 'basic',
                  upgradeRequired: true
                }
              });
            }
          }
          break;

        default:
          break;
      }

      next();
    } catch (error) {
      console.error('Plan limit check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking plan limits'
      });
    }
  };
};
