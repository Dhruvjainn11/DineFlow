import { useEffect,useState } from "react";
import { getMenus , getCategories , createMenu} from "../services/menuService";
import React from "react";
import { useForm } from "react-hook-form";
import { X } from "lucide-react"; // uses lucide-react for better icons
import ImageDropzone from "./ImageDropzone"; // Assuming you have a component for image upload

export default function MenuItemForm({ onSubmit, onClose }) {

  const [categories, setCategories] = useState([]); // State to hold categories
  const [menuItems, setMenuItems] = useState([]); // State to hold menu items
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  
  const handleUpload = (url) => {
    console.log("Image uploaded URL:", url);
   
    setImageUrl(url);
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  
  } = useForm();

  

 const submitHandler = async (data) => {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price);
  formData.append('category', data.category);
  formData.append('available', true); // if using availability

  formData.append('imageUrl', imageUrl); // ✅ input field named `image`

    if (isUploading) {
    alert("Image is still uploading. Please wait.");
    return;
  }

  if (!imageUrl) {
    alert("Please upload an image.");
    return;
  }

  try {
    await createMenu(formData); // function that calls POST /menu
    onClose(); // Close the modal after submission
    reset();
  } catch (err) {
    console.error("Error submitting menu:", err);
  }
};


   const handleBackdropClick = (e) => {
    if (e.target.id === "modal-backdrop") {
      onClose();
    }}

  const fetchMenu = async () => {
  const res = await getMenus()
  const resCategories = await getCategories();
setCategories(resCategories);
  setMenuItems(res);
};




useEffect(() => {
  fetchMenu();
}, []);

 return (
    <div
      id="modal-backdrop"
      onClick={handleBackdropClick}
      className="fixed inset-0  flex items-center justify-center z-50 w-full"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }} // Semi-transparent backdrop
    >
      <div className="relative bg-white w-1/2 p-6 rounded-2xl shadow-lg overflow-auto">
        {/* Close Icon */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-600 transition"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-semibold mb-6 text-center">Add Menu Item</h2>
       <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
  {/* Two-column layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Left Column */}
    <div className="space-y-5">
      {/* Item Name */}
      <div>
        <label className="block mb-1 font-medium">Item Name</label>
        <input
          {...register("name", { required: "Item name is required" })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="e.g., Margherita Pizza"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
      </div>

      {/* Price */}
      <div>
        <label className="block mb-1 font-medium">Price (₹)</label>
        <input
          type="number"
          step="0.01"
          {...register("price", {
            required: "Price is required",
            min: { value: 0.01, message: "Price must be greater than 0" },
          })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="e.g., 199"
        />
        {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
      </div>

      {/* Category */}
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
      {/* Availability Checkbox */}
      <div className="flex items-center space-x-2">
        <label className="block mb-1 font-medium">Available</label>
        <input
          type="checkbox"
          defaultChecked={true} // Default to checked
          {...register("available")}
          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500" 
        />
      </div>
    </div>

    {/* Right Column */}
    <div className="space-y-5">
      {/* Description */}
      <div>
        <label className="block mb-1 font-medium">Description</label>
        <input
          {...register("description", { required: "Description is required" })}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
          placeholder="Short description of the item"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block mb-1 font-medium">Upload Image</label>
        <ImageDropzone onUpload={handleUpload} 
         onUploadStatus={(status) => setIsUploading(status)}
         />
      
      </div>
    </div>
  </div>

  {/* Submit Button - Full Width Row */}
  <div className="text-center mt-6">
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-md hover:cursor-pointer"
    >
      Add Item
    </button>
  </div>
</form>

      </div>
    </div>
  );
}
