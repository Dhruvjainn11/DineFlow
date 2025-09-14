// server/middleware/subscriptionMiddleware.js
import Cafe from '../models/Cafe.js';

/**
 * Middleware to check if user's cafe subscription is active
 * Should be used after authMiddleware
 */
export const checkSubscription = async (req, res, next) => {
  try {
    // Skip for super admin
    if (req.user && req.user.role === 'super-admin') {
      return next();
    }

    // Get cafe ID from user or request
    const cafeId = req.user?.cafeId?._id || req.user?.cafeId || req.body?.cafeId || req.params?.cafeId;
    
    if (!cafeId) {
      return res.status(401).json({
        success: false,
        message: 'Subscription expired. Please renew your plan.',
        code: 'SUBSCRIPTION_EXPIRED'
      });
    }

    // Find cafe and check subscription
    const cafe = await Cafe.findById(cafeId);
    
    if (!cafe) {
      return res.status(401).json({
        success: false,
        message: 'Cafe not found.',
        code: 'CAFE_NOT_FOUND'
      });
    }

    // Check if subscription is expired
    if (cafe.isSubscriptionExpired()) {
      // Auto-update status to inactive if expired
      if (cafe.subscription.status !== 'inactive') {
        cafe.subscription.status = 'inactive';
        await cafe.save();
      }

      return res.status(401).json({
        success: false,
        message: 'Subscription expired. Please renew your plan.',
        code: 'SUBSCRIPTION_EXPIRED',
        subscriptionEndDate: cafe.subscription.endDate,
        trialEndDate: cafe.subscription.trialEndDate
      });
    }

    // Add cafe to request for use in controllers
    req.cafe = cafe;
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify subscription',
      error: error.message
    });
  }
};