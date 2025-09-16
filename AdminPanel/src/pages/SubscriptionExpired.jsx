import React, { useState, useEffect } from 'react';
import { AlertTriangle, CreditCard, Phone, Mail, Clock, Shield, BarChart3, Utensils } from 'lucide-react';

export default function SubscriptionExpired() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleContactSupport = () => {
    window.open('mailto:dhruvjainn25@gmail.com?subject=Subscription Renewal Request', '_blank');
  };



  const restrictedFeatures = [
    { icon: Utensils, text: 'Menu Management', color: 'text-orange-600' },
    { icon: BarChart3, text: 'Order Processing', color: 'text-blue-600' },
    { icon: Shield, text: 'Analytics Dashboard', color: 'text-green-600' },
    { icon: CreditCard, text: 'Payment Processing', color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className={`max-w-lg w-full transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}>
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <AlertTriangle className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Subscription Expired
              </h1>
              <p className="text-red-100 text-lg">
                Your Annsh access has been suspended
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            {/* Message */}
            <div className="text-center mb-8">
              <p className="text-gray-700 text-lg leading-relaxed">
                To continue managing your cafe and serving customers, please renew your subscription immediately.
              </p>
            </div>

            {/* Restricted Features */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 mb-8 border border-red-100">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-red-600 mr-2" />
                <h3 className="font-bold text-red-800 text-lg">Currently Unavailable</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {restrictedFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-white/60 rounded-xl">
                      <IconComponent className={`h-5 w-5 ${feature.color}`} />
                      <span className="text-gray-700 font-medium text-sm">{feature.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={handleContactSupport}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <Mail className="h-5 w-5" />
                Email Support for Renewal
              </button>

              
              <button
                onClick={() => window.location.href = '/login'}
                className="w-full bg-gray-100 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300 border border-gray-200 hover:border-gray-300"
              >
                Return to Login
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2 font-medium">
                Need immediate assistance?
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
                <a 
                  href="mailto:dhruvjainn25@gmail.com" 
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-colors"
                >
                  dhruvjainn25@gmail.com
                </a>
                <span className="hidden sm:block text-gray-400">•</span>
                <a 
                  href="tel:+1234567890" 
                  className="text-green-600 hover:text-green-700 font-medium hover:underline transition-colors"
                >
                +91 70439 74792
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}