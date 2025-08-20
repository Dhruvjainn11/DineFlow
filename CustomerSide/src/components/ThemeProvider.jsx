import { useEffect } from 'react';
import { useCafe } from '../context/CafeContext';

const ThemeProvider = ({ children }) => {
  const { cafeInfo } = useCafe();
  
  useEffect(() => {
    if (cafeInfo?.theme) {
      applyTheme(cafeInfo.theme, cafeInfo);
    } else {
      applyDefaultTheme();
    }
  }, [cafeInfo]);

  const applyTheme = (theme, cafe) => {
    const root = document.documentElement;
    
    // Apply primary color and variations
    if (theme.primaryColor) {
      const primaryRgb = hexToRgb(theme.primaryColor);
      root.style.setProperty('--theme-primary', theme.primaryColor);
      root.style.setProperty('--theme-primary-dark', adjustBrightness(theme.primaryColor, -20));
      root.style.setProperty('--theme-primary-light', adjustBrightness(theme.primaryColor, 20));
      
      if (primaryRgb) {
        root.style.setProperty('--theme-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
        root.style.setProperty('--theme-primary-50', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.05)`);
        root.style.setProperty('--theme-primary-100', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.1)`);
        root.style.setProperty('--theme-primary-200', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.2)`);
        root.style.setProperty('--theme-primary-500', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.5)`);
        root.style.setProperty('--theme-primary-900', `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`);
      }
    }
    
    // Apply secondary color
    if (theme.secondaryColor) {
      root.style.setProperty('--theme-secondary', theme.secondaryColor);
      root.style.setProperty('--theme-bg-secondary', theme.secondaryColor);
    }
    
    // Apply font family
    if (theme.fontFamily) {
      root.style.setProperty('--theme-font-family', theme.fontFamily);
      document.body.style.fontFamily = `${theme.fontFamily}, system-ui, -apple-system, sans-serif`;
    }
    
    // Update page title and favicon for white-label
    if (cafe?.features?.whiteLabel && cafe.name) {
      document.title = `${cafe.name} - Menu`;
    } else {
      document.title = 'DineFlow - Menu';
    }
    
    if (cafe?.features?.customBranding && theme.logoUrl) {
      updateFavicon(theme.logoUrl);
    }
  };
  
  const applyDefaultTheme = () => {
    const root = document.documentElement;
    root.style.setProperty('--theme-primary', '#F59E0B');
    root.style.setProperty('--theme-primary-dark', '#D97706');
    root.style.setProperty('--theme-secondary', '#FEF3C7');
    root.style.setProperty('--theme-font-family', 'Inter');
    document.body.style.fontFamily = 'Inter, system-ui, -apple-system, sans-serif';
    document.title = 'DineFlow - Menu';
  };
  
  const updateFavicon = (logoUrl) => {
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = logoUrl;
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(favicon);
    }
  };

  return <div className="theme-wrapper">{children}</div>;
};

// Helper functions
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
  
  return '#' + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
}

export default ThemeProvider;