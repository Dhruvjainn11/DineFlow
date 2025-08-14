import React from 'react';
import { useAuth } from '../../context/AuthContext';

const FeatureGate = ({ 
  feature, 
  children, 
  fallback = null, 
  showUpgrade = true,
  upgradeMessage = null,
  className = ''
}) => {
  const { hasFeature, cafe } = useAuth();

  // If feature is available, render children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // If no fallback and no upgrade message, render nothing
  if (!showUpgrade && !fallback) {
    return null;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt
  const defaultUpgradeMessages = {
    customBranding: 'Upgrade to Pro to add your custom logo and branding',
    themeCustomization: 'Upgrade to Pro to customize colors and themes',
    onlinePayments: 'Upgrade to Pro to accept online payments',
    premiumQRCodes: 'Upgrade to Pro for branded QR codes',
    advancedAnalytics: 'Upgrade to Pro for detailed analytics and insights',
    thirtyDayAnalytics: 'Upgrade to Pro to view 30-day analytics history',
    prioritySupport: 'Upgrade to Pro for priority customer support',
    customDomain: 'Upgrade to Pro to use your own custom domain',
    whiteLabel: 'Upgrade to Pro for complete white-label solution'
  };

  const message = upgradeMessage || defaultUpgradeMessages[feature] || 'Upgrade to Pro to access this feature';
  const currentPlan = cafe?.subscription?.planType || 'basic';

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-blue-900">
            Pro Feature
          </h3>
          <div className="mt-2 text-sm text-blue-700">
            <p>{message}</p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Upgrade to Pro
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-blue-300 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
      
      {/* Current plan indicator */}
      <div className="mt-3 pt-3 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs">
          <span className="text-blue-600">
            Current Plan: <span className="font-semibold capitalize">{currentPlan}</span>
          </span>
          <span className="text-blue-500">
            Pro features available for $29/month
          </span>
        </div>
      </div>
    </div>
  );
};

// Wrapper component for inline feature gating
export const FeatureToggle = ({ feature, children, fallback = null }) => {
  const { hasFeature } = useAuth();
  
  if (hasFeature(feature)) {
    return <>{children}</>;
  }
  
  return fallback ? <>{fallback}</> : null;
};

// Higher-order component for feature gating
export const withFeatureGate = (WrappedComponent, feature, fallbackComponent = null) => {
  return (props) => {
    const { hasFeature } = useAuth();
    
    if (hasFeature(feature)) {
      return <WrappedComponent {...props} />;
    }
    
    if (fallbackComponent) {
      const FallbackComponent = fallbackComponent;
      return <FallbackComponent {...props} />;
    }
    
    return (
      <FeatureGate feature={feature}>
        <WrappedComponent {...props} />
      </FeatureGate>
    );
  };
};

// Hook for checking multiple features
export const useFeatureGate = () => {
  const { hasFeature, cafe } = useAuth();
  
  const checkFeatures = (featureList) => {
    return featureList.every(feature => hasFeature(feature));
  };
  
  const checkAnyFeature = (featureList) => {
    return featureList.some(feature => hasFeature(feature));
  };
  
  return {
    hasFeature,
    checkFeatures,
    checkAnyFeature,
    features: cafe?.features || {},
    cafeInfo: cafe
  };
};

export default FeatureGate;
