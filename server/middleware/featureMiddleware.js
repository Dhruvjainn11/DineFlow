// server/middleware/featureMiddleware.js
export const checkFeatureAccess = (requiredFeature, requiredPlan = null) => {
  return (req, res, next) => {
    try {
      // Super admin bypasses all feature checks
      if (req.user && req.user.isSuperAdmin()) {
        return next();
      }

      // Check if user has associated cafe
      if (!req.user || !req.user.cafeId) {
        return res.status(403).json({
          success: false,
          message: 'No cafe associated with user account'
        });
      }

      const cafe = req.user.cafeId;

      // Check if subscription is active
      if (!cafe.isSubscriptionActive()) {
        return res.status(403).json({
          success: false,
          message: 'Subscription expired. Please renew to access this feature.',
          code: 'SUBSCRIPTION_EXPIRED'
        });
      }

      // Check plan requirement
      if (requiredPlan && cafe.subscription.planType !== requiredPlan) {
        return res.status(403).json({
          success: false,
          message: `This feature requires ${requiredPlan.toUpperCase()} plan. Please upgrade your subscription.`,
          code: 'PLAN_UPGRADE_REQUIRED',
          currentPlan: cafe.subscription.planType,
          requiredPlan
        });
      }

      // Check specific feature
      if (requiredFeature && !cafe.hasFeature(requiredFeature)) {
        return res.status(403).json({
          success: false,
          message: `Feature '${requiredFeature}' is not available in your current plan.`,
          code: 'FEATURE_NOT_AVAILABLE',
          requiredFeature
        });
      }

      next();
    } catch (error) {
      console.error('Feature check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking feature access',
        error: error.message
      });
    }
  };
};

export const requireProPlan = checkFeatureAccess(null, 'pro');
export const requireOnlinePayments = checkFeatureAccess('onlinePayments');
export const requireCustomBranding = checkFeatureAccess('customBranding');
export const requirePremiumQR = checkFeatureAccess('premiumQRCodes');
export const requireAdvancedAnalytics = checkFeatureAccess('advancedAnalytics');
