import api from '../utils/api';

class ThemeService {
  constructor() {
    this.listeners = new Set();
    this.currentTheme = null;
  }

  // Subscribe to theme changes
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Notify all listeners of theme changes
  notifyListeners(theme) {
    this.currentTheme = theme;
    this.listeners.forEach(callback => callback(theme));
  }

  // Fetch current theme from server
  async fetchTheme(cafeId) {
    try {
      const response = await api.get(`/cafes/${cafeId}`);
      if (response.data.success) {
        const theme = response.data.data.theme;
        this.notifyListeners(theme);
        return theme;
      }
    } catch (error) {
      console.error('Failed to fetch theme:', error);
      throw error;
    }
  }

  // Update theme on server
  async updateTheme(cafeId, themeData) {
    try {
      const response = await api.put(`/cafes/${cafeId}`, {
        theme: themeData
      });
      
      if (response.data.success) {
        this.notifyListeners(themeData);
        return response.data;
      }
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }

  // Get cached theme
  getCurrentTheme() {
    return this.currentTheme;
  }

  // Apply theme to DOM
  applyTheme(theme) {
    if (!theme) return;

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

    const primaryRgb = hexToRgb(theme.primaryColor);
    const secondaryRgb = hexToRgb(theme.secondaryColor);

    // Set CSS custom properties
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--font-family', theme.fontFamily);
    
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
    document.body.style.fontFamily = `${theme.fontFamily}, system-ui, -apple-system, sans-serif`;
  }

  // Reset theme to default
  resetTheme() {
    const defaultTheme = {
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      logoUrl: '',
      fontFamily: 'Inter'
    };
    
    this.applyTheme(defaultTheme);
    this.notifyListeners(defaultTheme);
  }

  // Validate theme data
  validateTheme(theme) {
    const errors = {};

    if (!theme.primaryColor || !/^#[0-9A-F]{6}$/i.test(theme.primaryColor)) {
      errors.primaryColor = 'Valid primary color is required';
    }

    if (!theme.secondaryColor || !/^#[0-9A-F]{6}$/i.test(theme.secondaryColor)) {
      errors.secondaryColor = 'Valid secondary color is required';
    }

    const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro'];
    if (!theme.fontFamily || !validFonts.includes(theme.fontFamily)) {
      errors.fontFamily = 'Valid font family is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Generate theme variations
  generateThemeVariations(baseTheme) {
    const variations = [];
    const baseHue = this.getHueFromHex(baseTheme.primaryColor);
    
    // Generate complementary themes
    const complementaryHue = (baseHue + 180) % 360;
    const analogousHue1 = (baseHue + 30) % 360;
    const analogousHue2 = (baseHue - 30 + 360) % 360;
    
    variations.push({
      name: 'Complementary',
      primaryColor: this.hslToHex(complementaryHue, 70, 50),
      secondaryColor: this.hslToHex(complementaryHue, 20, 95),
      fontFamily: baseTheme.fontFamily
    });
    
    variations.push({
      name: 'Analogous 1',
      primaryColor: this.hslToHex(analogousHue1, 70, 50),
      secondaryColor: this.hslToHex(analogousHue1, 20, 95),
      fontFamily: baseTheme.fontFamily
    });
    
    variations.push({
      name: 'Analogous 2',
      primaryColor: this.hslToHex(analogousHue2, 70, 50),
      secondaryColor: this.hslToHex(analogousHue2, 20, 95),
      fontFamily: baseTheme.fontFamily
    });
    
    return variations;
  }

  // Helper methods
  getHueFromHex(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let hue = 0;
    if (diff !== 0) {
      if (max === r) {
        hue = ((g - b) / diff) % 6;
      } else if (max === g) {
        hue = (b - r) / diff + 2;
      } else {
        hue = (r - g) / diff + 4;
      }
    }
    
    return Math.round(hue * 60);
  }

  hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = l - c / 2;
    
    let r = 0, g = 0, b = 0;
    
    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    } else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    } else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    } else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    } else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    } else if (300 <= h && h < 360) {
      r = c; g = 0; b = x;
    }
    
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
}

// Create singleton instance
const themeService = new ThemeService();

export default themeService;