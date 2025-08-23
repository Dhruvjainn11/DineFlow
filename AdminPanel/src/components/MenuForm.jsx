// MenuItemForm.jsx

import { useEffect, useState } from "react";
import React from "react";
import { getCategories, createMenu } from "../services/menuService";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import ImageDropzone from "./ImageDropzone";
import { useTheme } from "../context/ThemeContext";

export default function MenuItemForm({ onClose }) {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [sizes, setSizes] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    // Set a default value for the category to an empty string.
    // This correctly reflects that no category has been selected yet.
    defaultValues: {
      category: "",
    },
  });

  const price = watch("price");

  const handleUpload = (url) => {
    setImageUrl(url);
  };

  // ----------------------- SIZES Logic -----------------------
  const handleAddSize = () => {
    setSizes([...sizes, { label: "", price: "" }]);
  };

  const handleRemoveSize = (index) => {
    const newSizes = sizes.filter((_, i) => i !== index);
    setSizes(newSizes);
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...sizes];
    if (field === 'price') {
      newSizes[index][field] = Number(value);
    } else {
      newSizes[index][field] = value;
    }
    setSizes(newSizes);
  };

  // ------------------- SUBMISSION Logic --------------------
const submitHandler = async (data) => {
  try {
    // Only include price if there are no sizes
    const shouldIncludePrice = sizes.length === 0;
    
    const payload = {
      name: data.name,
      description: data.description,
      // Conditionally include price
      ...(shouldIncludePrice && { price: Number(data.price) }),
      category: data.category,
      available: data.available,
      jain: data.jain,
      ingredients: data.ingredients,
      sizes: sizes.filter(s => s.label && s.price !== ''),
      imageUrl: imageUrl
    };

    console.log("Final payload:", payload);
    await createMenu(payload);
    onClose();
    reset();
  } catch (err) {
    console.error("Error:", err);
    // Error is already handled by the service with toast
  }
};
  const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }
  };

  const fetchCategories = async () => {
    try {
      const resCategories = await getCategories();
      setCategories(resCategories.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0 flex items-center justify-center z-50 w-full"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="relative bg-white w-1/2 p-6 rounded-2xl shadow-lg overflow-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Add Menu Item</h2>
        <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-5">
              <div>
                <label className="block mb-1 font-medium">Item Name</label>
                <input
                  {...register("name", { required: "Item name is required" })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': `${theme.primaryColor}30` }}
                  placeholder="e.g., Margherita Pizza"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                  {...register("category", { required: "Category is required" })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': `${theme.primaryColor}30` }}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              {sizes.length === 0 && (
                <div>
                  <label className="block mb-1 font-medium">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register("price", {
                      required: "Price is required if no sizes are provided",
                      min: { value: 0.01, message: "Price must be greater than 0" },
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': `${theme.primaryColor}30` }}
                    placeholder="e.g., 199"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
              )}

              <div className="space-y-4">
                <label className="block mb-1 font-medium">Sizes (Optional)</label>
                {sizes.map((size, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Small, Medium"
                      value={size.label}
                      onChange={(e) => handleSizeChange(index, 'label', e.target.value)}
                      className="w-1/2 px-4 py-2 border rounded-lg"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price (₹)"
                      value={size.price}
                      onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                      className="w-1/2 px-4 py-2 border rounded-lg"
                    />
                    {sizes.length > 0 && (
                      <button type="button" onClick={() => handleRemoveSize(index)} className="text-red-500">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSize}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{ 
                    borderColor: theme.primaryColor,
                    color: theme.primaryColor,
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = theme.primaryColor;
                    e.target.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = theme.primaryColor;
                  }}
                >
                  + Add Size
                </button>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': `${theme.primaryColor}30` }}
                  placeholder="Short description of the item"
                  rows="3"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Ingredients (comma-separated)</label>
                <textarea
                  {...register("ingredients")}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': `${theme.primaryColor}30` }}
                  placeholder="e.g., Milk, Sugar, Cocoa"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="block mb-1 font-medium">Upload Image</label>
                <ImageDropzone 
                  onUpload={handleUpload}
                  onUploadStatus={(status) => setIsUploading(status)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="block mb-1 font-medium">Available</label>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  {...register("available")}
                  className="h-5 w-5 border-gray-300 rounded focus:ring-2"
                  style={{ 
                    accentColor: theme.primaryColor,
                    '--tw-ring-color': `${theme.primaryColor}50`
                  }} 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="block mb-1 font-medium">Jain Available</label>
                <input
                  type="checkbox"
                  defaultChecked={false}
                  {...register("jain")}
                  className="h-5 w-5 text-green-600 border-gray-300 rounded focus:ring-green-500" 
                />
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button
              type="submit"
              className="text-white px-6 py-2 rounded-lg shadow-md hover:cursor-pointer transition-colors"
              style={{ 
                backgroundColor: theme.primaryColor
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = `${theme.primaryColor}dd`}
              onMouseLeave={(e) => e.target.style.backgroundColor = theme.primaryColor}
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}