import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Printer } from 'lucide-react';
import PrinterSetupGuide from '../PrinterSetupGuide';

const PrinterSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    printerName: '',
    printerType: 'thermal',
    autoPrint: false,
    copies: 1
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/printer/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };



  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put('/printer/settings', settings);
      alert('✅ Printer settings saved!');
    } catch (error) {
      alert('❌ Failed to save: ' + error.message);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Printer className="h-6 w-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Printer Configuration</h3>
          <p className="text-sm text-gray-600">Configure automatic ticket printing for orders</p>
        </div>
      </div>
      
      <PrinterSetupGuide />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enable Printing */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <div>
              <span className="font-medium text-gray-900">Enable Auto-Printing</span>
              <p className="text-sm text-gray-600">Automatically print tickets when orders are placed</p>
            </div>
          </label>
        </div>

        {/* Auto Print */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={settings.autoPrint}
              onChange={(e) => setSettings({...settings, autoPrint: e.target.checked})}
              className="h-4 w-4 text-blue-600 rounded"
              disabled={!settings.enabled}
            />
            <div>
              <span className="font-medium text-gray-900">Auto-print New Orders</span>
              <p className="text-sm text-gray-600">Print immediately when orders arrive</p>
            </div>
          </label>
        </div>
      </div>

      {settings.enabled && (
        <div className="space-y-4">
          {/* Printer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Printer Name
            </label>
            <input
              type="text"
              value={settings.printerName}
              onChange={(e) => setSettings({...settings, printerName: e.target.value})}
              placeholder="Enter your printer name (e.g., POS-80, TM-T20)"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 Find your printer name in Windows Settings → Printers & scanners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Printer Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Printer Type
              </label>
              <select
                value={settings.printerType}
                onChange={(e) => setSettings({...settings, printerType: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="thermal">Thermal Printer</option>
                <option value="regular">Regular Printer</option>
              </select>
            </div>

            {/* Copies */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Copies
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.copies}
                onChange={(e) => setSettings({...settings, copies: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={saveSettings}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}

      {!settings.enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            💡 Enable auto-printing to configure printer settings and automatically print order tickets.
          </p>
        </div>
      )}
    </div>
  );
};

export default PrinterSettings;