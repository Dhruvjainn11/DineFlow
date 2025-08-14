import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { createQRGenerator } from '../../utils/qrCodeGenerator';

const QRCodePreview = ({ 
  tableNumber = 5, 
  showComparison = false, 
  className = '' 
}) => {
  const { theme, features, cafeInfo, hasFeature } = useTheme();
  const [basicQR, setBasicQR] = useState('');
  const [proQR, setProQR] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    generatePreviewQRs();
  }, [theme, features, cafeInfo]);

  const generatePreviewQRs = async () => {
    setIsLoading(true);
    try {
      // Generate Basic QR (no features)
      const basicGenerator = createQRGenerator(
        cafeInfo, 
        { primaryColor: '#000000', logoUrl: '' }, 
        { premiumQRCodes: false, customBranding: false }
      );
      const basicQRData = await basicGenerator.generateQRCode(tableNumber, 'preview-basic');
      setBasicQR(basicQRData);

      // Generate Pro QR (with features)
      if (showComparison || hasFeature('premiumQRCodes')) {
        const proGenerator = createQRGenerator(
          cafeInfo, 
          theme, 
          { ...features, premiumQRCodes: true, customBranding: true }
        );
        const proQRData = await proGenerator.generateQRCode(tableNumber, 'preview-pro');
        setProQR(proQRData);
      }
    } catch (error) {
      console.error('Error generating preview QRs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Single QR view (current plan)
  if (!showComparison) {
    const currentQR = hasFeature('premiumQRCodes') ? proQR : basicQR;
    const planName = hasFeature('premiumQRCodes') ? 'Pro' : 'Basic';
    
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <div className="mb-4">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              hasFeature('premiumQRCodes') 
                ? 'bg-purple-100 text-purple-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {planName} Plan QR Code
            </span>
          </div>
          
          <div className="w-48 h-48 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4">
            {currentQR ? (
              <img 
                src={currentQR} 
                alt={`${planName} QR Code`}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="text-gray-400">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
            )}
          </div>
          
          <h4 className="font-semibold text-gray-900 mb-2">
            Table {tableNumber}
          </h4>
          
          <div className="text-sm text-gray-600 space-y-1">
            {hasFeature('premiumQRCodes') ? (
              <div className="space-y-1">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                  <span>Custom branded colors</span>
                </div>
                {theme.logoUrl && (
                  <div>✨ Logo overlay included</div>
                )}
                <div>🌐 Subdomain URL</div>
                <div>📱 High resolution</div>
              </div>
            ) : (
              <div className="space-y-1">
                <div>⚫ Standard black & white</div>
                <div>🌐 Standard URL</div>
                <div>🏢 DineFlow branding</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Comparison view (Basic vs Pro)
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          QR Code Plan Comparison
        </h3>
        <p className="text-sm text-gray-600">
          See the difference between Basic and Pro plan QR codes
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Plan QR */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-center">
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                Basic Plan
              </span>
            </div>
            
            <div className="w-40 h-40 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              {basicQR ? (
                <img 
                  src={basicQR} 
                  alt="Basic QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Standard QR Code</h4>
            
            <div className="text-left space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">⚫</span>
                <span>Black & white design</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">🌐</span>
                <span>Path-based URLs</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">🏢</span>
                <span>DineFlow branding</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-gray-400">📱</span>
                <span>Standard resolution</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Plan QR */}
        <div className="bg-white rounded-lg border-2 border-purple-200 p-6 relative">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 rounded-full text-xs font-medium">
              PREMIUM
            </span>
          </div>
          
          <div className="text-center">
            <div className="mb-4 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Pro Plan
              </span>
            </div>
            
            <div className="w-40 h-40 mx-auto bg-gray-50 rounded-lg flex items-center justify-center mb-4">
              {proQR ? (
                <img 
                  src={proQR} 
                  alt="Pro QR Code"
                  className="w-full h-full object-contain rounded-lg"
                />
              ) : (
                <div className="text-gray-400">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-3">Branded QR Code</h4>
            
            <div className="text-left space-y-2">
              <div className="flex items-center space-x-2 text-sm text-purple-700">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.primaryColor }}></div>
                <span>Custom brand colors</span>
              </div>
              {theme.logoUrl && (
                <div className="flex items-center space-x-2 text-sm text-purple-700">
                  <span>✨</span>
                  <span>Logo overlay</span>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-purple-700">
                <span>🌐</span>
                <span>Custom subdomain</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-700">
                <span>🏆</span>
                <span>White-label experience</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-purple-700">
                <span>📱</span>
                <span>High resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!hasFeature('premiumQRCodes') && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6 text-center">
          <h4 className="text-lg font-semibold text-purple-900 mb-2">
            Upgrade to Pro for Premium QR Codes
          </h4>
          <p className="text-purple-700 mb-4">
            Get branded QR codes with your logo, custom colors, and professional appearance
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Upgrade to Pro - $29/month
            </button>
            <button className="inline-flex items-center px-6 py-3 border border-purple-300 text-sm font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodePreview;
