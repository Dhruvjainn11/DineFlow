import React from "react";
import { useForm } from "react-hook-form";
import { X, Calendar, User, Phone } from "lucide-react";
import { updateTable } from "../services/tableService";
import { FeatureToggle } from "./Common/FeatureGate";
import { useAuth } from "../context/AuthContext";

export default function TableUpdateForm({ table, onClose, onUpdate }) {
  const { cafe } = useAuth();
  console.log("User Permissions:", cafe.subscription.planType);
  
  
const isProUser = cafe.subscription.planType === 'pro';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    defaultValues: {
      tableNumber: table.tableNumber,
      tableName: table.tableName || "",
      capacity: table.capacity || 4,
      location: table.location || "",
      status: table.status || "Available",
      reservedBy: {
        name: table.reservedBy?.name || "",
        phone: table.reservedBy?.phone || "",
        reservedUntil: table.reservedBy?.reservedUntil 
          ? new Date(table.reservedBy.reservedUntil).toISOString().slice(0, 16)
          : "",
      },
    },
  });

  const currentStatus = watch("status");

  const onSubmit = async (data) => {
    try {
      // Prepare the update data
      const updateData = {
        tableNumber: data.tableNumber,
        tableName: data.tableName,
        capacity: Number(data.capacity),
        location: data.location,
        status: data.status,
      };

      // Only include reservation data if status is "Reserved"
      if (data.status === "Reserved") {
        updateData.reservedBy = {
          name: data.reservedBy.name,
          phone: data.reservedBy.phone,
          reservedUntil: new Date(data.reservedBy.reservedUntil),
        };
      } else {
        // Clear reservation if status changed from Reserved
        updateData.reservedBy = null;
      }

      const response = await updateTable(table._id, updateData);
      console.log("Table updated successfully:", response);
      onUpdate(response.data);
      onClose();
    } catch (error) {
      console.error("Error updating table:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] mx-4 overflow-hidden">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white p-4 border-b z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Update Table {table.tableNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-red-600 transition"
            >
              <X size={24} />
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
                  {...register("tableNumber", {
                    required: "Required",
                    min: { value: 1, message: "Must be ≥ 1" },
                  })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  {...register("capacity")}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[...Array(20)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
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
                {...register("tableName")}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="VIP Booth, Window Table, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                type="text"
                {...register("location")}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Near window, Outdoor, etc."
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status*
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
               {!isProUser ? (
  <option disabled title="Upgrade to Pro to unlock">Reserved (Pro only)</option>
) : (
  <option value="Reserved">Reserved</option>
)}

                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Reservation Details (only shown when status is Reserved) */}
            {currentStatus === "Reserved" && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                  <User className="mr-2" size={16} />
                  Reservation Details*
                </h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      {...register("reservedBy.name", {
                        required: "Name is required for reservation",
                      })}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.reservedBy?.name && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.reservedBy.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="tel"
                        {...register("reservedBy.phone", {
                          required: "Phone is required for reservation",
                        })}
                        className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {errors.reservedBy?.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.reservedBy.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reserved Until
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                      <input
                        type="datetime-local"
                        {...register("reservedBy.reservedUntil", {
                          required: "End time is required for reservation",
                        })}
                        className="w-full pl-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                    {errors.reservedBy?.reservedUntil && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.reservedBy.reservedUntil.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Sticky footer with submit button */}
        <div className="sticky bottom-0 bg-white p-4 border-t">
          <button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md shadow-sm transition duration-200"
          >
            Update Table
          </button>
        </div>
      </div>
    </div>
  );
}