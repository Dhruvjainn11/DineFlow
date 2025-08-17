import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { createTable } from "../services/tableService";

export default function TableForm({ onClose, fetchTables }) {  // Added fetchTables prop
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      tableNumber: "",
      tableName: "",
      capacity: 4,
      location: "",
      status: "Available"
    }
  });

const onSubmit = async (data) => {
  try {
    // const cafeId = localStorage.getItem("cafeId");
    console.log("Submitting table data:", data);
    
    const response = await createTable({ 
      ...data
    });

    console.log("Table creation response:", response);
    
    if (response.success) {
      await fetchTables();
      reset();
      onClose();
    } else {
      console.error("Table creation failed:", response.message);
      // Show error to user (consider adding toast/alert)
    }
  } catch (error) {
    console.error("Error creating table:", error);
    // Show error to user
  }
};

  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }
  };

  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="relative bg-white w-full max-w-xl p-6 rounded-2xl shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Add Table</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Table Number */}
          <div>
            <label className="block mb-1 font-medium">Table Number*</label>
            <input
              type="number"
              {...register("tableNumber", { 
                required: "Table number is required",
                min: { value: 1, message: "Must be at least 1" }
              })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="e.g., 1, 2, 3"
            />
            {errors.tableNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.tableNumber.message}</p>
            )}
          </div>

          {/* Table Name */}
          <div>
            <label className="block mb-1 font-medium">Table Name (Optional)</label>
            <input
              type="text"
              {...register("tableName")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="e.g., Window Table, VIP Booth"
              maxLength={50}
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block mb-1 font-medium">Capacity*</label>
            <select
              {...register("capacity", { 
                required: "Capacity is required",
                valueAsNumber: true 
              })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(num => (
                <option key={num} value={num}>{num} {num === 1 ? 'person' : 'people'}</option>
              ))}
            </select>
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity.message}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block mb-1 font-medium">Location (Optional)</label>
            <input
              type="text"
              {...register("location")}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="e.g., Near window, Outdoor patio"
              maxLength={50}
            />
          </div>

          {/* Initial Status */}
          <div>
            <label className="block mb-1 font-medium">Initial Status*</label>
            <select
              {...register("status", { required: "Status is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Reserved">Reserved</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md w-full transition duration-200 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Adding...' : 'Add Table'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}