import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import ThemeSettings from '../components/Settings/ThemeSettings';
import DarkModeToggle from '../components/Settings/DarkModeToggle';
import api from '../utils/api';

export default function Settings() {
  const { user, cafe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    general: {
      cafeName: '',
      description: '',
      address: '',
      phone: '',
      email: '',
      website: ''
    },
    theme: {
      primaryColor: '#3B82F6',
      logoUrl: '',
      customCSS: ''
    },
    operations: {
      openingTime: '09:00',
      closingTime: '22:00',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      taxRate: 5
    }
  });

  useEffect(() => {
    if (cafe) {
      setSettings(prev => ({
        ...prev,
        general: {
          cafeName: cafe.name || '',
          description: cafe.description || '',
          address: cafe.address || '',
          phone: cafe.phone || '',
          email: cafe.email || '',
          website: cafe.website || ''
        },
        theme: {
          primaryColor: cafe.theme?.primaryColor || '#3B82F6',
          logoUrl: cafe.theme?.logoUrl || '',
          customCSS: cafe.theme?.customCSS || ''
        },
        operations: {
          openingTime: cafe.settings?.openingTime || '09:00',
          closingTime: cafe.settings?.closingTime || '22:00',
          timezone: cafe.settings?.timezone || 'Asia/Kolkata',
          currency: cafe.settings?.currency || 'INR',
          taxRate: cafe.settings?.taxRate || 5
        }
      }));
    }
  }, [cafe]);

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const saveSettings = async (section) => {
    setLoading(true);
    setMessage('');

    try {
      await api.put(`/cafes/${user.cafeId}`, {
        [section]: settings[section]
      });

      setMessage(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setMessage(`Failed to save settings: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cafe Name
          </label>
          <input
            type="text"
            value={settings.general.cafeName}
            onChange={(e) => handleInputChange('general', 'cafeName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={settings.general.phone}
            onChange={(e) => handleInputChange('general', 'phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={settings.general.description}
          onChange={(e) => handleInputChange('general', 'description', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <textarea
          value={settings.general.address}
          onChange={(e) => handleInputChange('general', 'address', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={settings.general.email}
            onChange={(e) => handleInputChange('general', 'email', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website
          </label>
          <input
            type="url"
            value={settings.general.website}
            onChange={(e) => handleInputChange('general', 'website', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={() => saveSettings('general')}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save General Settings'}
      </button>
    </div>
  );

  const renderOperationsSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Opening Time
          </label>
          <input
            type="time"
            value={settings.operations.openingTime}
            onChange={(e) => handleInputChange('operations', 'openingTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Closing Time
          </label>
          <input
            type="time"
            value={settings.operations.closingTime}
            onChange={(e) => handleInputChange('operations', 'closingTime', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Currency
          </label>
          <select
            value={settings.operations.currency}
            onChange={(e) => handleInputChange('operations', 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="INR">Indian Rupee (₹)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.operations.taxRate}
            onChange={(e) => handleInputChange('operations', 'taxRate', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <button
        onClick={() => saveSettings('operations')}
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Operations Settings'}
      </button>
    </div>
  );

  return (
    <RoleBasedLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Cafe Settings</h2>
            <p className="text-gray-600 mt-1">Manage your cafe configuration and preferences</p>
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
                { name: 'general', label: 'General' },
                { name: 'theme', label: 'Theme' },
                { name: 'operations', label: 'Operations' }
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
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'theme' && (
              <div className="space-y-6">
                <ThemeSettings />
                <DarkModeToggle />
              </div>
            )}
            {activeTab === 'operations' && renderOperationsSettings()}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
}