import React, { useState } from 'react';
import { Printer, Settings, CheckCircle } from 'lucide-react';

const PrinterSetupGuide = () => {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-900">Auto-Print Setup</span>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="text-blue-600 hover:text-blue-800 text-sm"
        >
          {showGuide ? 'Hide' : 'Show'} Setup Guide
        </button>
      </div>
      
      {showGuide && (
        <div className="mt-4 space-y-3 text-sm text-blue-800">
          <div className="font-medium">For Fully Automatic Printing (No Dialog):</div>
          
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Chrome:</strong> Go to Settings → Advanced → Printing → 
                Set your printer as default and enable "Print without preview"
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Allow Popups:</strong> Click popup blocked icon in address bar → 
                "Always allow popups from this site"
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>For HP LaserJet:</strong> Set paper size to A4 or Letter, 
                margins to minimum for best results
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mt-3">
            <div className="text-yellow-800 text-xs">
              💡 <strong>Tip:</strong> Keep this admin page open in a dedicated browser window 
              for best auto-printing performance
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrinterSetupGuide;