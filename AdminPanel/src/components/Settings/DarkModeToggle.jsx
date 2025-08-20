import React, { useState, useEffect } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference or default to light mode
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const shouldUseDark = savedMode === 'true' || (!savedMode && prefersDark);
    setIsDarkMode(shouldUseDark);
    applyDarkMode(shouldUseDark);
  }, []);

  const applyDarkMode = (isDark) => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
      // Update CSS variables for dark mode
      root.style.setProperty('--bg-primary', '#1F2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--text-primary', '#F9FAFB');
      root.style.setProperty('--text-secondary', '#D1D5DB');
      root.style.setProperty('--border-color', '#4B5563');
    } else {
      root.classList.remove('dark');
      // Reset to light mode
      root.style.setProperty('--bg-primary', '#FFFFFF');
      root.style.setProperty('--bg-secondary', '#F9FAFB');
      root.style.setProperty('--text-primary', '#111827');
      root.style.setProperty('--text-secondary', '#6B7280');
      root.style.setProperty('--border-color', '#E5E7EB');
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    applyDarkMode(newMode);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-md font-semibold text-gray-800">Dark Mode</h4>
          <p className="text-sm text-gray-600 mt-1">
            Toggle between light and dark themes
          </p>
        </div>
        
        <button
          onClick={toggleDarkMode}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
            isDarkMode ? 'bg-primary' : 'bg-gray-200'
          }`}
        >
          <span className="sr-only">Toggle dark mode</span>
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isDarkMode ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
      
      {/* Preview */}
      <div className="mt-4 p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Light Mode Preview */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded p-3 text-center">
              <div className="w-4 h-4 bg-yellow-400 rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-gray-600">Light Mode</span>
            </div>
          </div>
          
          {/* Dark Mode Preview */}
          <div className="flex-1">
            <div className="bg-gray-800 border border-gray-600 rounded p-3 text-center">
              <div className="w-4 h-4 bg-blue-400 rounded-full mx-auto mb-2"></div>
              <span className="text-xs text-gray-300">Dark Mode</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-2">
            <p className="text-xs text-amber-700">
              Dark mode is applied system-wide and will be remembered for your next visit.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DarkModeToggle;