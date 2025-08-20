import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ThemePresets from './ThemePresets';
import { validateTheme, checkAccessibility } from '../../utils/themeValidation';

const ThemeSettings = () => {
  const { theme, features, cafeInfo, updateTheme, hasFeature } = useTheme();
  const [formData, setFormData] = useState({
    primaryColor: theme.primaryColor,
    secondaryColor: theme.secondaryColor,
    logoUrl: theme.logoUrl,
    fontFamily: theme.fontFamily
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [accessibilityWarnings, setAccessibilityWarnings] = useState([]);

  // Available font families
  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Open Sans', label: 'Open Sans (Friendly)' },
    { value: 'Lato', label: 'Lato (Professional)' },
    { value: 'Montserrat', label: 'Montserrat (Elegant)' },
    { value: 'Poppins', label: 'Poppins (Rounded)' },
    { value: 'Source Sans Pro', label: 'Source Sans Pro (Technical)' }
  ];

  // Check if theme customization is available
  if (!hasFeature('themeCustomization')) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Theme Customization</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Upgrade to Pro Plan Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Theme customization is available only for Pro plan subscribers.
                  Upgrade your plan to customize colors, fonts, and branding.
                </p>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="bg-yellow-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  useEffect(() => {
    const validation = validateTheme(formData);
    setValidationErrors(validation.errors);
    
    const warnings = checkAccessibility(formData);
    setAccessibilityWarnings(warnings);
  }, [formData]);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you'd upload this to a cloud storage service
      // For now, we'll create a temporary URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          logoUrl: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const validation = validateTheme(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setMessage({
        type: 'error',
        text: 'Please fix the validation errors before saving'
      });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateTheme(formData);
      setMessage({
        type: 'success',
        text: 'Theme updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to update theme'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      logoUrl: '',
      fontFamily: 'Inter'
    });
  };

  const previewStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor}20, ${formData.secondaryColor})`,
    fontFamily: formData.fontFamily
  };

  const handlePresetSelect = (preset) => {
    setFormData({
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      logoUrl: formData.logoUrl, // Keep existing logo
      fontFamily: preset.fontFamily
    });
    setMessage({ type: '', text: '' });
  };

  return (
    <div className="space-y-6">
      {/* Theme Presets */}
      <ThemePresets 
        onPresetSelect={handlePresetSelect}
        currentTheme={formData}
      />
      
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Theme Customization</h3>
            <p className="text-sm text-gray-600 mt-1">
              Customize your cafe's branding and theme colors
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Pro Plan
            </span>
          </div>
        </div>

        {message.text && (
          <div className={`mt-4 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Theme Settings</h4>
          
          <div className="space-y-4">
            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Color
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  className="w-12 h-10 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  name="secondaryColor"
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="#F3F4F6"
                />
              </div>
            </div>

            {/* Font Family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Font Family
              </label>
              <select
                name="fontFamily"
                value={formData.fontFamily}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {fontOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Logo Upload */}
            {hasFeature('customBranding') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>
                <div className="flex items-center space-x-4">
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain border border-gray-200 rounded"
                    />
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG up to 2MB. Recommended: 200x200px
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reset to Default
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4">Preview</h4>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div style={previewStyle} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {formData.logoUrl ? (
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo" 
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                      <span style={{ color: formData.primaryColor }} className="font-bold text-sm">
                        D
                      </span>
                    </div>
                  )}
                  <h3 
                    style={{ 
                      color: formData.primaryColor,
                      fontFamily: formData.fontFamily
                    }} 
                    className="text-lg font-semibold"
                  >
                    {cafeInfo?.name || 'Your Cafe Name'}
                  </h3>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  style={{
                    backgroundColor: formData.primaryColor,
                    fontFamily: formData.fontFamily
                  }}
                  className="w-full text-white py-2 px-4 rounded-md text-sm font-medium"
                >
                  Primary Button
                </button>
                
                <button
                  style={{
                    backgroundColor: formData.secondaryColor,
                    color: formData.primaryColor,
                    borderColor: formData.primaryColor,
                    fontFamily: formData.fontFamily
                  }}
                  className="w-full py-2 px-4 rounded-md text-sm font-medium border"
                >
                  Secondary Button
                </button>
                
                <div 
                  style={{
                    backgroundColor: 'white',
                    fontFamily: formData.fontFamily
                  }}
                  className="p-4 rounded-md"
                >
                  <h4 style={{ color: formData.primaryColor }} className="font-semibold mb-2">
                    Sample Card
                  </h4>
                  <p className="text-gray-600 text-sm">
                    This is how your content will look with the selected theme.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-3">
            Preview shows how your theme will appear across the admin panel
          </p>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
