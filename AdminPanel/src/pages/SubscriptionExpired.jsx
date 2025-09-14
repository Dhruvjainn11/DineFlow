import React from 'react';
import { AlertTriangle, CreditCard, Phone, Mail } from 'lucide-react';

export default function SubscriptionExpired() {
  const handleContactSupport = () => {
    window.open('mailto:support@dineflow.com?subject=Subscription Renewal Request', '_blank');
  };

  const handleCallSupport = () => {
    window.open('tel:+1234567890', '_self');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Subscription Expired
        </h1>

        {/* Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your DineFlow subscription has expired. To continue using our services and access your cafe management features, please renew your subscription.
        </p>

        {/* Features Lost */}
        <div className="bg-red-50 rounded-lg p-4 mb-8">
          <h3 className="font-semibold text-red-800 mb-2">Access Restricted:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            <li>• Menu Management</li>
            <li>• Order Processing</li>
            <li>• Analytics Dashboard</li>
            <li>• Payment Processing</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Contact Support for Renewal
          </button>

          <button
            onClick={handleCallSupport}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Call Support
          </button>

          <button
            onClick={() => window.location.href = '/login'}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Back to Login
          </button>
        </div>

        {/* Support Info */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{' '}
            <a href="mailto:support@dineflow.com" className="text-blue-600 hover:underline">
              support@dineflow.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}