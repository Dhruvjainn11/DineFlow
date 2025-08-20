import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { token } = useAuth();
  const [theme, setTheme] = useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#F3F4F6',
    logoUrl: '',
    fontFamily: 'Inter',
    cafeName: 'DineFlow',
    isWhiteLabel: false,
    customDomain: null
  });
  const [features, setFeatures] = useState({
    customBranding: false,
    themeCustomization: false,
    onlinePayments: false,
    premiumQRCodes: false,
    thirtyDayAnalytics: false,
    advancedAnalytics: false,
    prioritySupport: false,
    customDomain: false,
    whiteLabel: false
  });
  const [cafeInfo, setCafeInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Apply CSS variables for theme
  const applyTheme = (themeData) => {
    const root = document.documentElement;
    
    // Convert hex to RGB for opacity variations
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const primaryRgb = hexToRgb(themeData.primaryColor);
    const secondaryRgb = hexToRgb(themeData.secondaryColor);

    // Set CSS custom properties
    root.style.setProperty('--primary-color', themeData.primaryColor);
    root.style.setProperty('--secondary-color', themeData.secondaryColor);
    root.style.setProperty('--font-family', themeData.fontFamily);
    
    if (primaryRgb) {
      root.style.setProperty('--primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
      root.style.setProperty('--primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
      root.style.setProperty('--primary-100', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
      root.style.setProperty('--primary-200', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`);
      root.style.setProperty('--primary-300', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.3)`);
      root.style.setProperty('--primary-500', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`);
      root.style.setProperty('--primary-700', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.7)`);
      root.style.setProperty('--primary-800', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.8)`);
      root.style.setProperty('--primary-900', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`);
    }
    
    if (secondaryRgb) {
      root.style.setProperty('--secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    }

    // Apply font family
    document.body.style.fontFamily = `${themeData.fontFamily}, system-ui, -apple-system, sans-serif`;
    
    // Update favicon and title for white-label
    if (themeData.isWhiteLabel && themeData.logoUrl) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = themeData.logoUrl;
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon);
      }
    }
    
    if (themeData.isWhiteLabel && themeData.cafeName) {
      document.title = `${themeData.cafeName} - Admin Panel`;
    } else {
      document.title = 'DineFlow - Admin Panel';
    }
  };

  // Fetch cafe theme and settings
  const fetchCafeTheme = async () => {
    if (!token) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.data.cafe) {
          const cafe = userData.data.cafe;
          
          setCafeInfo(cafe);
          setFeatures(cafe.features || {});
          
          const newTheme = {
            primaryColor: cafe.theme?.primaryColor || '#3B82F6',
            secondaryColor: cafe.theme?.secondaryColor || '#F3F4F6',
            logoUrl: cafe.theme?.logoUrl || '',
            fontFamily: cafe.theme?.fontFamily || 'Inter',
            cafeName: cafe.name || 'DineFlow',
            isWhiteLabel: cafe.features?.whiteLabel || false,
            customDomain: cafe.subdomain || null
          };
          
          setTheme(newTheme);
          applyTheme(newTheme);
        }
      }
    } catch (error) {
      console.error('Error fetching cafe theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh theme (for external calls)
  const refreshTheme = () => {
    fetchCafeTheme();
  };

  // Update theme (for Pro plan cafes)
  const updateTheme = async (newThemeData) => {
    if (!features.themeCustomization) {
      throw new Error('Theme customization is not available in your current plan');
    }

    try {
      const response = await fetch(`/api/cafes/${cafeInfo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          theme: newThemeData
        })
      });

      if (response.ok) {
        const updatedTheme = { ...theme, ...newThemeData };
        setTheme(updatedTheme);
        applyTheme(updatedTheme);
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update theme');
      }
    } catch (error) {
      console.error('Error updating theme:', error);
      throw error;
    }
  };

  // Check if a feature is available
  const hasFeature = (featureName) => {
    return features[featureName] === true;
  };

  // Get brand name to display
  const getBrandName = () => {
    if (features.whiteLabel && cafeInfo?.name) {
      return cafeInfo.name;
    }
    return 'DineFlow';
  };

  // Get logo URL to display
  const getLogoUrl = () => {
    if (features.customBranding && theme.logoUrl) {
      return theme.logoUrl;
    }
    return null; // Use default DineFlow logo
  };

  // Reset to default theme (for switching between cafes or logout)
  const resetTheme = () => {
    const defaultTheme = {
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      logoUrl: '',
      fontFamily: 'Inter',
      cafeName: 'DineFlow',
      isWhiteLabel: false,
      customDomain: null
    };
    setTheme(defaultTheme);
    setFeatures({});
    setCafeInfo(null);
    applyTheme(defaultTheme);
    
    // Reset title and favicon
    document.title = 'DineFlow - Admin Panel';
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.href = '/vite.svg'; // Default favicon
    }
  };

  // Initialize theme when token changes
  useEffect(() => {
    if (token) {
      fetchCafeTheme();
    } else {
      resetTheme();
    }
  }, [token]);

  // Theme utility functions
  const getThemeClass = (baseClass, variants = {}) => {
    let classes = baseClass;
    
    // Add primary color variants
    if (variants.primary) {
      classes += ' bg-primary text-white hover:bg-primary/90';
    }
    if (variants.primaryOutline) {
      classes += ' border-primary text-primary hover:bg-primary hover:text-white';
    }
    if (variants.secondary) {
      classes += ' bg-secondary text-gray-900';
    }
    
    return classes;
  };

  const value = {
    theme,
    features,
    cafeInfo,
    isLoading,
    updateTheme,
    hasFeature,
    getBrandName,
    getLogoUrl,
    resetTheme,
    getThemeClass,
    applyTheme,
    refreshTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
