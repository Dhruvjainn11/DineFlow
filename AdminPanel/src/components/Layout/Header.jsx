import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const Header = ({ title = 'Dashboard', subtitle = '' }) => {
  const { user, logout } = useAuth();
  const { getBrandName, getLogoUrl, hasFeature, cafeInfo } = useTheme();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Logo and Brand */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              {getLogoUrl() ? (
                <img 
                  src={getLogoUrl()} 
                  alt={`${getBrandName()} Logo`}
                  className="h-8 w-auto object-contain"
                />
              ) : (
                <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {getBrandName().charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Brand Name and Title */}
            <div className="flex flex-col">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-semibold text-gray-900 font-theme">
                  {getBrandName()}
                </h1>
                {hasFeature('whiteLabel') && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    White Label
                  </span>
                )}
              </div>
              {title && title !== getBrandName() && (
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-sm text-gray-500">
                    {title}
                  </span>
                  {subtitle && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400">
                        {subtitle}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right side - User info and actions */}
          <div className="flex items-center space-x-4">
            {/* Plan Badge */}
            <div className="hidden sm:flex items-center">
              {cafeInfo?.plan && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cafeInfo.plan === 'pro' 
                    ? 'bg-purple-100 text-purple-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {cafeInfo.plan === 'pro' ? 'Pro Plan' : 'Basic Plan'}
                </span>
              )}
            </div>

            {/* Notification Bell - Pro feature */}
            {hasFeature('prioritySupport') && (
              <button className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM21 3L9 15l-6-6-3 3 9 9 15-15z" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
            )}

            {/* User Dropdown */}
            <div className="relative inline-block text-left group">
              <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {cafeInfo && (
                      <p className="text-xs text-gray-400 mt-1">{cafeInfo.name}</p>
                    )}
                  </div>
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Profile Settings
                  </button>
                  
                  {hasFeature('themeCustomization') && (
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      Theme Settings
                    </button>
                  )}
                  
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    Help & Support
                  </button>
                  
                  <div className="border-t border-gray-100 mt-1">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Plan Badge */}
      {cafeInfo?.plan && (
        <div className="sm:hidden px-4 pb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            cafeInfo.plan === 'pro' 
              ? 'bg-purple-100 text-purple-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {cafeInfo.plan === 'pro' ? 'Pro Plan' : 'Basic Plan'}
          </span>
        </div>
      )}
    </header>
  );
};

export default Header;
