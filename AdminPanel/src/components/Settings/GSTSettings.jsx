import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { Save, Plus, Trash2, Calculator } from 'lucide-react';

const GSTSettings = () => {
  const { cafe, refreshCafe } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gstSettings, setGstSettings] = useState({
    hasGST: false,
    gstNumber: '',
    gstRates: []
  });

  useEffect(() => {
    if (cafe?.settings) {
      setGstSettings({
        hasGST: cafe.settings.hasGST || false,
        gstNumber: cafe.settings.gstNumber || '',
        gstRates: cafe.settings.gstRates || []
      });
    }
  }, [cafe]);

  const handleGSTToggle = (enabled) => {
    setGstSettings(prev => ({
      ...prev,
      hasGST: enabled,
      gstRates: enabled ? prev.gstRates : []
    }));
  };

  const addGSTRate = () => {
    setGstSettings(prev => ({
      ...prev,
      gstRates: [
        ...prev.gstRates,
        { rateName: 'CGST', percentage: 0 }
      ]
    }));
  };

  const updateGSTRate = (index, field, value) => {
    setGstSettings(prev => ({
      ...prev,
      gstRates: prev.gstRates.map((rate, i) => 
        i === index ? { ...rate, [field]: value } : rate
      )
    }));
  };

  const removeGSTRate = (index) => {
    setGstSettings(prev => ({
      ...prev,
      gstRates: prev.gstRates.filter((_, i) => i !== index)
    }));
  };

  const calculateTotalGST = () => {
    return gstSettings.gstRates.reduce((total, rate) => total + (rate.percentage || 0), 0);
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // Validate GST number if GST is enabled
      if (gstSettings.hasGST && !gstSettings.gstNumber.trim()) {
        toast.error('GST Number is required when GST is enabled');
        return;
      }

      // Validate GST rates
      if (gstSettings.hasGST && gstSettings.gstRates.length === 0) {
        toast.error('At least one GST rate is required when GST is enabled');
        return;
      }

      const response = await api.put('/cafes/settings', {
        settings: {
          ...cafe.settings,
          hasGST: gstSettings.hasGST,
          gstNumber: gstSettings.gstNumber,
          gstRates: gstSettings.gstRates
        }
      });

      if (response.data.success) {
        toast.success('GST settings updated successfully');
        await refreshCafe();
      }
    } catch (error) {
      console.error('Error updating GST settings:', error);
      toast.error(error.response?.data?.message || 'Failed to update GST settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">GST Settings</h3>
          <p className="text-sm text-gray-500">Configure GST rates and tax calculations</p>
        </div>
        <Calculator className="h-6 w-6 text-indigo-600" />
      </div>

      {/* GST Enable/Disable */}
      <div className="mb-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Enable GST</h4>
            <p className="text-sm text-gray-500">Apply GST calculations to all orders</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={gstSettings.hasGST}
              onChange={(e) => handleGSTToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {gstSettings.hasGST && (
        <>
          {/* GST Number */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GST Number *
            </label>
            <input
              type="text"
              value={gstSettings.gstNumber}
              onChange={(e) => setGstSettings(prev => ({ ...prev, gstNumber: e.target.value }))}
              placeholder="Enter GST Number (e.g., 22AAAAA0000A1Z5)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* GST Rates */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                GST Rates
              </label>
              <button
                onClick={addGSTRate}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Rate
              </button>
            </div>

            <div className="space-y-3">
              {gstSettings.gstRates.map((rate, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <select
                    value={rate.rateName}
                    onChange={(e) => updateGSTRate(index, 'rateName', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="CGST">CGST</option>
                    <option value="SGST">SGST</option>
                    <option value="IGST">IGST</option>
                  </select>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={rate.percentage}
                      onChange={(e) => updateGSTRate(index, 'percentage', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      max="30"
                      step="0.1"
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-500">%</span>
                  </div>

                  <button
                    onClick={() => removeGSTRate(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {gstSettings.gstRates.length > 0 && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-indigo-900">Total GST Rate:</span>
                  <span className="text-lg font-bold text-indigo-600">{calculateTotalGST()}%</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save GST Settings'}
        </button>
      </div>
    </div>
  );
};

export default GSTSettings;