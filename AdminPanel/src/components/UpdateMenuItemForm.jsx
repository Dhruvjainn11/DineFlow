import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { updateMenu, getCategories } from '../services/menuService';
import ImageDropzone from "./ImageDropzone";
import { useTheme } from "../context/ThemeContext";

export default function UpdateMenuItemForm({ onClose, item, onRefresh }) {
  const { theme } = useTheme();
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sizes, setSizes] = useState(item.sizes || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm();

  const formImageUrl = watch("imageUrl");
  const formCategory = watch("category");
  const formAvailable = watch("available");

  // Debug log for form values
  useEffect(() => {
    console.log("Form category value:", formCategory);
    console.log("Form available value:", formAvailable);
  }, [formCategory, formAvailable]);

useEffect(() => {
  if (item && categories.length > 0) {
    reset({
      name: item.name || "",
      description: item.description || "",
      price: item.price || "",
      category: item.category?._id || item.category || "",
      available: item.available,
      jain: item.jain,
      imageUrl: item.imageUrl || "",
      ingredients: (item.ingredients || []).join(", "),
    });
    setSizes(item.sizes || []);
  }
}, [item, categories, reset]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const resCategories = await getCategories();
        setCategories(resCategories.data);
        console.log("Categories loaded:", resCategories); // Debug log
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);
  
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
    newSizes[index][field] = field === 'price' ? Number(value) : value;
    setSizes(newSizes);
  };

  const handleUpload = (url) => {
    setIsUploading(false);
    reset((prev) => ({
      ...prev,
      imageUrl: url,
    }));
  };

const submitHandler = async (data) => {
  try {
    const filteredSizes = sizes.filter(s => s.label && s.price !== '');
    
    const updateData = {
      ...data,
      sizes: filteredSizes,
      ingredients: data.ingredients,
      // Ensure boolean values
      available: Boolean(data.available),
      jain: Boolean(data.jain)
    };
    
    // Remove price field if sizes exist
    if (filteredSizes.length > 0) {
      delete updateData.price;
    }

    console.log("Update payload:", updateData);
    await updateMenu(item._id, updateData);
    onRefresh();
    onClose();
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    alert(error.response?.data?.message || "Update failed");
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
        <h2 className="text-2xl font-semibold mb-6 text-center">Update Menu Item</h2>
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
                      validate: (value) => {
                        if (sizes.length === 0 && (!value || value <= 0)) {
                          return "Price is required and must be greater than 0 when no sizes are provided";
                        }
                        return true;
                      }
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
                    onUploadStatus={setIsUploading} 
                    currentImageUrl={formImageUrl}
                />
              </div>

              <div className="flex items-center space-x-2">
                <label className="block mb-1 font-medium">Available</label>
                <input
                  type="checkbox"
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
              Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}