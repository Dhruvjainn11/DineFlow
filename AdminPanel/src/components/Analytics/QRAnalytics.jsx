import React from 'react';
import { BarChart3 } from 'lucide-react';

const QRAnalytics = () => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">QR Code Scans</h2>
          <p className="text-sm text-gray-500">Analytics for QR code interactions.</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg shadow-inner">
          <BarChart3 className="h-6 w-6 text-blue-600" strokeWidth={2} />
        </div>
      </div>
      <div className="text-center text-gray-500">
        <p>QR Analytics data will be displayed here.</p>
      </div>
    </div>
  );
};

export default QRAnalytics;
