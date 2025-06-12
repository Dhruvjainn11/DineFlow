import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react"; // uses lucide-react for better icons
import { createTable } from "../services/tableService";
export default function TableForm({onClose }) {

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    
  } = useForm();
  
  const create = async (data) => {
    try {
        const response = await createTable(data);
        
        
        console.log("Table created successfully:", response);
        onClose();
        } catch (error) {
        console.error("Error creating Table:", error);
        }
    }

  const submitHandler = async(data) => {
create(data)
console.log(data);

  
    reset(); // Clear the form after submission
  };

   const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }}

 

 return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0  flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Semi-transparent backdrop
    >
      <div className="relative bg-white w-full max-w-xl p-6 rounded-2xl shadow-lg">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Add Table</h2>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block mb-1 font-medium">Table Number</label>
            <input
            type="number"
              {...register("tableNumber", { required: "Item name is required" })}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="e.g., 1 , 2 , 3"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

      

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

