import React, { useState } from 'react';
import { XMarkIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import api from '../utils/api';
import { toast } from 'react-toastify';

export default function ExtendSubscriptionModal({ isOpen, onClose, cafe, onExtensionComplete }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    extensionDays: '',
    reason: 'Payment Received'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.extensionDays || formData.extensionDays < 1 || formData.extensionDays > 365) {
      toast.error('Extension days must be between 1 and 365');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put(`/super-admin/cafes/${cafe._id}/extend-subscription`, {
        extensionDays: parseInt(formData.extensionDays),
        reason: formData.reason
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onExtensionComplete();
        onClose();
        setFormData({ extensionDays: '', reason: 'Payment Received' });
      }
    } catch (error) {
      console.error('Extension error:', error);
      toast.error(error.response?.data?.message || 'Failed to extend subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateNewEndDate = () => {
    if (!formData.extensionDays || !cafe?.subscription?.endDate) return null;
    
    const currentEndDate = new Date(cafe.subscription.endDate);
    const extendFromDate = currentEndDate > new Date() ? currentEndDate : new Date();
    const newEndDate = new Date(extendFromDate.getTime() + (parseInt(formData.extensionDays) * 24 * 60 * 60 * 1000));
    
    return newEndDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-5 w-5 text-blue-600 mr-2" />
            Extend Subscription
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Cafe:</strong> {cafe?.name}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Current End Date:</strong> {' '}
            {cafe?.subscription?.endDate 
              ? new Date(cafe.subscription.endDate).toLocaleDateString()
              : 'Not set'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extension Days
            </label>
            <input
              type="number"
              name="extensionDays"
              value={formData.extensionDays}
              onChange={handleChange}
              min="1"
              max="365"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter days (1-365)"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Payment Received">Payment Received</option>
              <option value="Grace Period">Grace Period</option>
              <option value="Support">Support</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {formData.extensionDays && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>New End Date:</strong> {calculateNewEndDate()}
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Extending...' : 'Extend Subscription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}