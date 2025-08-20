import React from 'react';

const ThemePresets = ({ onPresetSelect, currentTheme }) => {
  const presets = [
    {
      id: 'default',
      name: 'DineFlow Blue',
      description: 'Classic blue theme',
      primaryColor: '#3B82F6',
      secondaryColor: '#F3F4F6',
      fontFamily: 'Inter'
    },
    {
      id: 'warm',
      name: 'Warm Amber',
      description: 'Cozy amber theme',
      primaryColor: '#F59E0B',
      secondaryColor: '#FEF3C7',
      fontFamily: 'Inter'
    },
    {
      id: 'elegant',
      name: 'Elegant Purple',
      description: 'Sophisticated purple',
      primaryColor: '#8B5CF6',
      secondaryColor: '#F3E8FF',
      fontFamily: 'Poppins'
    },
    {
      id: 'fresh',
      name: 'Fresh Green',
      description: 'Natural green theme',
      primaryColor: '#10B981',
      secondaryColor: '#ECFDF5',
      fontFamily: 'Inter'
    },
    {
      id: 'bold',
      name: 'Bold Red',
      description: 'Energetic red theme',
      primaryColor: '#EF4444',
      secondaryColor: '#FEF2F2',
      fontFamily: 'Montserrat'
    },
    {
      id: 'professional',
      name: 'Professional Gray',
      description: 'Clean gray theme',
      primaryColor: '#6B7280',
      secondaryColor: '#F9FAFB',
      fontFamily: 'Source Sans Pro'
    },
    {
      id: 'ocean',
      name: 'Ocean Teal',
      description: 'Calming teal theme',
      primaryColor: '#0D9488',
      secondaryColor: '#F0FDFA',
      fontFamily: 'Lato'
    },
    {
      id: 'sunset',
      name: 'Sunset Orange',
      description: 'Vibrant orange theme',
      primaryColor: '#F97316',
      secondaryColor: '#FFF7ED',
      fontFamily: 'Roboto'
    }
  ];

  const isCurrentPreset = (preset) => {
    return currentTheme.primaryColor === preset.primaryColor &&
           currentTheme.secondaryColor === preset.secondaryColor &&
           currentTheme.fontFamily === preset.fontFamily;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h4 className="text-md font-semibold text-gray-800 mb-4">Theme Presets</h4>
      <p className="text-sm text-gray-600 mb-6">
        Choose from our curated theme presets or customize your own
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {presets.map((preset) => (
          <div
            key={preset.id}
            className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              isCurrentPreset(preset)
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onPresetSelect(preset)}
          >
            {/* Color Preview */}
            <div className="flex items-center space-x-2 mb-3">
              <div
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: preset.primaryColor }}
              />
              <div
                className="w-6 h-6 rounded-full border border-gray-200"
                style={{ backgroundColor: preset.secondaryColor }}
              />
            </div>
            
            {/* Theme Info */}
            <div>
              <h5 
                className="font-medium text-sm mb-1"
                style={{ 
                  color: preset.primaryColor,
                  fontFamily: preset.fontFamily
                }}
              >
                {preset.name}
              </h5>
              <p className="text-xs text-gray-500 mb-2">
                {preset.description}
              </p>
              <p className="text-xs text-gray-400">
                {preset.fontFamily}
              </p>
            </div>
            
            {/* Current Indicator */}
            {isCurrentPreset(preset) && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            )}
            
            {/* Preview Sample */}
            <div className="mt-3 p-2 rounded border" style={{ backgroundColor: preset.secondaryColor }}>
              <div 
                className="text-xs font-medium mb-1"
                style={{ 
                  color: preset.primaryColor,
                  fontFamily: preset.fontFamily
                }}
              >
                Sample Text
              </div>
              <div 
                className="w-full h-2 rounded"
                style={{ backgroundColor: preset.primaryColor }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Pro Tip
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                After selecting a preset, you can further customize the colors and fonts in the Theme Settings section.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemePresets;