import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const PrinterSettings = () => {
  const [settings, setSettings] = useState({
    enabled: false,
    printerName: '',
    printerType: 'thermal',
    autoPrint: false,
    copies: 1
  });
  const [printers, setPrinters] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchPrinters();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/printer/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const fetchPrinters = async () => {
    try {
      const response = await api.get('/printer/available');
      setPrinters(response.data.printers);
    } catch (error) {
      console.error('Failed to fetch printers:', error);
    }
  };

  const testPrinter = async () => {
    if (!settings.printerName) {
      alert('Please select a printer first');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/printer/test', {
        printerName: settings.printerName
      });
      
      if (response.data.success) {
        alert('✅ Test print successful!');
      } else {
        alert('❌ Test print failed: ' + response.data.message);
      }
    } catch (error) {
      alert('❌ Test failed: ' + error.message);
    }
    setLoading(false);
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await api.put('/printer/settings', settings);
      alert('✅ Printer settings saved!');
    } catch (error) {
      alert('❌ Failed to save: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Printer Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow space-y-6">
        {/* Enable Printing */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({...settings, enabled: e.target.checked})}
            />
            <span className="font-medium">Enable Auto-Printing</span>
          </label>
        </div>

        {/* Printer Selection */}
        <div>
          <label className="block font-medium mb-2">Select Printer:</label>
          <select
            value={settings.printerName}
            onChange={(e) => setSettings({...settings, printerName: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="">-- Select Printer --</option>
            {printers.map(printer => (
              <option key={printer} value={printer}>{printer}</option>
            ))}
          </select>
          <button
            onClick={fetchPrinters}
            className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm"
          >
            Refresh Printers
          </button>
        </div>

        {/* Printer Type */}
        <div>
          <label className="block font-medium mb-2">Printer Type:</label>
          <select
            value={settings.printerType}
            onChange={(e) => setSettings({...settings, printerType: e.target.value})}
            className="w-full p-2 border rounded"
          >
            <option value="thermal">Thermal Printer</option>
            <option value="regular">Regular Printer</option>
          </select>
        </div>

        {/* Auto Print */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.autoPrint}
              onChange={(e) => setSettings({...settings, autoPrint: e.target.checked})}
            />
            <span className="font-medium">Auto-print new orders</span>
          </label>
        </div>

        {/* Copies */}
        <div>
          <label className="block font-medium mb-2">Number of Copies:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={settings.copies}
            onChange={(e) => setSettings({...settings, copies: parseInt(e.target.value)})}
            className="w-20 p-2 border rounded"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={testPrinter}
            disabled={loading || !settings.printerName}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Print'}
          </button>
          
          <button
            onClick={saveSettings}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrinterSettings;