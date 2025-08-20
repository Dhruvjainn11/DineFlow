// Theme validation utilities

export const validateHexColor = (color) => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
};

export const validateTheme = (theme) => {
  const errors = {};

  // Validate primary color
  if (!theme.primaryColor) {
    errors.primaryColor = 'Primary color is required';
  } else if (!validateHexColor(theme.primaryColor)) {
    errors.primaryColor = 'Primary color must be a valid hex color (e.g., #3B82F6)';
  }

  // Validate secondary color
  if (!theme.secondaryColor) {
    errors.secondaryColor = 'Secondary color is required';
  } else if (!validateHexColor(theme.secondaryColor)) {
    errors.secondaryColor = 'Secondary color must be a valid hex color (e.g., #F3F4F6)';
  }

  // Validate font family
  const validFonts = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Source Sans Pro'];
  if (!theme.fontFamily) {
    errors.fontFamily = 'Font family is required';
  } else if (!validFonts.includes(theme.fontFamily)) {
    errors.fontFamily = `Font family must be one of: ${validFonts.join(', ')}`;
  }

  // Validate logo URL if provided
  if (theme.logoUrl && theme.logoUrl.trim()) {
    const urlRegex = /^(https?:\/\/)|(data:image\/)/;
    if (!urlRegex.test(theme.logoUrl)) {
      errors.logoUrl = 'Logo URL must be a valid HTTP/HTTPS URL or data URL';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getContrastRatio = (color1, color2) => {
  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Calculate relative luminance
  const getLuminance = (rgb) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
};

export const checkAccessibility = (theme) => {
  const warnings = [];

  // Check contrast ratio between primary and secondary colors
  const contrastRatio = getContrastRatio(theme.primaryColor, theme.secondaryColor);
  
  if (contrastRatio < 3) {
    warnings.push({
      type: 'contrast',
      message: 'Low contrast between primary and secondary colors may affect readability',
      severity: 'warning'
    });
  }

  // Check if colors are too similar
  if (contrastRatio < 1.5) {
    warnings.push({
      type: 'similarity',
      message: 'Primary and secondary colors are too similar',
      severity: 'error'
    });
  }

  // Check for very bright colors that might cause eye strain
  const primaryRgb = hexToRgb(theme.primaryColor);
  if (primaryRgb) {
    const brightness = (primaryRgb.r * 299 + primaryRgb.g * 587 + primaryRgb.b * 114) / 1000;
    if (brightness > 200) {
      warnings.push({
        type: 'brightness',
        message: 'Primary color is very bright and may cause eye strain',
        severity: 'warning'
      });
    }
  }

  return warnings;
};

export const generateColorVariations = (baseColor) => {
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const adjustBrightness = (rgb, percent) => {
    const factor = percent / 100;
    return {
      r: Math.max(0, Math.min(255, Math.round(rgb.r + (255 - rgb.r) * factor))),
      g: Math.max(0, Math.min(255, Math.round(rgb.g + (255 - rgb.g) * factor))),
      b: Math.max(0, Math.min(255, Math.round(rgb.b + (255 - rgb.b) * factor)))
    };
  };

  const rgb = hexToRgb(baseColor);
  if (!rgb) return {};

  return {
    50: rgbToHex(...Object.values(adjustBrightness(rgb, 95))),
    100: rgbToHex(...Object.values(adjustBrightness(rgb, 90))),
    200: rgbToHex(...Object.values(adjustBrightness(rgb, 80))),
    300: rgbToHex(...Object.values(adjustBrightness(rgb, 60))),
    400: rgbToHex(...Object.values(adjustBrightness(rgb, 40))),
    500: baseColor,
    600: rgbToHex(...Object.values(adjustBrightness(rgb, -20))),
    700: rgbToHex(...Object.values(adjustBrightness(rgb, -40))),
    800: rgbToHex(...Object.values(adjustBrightness(rgb, -60))),
    900: rgbToHex(...Object.values(adjustBrightness(rgb, -80)))
  };
};

// Helper function to convert hex to RGB (reused in multiple functions)
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};