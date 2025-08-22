import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { createTable } from '../services/tableService';
import { useAuth } from '../context/AuthContext';
import { X } from 'lucide-react';

const TableForm = ({ onSuccess, onCancel, onClose }) => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      // Prepare payload with cafeId based on user role
      const payload = {
        tableNumber: parseInt(data.tableNumber),
        tableName: data.tableName || '',
        capacity: data.capacity ? parseInt(data.capacity) : 4,
        location: data.location || '',
        status: data.status || 'Available'
      };

      // Add cafeId based on user role
      if (user.role === 'super-admin') {
        // For super admin, get cafeId from localStorage or props
        const cafeId = localStorage.getItem('selectedCafeId') || user.cafeId;
        if (!cafeId) {
          toast.error('Please select a cafe first');
          return;
        }
        payload.cafeId = cafeId;
      } else {
        // For cafe admin, use their associated cafeId
        payload.cafeId = user.cafeId;
      }

      console.log('Creating table with payload:', payload);
      
      const result = await createTable(payload);
      toast.success('Table created successfully!');
      onSuccess?.(result);
      onClose?.();
    } catch (error) {
      console.error('Error creating table:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const message = error.response?.data?.message;
        if (message?.includes('already exists')) {
          toast.error('Table number already exists in this cafe');
        } else if (message?.includes('cafeId')) {
          toast.error('Missing cafe information. Please try again.');
        } else {
          toast.error('Table already exists or missing required information');
        }
      } else {
        toast.error('Failed to create table. Please try again.');
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] mx-4 overflow-hidden">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white p-4 border-b z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Create New Table
            </h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancel?.();
              }}
              className="text-gray-500 hover:text-red-600 transition p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 120px)' }}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Table Number*
                </label>
                <input
                  type="number"
                  {...register('tableNumber', { 
                    required: 'Table number is required',
                    min: { value: 1, message: 'Table number must be at least 1' },
                    max: { value: 999, message: 'Table number cannot exceed 999' }
                  })}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tableNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="1"
                  min="1"
                  max="999"
                />
                {errors.tableNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tableNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity*
                </label>
                <select
                  {...register('capacity')}
                  defaultValue="4"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} {i + 1 === 1 ? 'person' : 'people'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Table Name (Optional)
              </label>
              <input
                type="text"
                {...register('tableName')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., VIP Booth, Window Table"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Near window, Outdoor"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <select
                {...register('status')}
                defaultValue="Available"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">🟢 Available</option>
                <option value="Occupied">🔴 Occupied</option>
                <option value="Reserved">🟡 Reserved</option>
                <option value="Maintenance">🔧 Maintenance</option>
              </select>
            </div>
          </form>
        </div>

        {/* Sticky footer with buttons */}
        <div className="sticky bottom-0 bg-white p-4 border-t">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 py-2 px-4 rounded-md transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-md shadow-sm transition duration-200 flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Create Table'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableForm;