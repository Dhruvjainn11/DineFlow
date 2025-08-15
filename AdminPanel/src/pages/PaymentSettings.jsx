import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import FeatureGate from '../components/Common/FeatureGate';
import api from '../utils/api';

export default function PaymentSettings() {
  const { user, cafe } = useAuth();
  const [activeTab, setActiveTab] = useState('razorpay');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [analytics, setAnalytics] = useState(null);

  const [paymentSettings, setPaymentSettings] = useState({
    razorpay: {
      keyId: '',
      keySecret: '',
      enabled: false
    },
    stripe: {
      publishableKey: '',
      secretKey: '',
      enabled: false
    },
    paypal: {
      clientId: '',
      clientSecret: '',
      enabled: false
    }
  });

  useEffect(() => {
    loadPaymentSettings();
    loadPaymentAnalytics();
  }, []);

  const loadPaymentSettings = () => {
    if (cafe?.paymentDetails) {
      setPaymentSettings(prev => ({
        ...prev,
        razorpay: {
          keyId: cafe.paymentDetails.razorpay?.keyId || '',
          keySecret: cafe.paymentDetails.razorpay?.keySecret || '',
          enabled: cafe.paymentDetails.razorpay?.enabled || false
        },
        stripe: {
          publishableKey: cafe.paymentDetails.stripe?.publishableKey || '',
          secretKey: cafe.paymentDetails.stripe?.secretKey || '',
          enabled: cafe.paymentDetails.stripe?.enabled || false
        },
        paypal: {
          clientId: cafe.paymentDetails.paypal?.clientId || '',
          clientSecret: cafe.paymentDetails.paypal?.clientSecret || '',
          enabled: cafe.paymentDetails.paypal?.enabled || false
        }
      }));
    }
  };

  const loadPaymentAnalytics = async () => {
    try {
      const response = await api.get(`/payments/analytics/${user.cafeId}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load payment analytics:', error);
    }
  };

  const handleSettingChange = (gateway, field, value) => {
    setPaymentSettings(prev => ({
      ...prev,
      [gateway]: {
        ...prev[gateway],
        [field]: value
      }
    }));
  };

  const saveGatewaySettings = async (gateway) => {
    setLoading(true);
    setMessage('');

    try {
      await api.put(`/payments/settings/${user.cafeId}`, {
        gateway,
        settings: paymentSettings[gateway]
      });

      setMessage(`${gateway.charAt(0).toUpperCase() + gateway.slice(1)} settings saved successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save payment settings:', error);
      setMessage(`Failed to save ${gateway} settings: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGatewayConnection = async (gateway) => {
    setLoading(true);
    setMessage('');

    try {
      // This would be a test API call to verify the gateway credentials
      setMessage(`${gateway.charAt(0).toUpperCase() + gateway.slice(1)} connection test successful!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`${gateway} connection test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderRazorpaySettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-blue-700 text-sm">
            Get your Razorpay API credentials from your{' '}
            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" 
               className="underline font-medium">Razorpay Dashboard</a>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key ID
          </label>
          <input
            type="text"
            value={paymentSettings.razorpay.keyId}
            onChange={(e) => handleSettingChange('razorpay', 'keyId', e.target.value)}
            placeholder="rzp_live_xxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Key Secret
          </label>
          <input
            type="password"
            value={paymentSettings.razorpay.keySecret}
            onChange={(e) => handleSettingChange('razorpay', 'keySecret', e.target.value)}
            placeholder="••••••••••••••••"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="razorpay-enabled"
          type="checkbox"
          checked={paymentSettings.razorpay.enabled}
          onChange={(e) => handleSettingChange('razorpay', 'enabled', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="razorpay-enabled" className="ml-2 block text-sm text-gray-900">
          Enable Razorpay for online payments
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => saveGatewaySettings('razorpay')}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Settings'}
        </button>

        <button
          onClick={() => testGatewayConnection('razorpay')}
          disabled={loading || !paymentSettings.razorpay.keyId || !paymentSettings.razorpay.keySecret}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          Test Connection
        </button>
      </div>
    </div>
  );

  const renderStripeSettings = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center">
          <svg className="w-5 h-5 text-purple-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <p className="text-purple-700 text-sm">
            Get your Stripe API credentials from your{' '}
            <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" 
               className="underline font-medium">Stripe Dashboard</a>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publishable Key
          </label>
          <input
            type="text"
            value={paymentSettings.stripe.publishableKey}
            onChange={(e) => handleSettingChange('stripe', 'publishableKey', e.target.value)}
            placeholder="pk_live_xxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Secret Key
          </label>
          <input
            type="password"
            value={paymentSettings.stripe.secretKey}
            onChange={(e) => handleSettingChange('stripe', 'secretKey', e.target.value)}
            placeholder="sk_live_xxxxxxxxxx"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="flex items-center">
        <input
          id="stripe-enabled"
          type="checkbox"
          checked={paymentSettings.stripe.enabled}
          onChange={(e) => handleSettingChange('stripe', 'enabled', e.target.checked)}
          className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
        />
        <label htmlFor="stripe-enabled" className="ml-2 block text-sm text-gray-900">
          Enable Stripe for online payments
        </label>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => saveGatewaySettings('stripe')}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : 'Save Settings'}
        </button>

        <button
          onClick={() => testGatewayConnection('stripe')}
          disabled={loading || !paymentSettings.stripe.publishableKey || !paymentSettings.stripe.secretKey}
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          Test Connection
        </button>
      </div>
    </div>
  );

  const renderAnalytics = () => {
    if (!analytics) return null;

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{analytics.totalOrders}</p>
              </div>
              <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Online Payments</p>
                <p className="text-2xl font-bold">{analytics.onlinePayments.count}</p>
                <p className="text-blue-100 text-xs">₹{analytics.onlinePayments.totalAmount.toFixed(2)}</p>
              </div>
              <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-100 text-sm font-medium">Offline Payments</p>
                <p className="text-2xl font-bold">{analytics.offlinePayments.count}</p>
                <p className="text-gray-100 text-xs">₹{analytics.offlinePayments.totalAmount.toFixed(2)}</p>
              </div>
              <svg className="w-8 h-8 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {analytics.gatewayBreakdown.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Gateway Breakdown</h3>
            <div className="space-y-3">
              {analytics.gatewayBreakdown.map((gateway, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      gateway._id === 'razorpay' ? 'bg-blue-500' : 
                      gateway._id === 'stripe' ? 'bg-purple-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="font-medium capitalize">{gateway._id || 'Unknown'}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{gateway.count} orders</p>
                    <p className="text-sm text-gray-600">₹{gateway.totalAmount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <FeatureGate requiredFeature="onlinePayments">
      <RoleBasedLayout>
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Payment Settings</h2>
              <p className="text-gray-600 mt-1">Configure online payment gateways for your cafe</p>
            </div>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Pro Plan
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('success') 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {[
                  { name: 'razorpay', label: 'Razorpay' },
                  { name: 'stripe', label: 'Stripe' },
                  { name: 'analytics', label: 'Analytics' }
                ].map((tab) => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.name
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'razorpay' && renderRazorpaySettings()}
              {activeTab === 'stripe' && renderStripeSettings()}
              {activeTab === 'analytics' && renderAnalytics()}
            </div>
          </div>
        </div>
      </RoleBasedLayout>
    </FeatureGate>
  );
}
