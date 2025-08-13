import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
import { updateMenu, getCategories } from '../services/menuService';
import ImageDropzone from "./ImageDropzone";

export default function UpdateMenuItemForm({ onClose, item, onRefresh }) {
  const [categories, setCategories] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [sizes, setSizes] = useState(item.sizes || []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || "", // Use empty string for better form behavior
      category: item?.category?._id || item?.category || "",
      available: item?.available === true || item?.available === 'true' || true,
      jain: item?.jain === true || item?.jain === 'true' || false, // Add jain field
      imageUrl: item?.imageUrl || "",
      ingredients: (item?.ingredients || []).join(", "),
    },
  });

  const formImageUrl = watch("imageUrl");
  const formCategory = watch("category");
  const formAvailable = watch("available");

  // Debug log for form values
  useEffect(() => {
    console.log("Form category value:", formCategory);
    console.log("Form available value:", formAvailable);
  }, [formCategory, formAvailable]);

  useEffect(() => {
    // This effect ensures the form resets with new item data
    // if the 'item' prop changes.
    if (item) {
      console.log("Item data for update:", item); // Debug log
      console.log("Category data:", item.category); // Debug log
      
      const categoryId = item.category && typeof item.category === 'object' 
        ? item.category._id 
        : item.category;
      
      reset({
        name: item.name || "",
        description: item.description || "",
        price: item.price || "",
        category: categoryId || "",
        available: item.available === true || item.available === 'true',
        jain: item.jain === true || item.jain === 'true',
        imageUrl: item.imageUrl || "",
        ingredients: (item.ingredients || []).join(", "),
      });
      setSizes(item.sizes || []);
    }
  }, [item, reset]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const resCategories = await getCategories();
        setCategories(resCategories);
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
    if (isUploading) {
      alert("Image is still uploading. Please wait.");
      return;
    }
    if (!data.imageUrl) {
      alert("Please upload an image.");
      return;
    }
    if (!data.price && sizes.length === 0) {
      alert("Please provide a base price or at least one size option.");
      return;
    }
    
    // Prepare data for submission, including the sizes and ingredients
    const updateData = {
        ...data,
        sizes: sizes.filter(s => s.label && s.price !== ''),
        ingredients: data.ingredients // Keep as comma-separated string for backend
    };

    console.log("Sending update data:", updateData); // Debug log

    try {
      await updateMenu(item._id, updateData);
      console.log("Menu item updated successfully!");
      // Optionally, run a callback to refresh the parent list
      onRefresh(); 
      onClose();
    } catch (error) {
      console.error("Error updating menu item:", error);
      console.error("Error response:", error.response?.data); // Debug log
      alert(error.response?.data?.message || error.message || "Failed to update item.");
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="e.g., Margherita Pizza"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block mb-1 font-medium">Category</label>
                <select
                  {...register("category", { required: "Category is required" })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
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
                      required: "Price is required if no sizes are provided",
                      min: { value: 0.01, message: "Price must be greater than 0" },
                    })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
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
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
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
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  placeholder="Short description of the item"
                  rows="3"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Ingredients (comma-separated)</label>
                <textarea
                  {...register("ingredients")}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
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
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
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
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:cursor-pointer"
            >
              Update Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}