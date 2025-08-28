// /admin/pages/MenuManagement.jsx
import React, { useEffect, useState } from "react";
import { getCategories ,deleteCategory} from "../services/menuService";
import CategoryForm from "../components/CategoryForm";
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import { Pencil, Trash2 } from 'lucide-react';
import {socket} from "../utils/socket"; // Adjust the import path as necessary
import UpdateCategoryForm from "../components/UpdateCategoryForm"; // Adjust the import path as necessary
import { toast } from "react-toastify"; // Ensure you have react-toastify installed for notifications
import ConfirmDialog from "../components/ConfirmDialog"; // Adjust the import path as necessary
import CategorySkeleton from "../components/Common/CategorySkeleton";


const CategoryManagement = () => {
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showupdateCategoryForm, setShowUpdateCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  
     useEffect(() => {
      // Initial fetch
      getCategories()
    .then((res) => {
      if (res.success) {
        console.log(res.data);
        
        setCategories(res.data);
      } else {
        console.error("Failed to fetch categories:", res.message);
      }
    })
    .catch((err) => {
      console.error("Error fetching categories:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  
      // Real-time state updates
      socket.on("category:created", (newCategory) => {
        setCategories(prev => [...prev, newCategory]);
      });

      socket.on("category:updated", (updatedCategory) => {
        setCategories((prev) =>
          prev.map((cat) =>
            cat._id === updatedCategory._id ? updatedCategory : cat
          )
        );
      });

      socket.on("category:deleted", (deletedId) => {
        setCategories((prev) => prev.filter((cat) => cat._id !== deletedId));
      });
      
      // Cleanup
      return () => {
        socket.off("category:created");
        socket.off("category:updated");
        socket.off("category:deleted");
      };
    }, []);


   const promptDelete = (id) => {
  setCategoryToDelete(id);
  setConfirmDialogOpen(true);
};

const confirmDelete = async () => {
  try {
    await deleteCategory(categoryToDelete);
    setConfirmDialogOpen(false);
    setCategoryToDelete(null);
  } catch (err) {
    console.error("Failed to delete:", err);
  }
};



  return (
    <RoleBasedLayout>
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Category Management</h2>
      <div className="flex space-x-2">  
        <button
          onClick={() => {
            setShowCategoryForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer"
        >
          + Add Category
        </button>
       
        </div>
      </div>

      {loading ? (
        <CategorySkeleton />
      ) : categories.length === 0 ? (
        <p>No Category was found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {categories.map((item) => (
           <div key={item._id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition flex justify-between">
            <div>
            <div className="">{item.name}</div>

            </div>
            <div className="flex gap-2">
        <button
        onClick={() => {
           setSelectedCategory(item);
          setShowUpdateCategoryForm(true);  
        }}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 hover:cursor-pointer"
        >
          <Pencil size={18} />
        </button>
        <button
            onClick={() => promptDelete(item._id)}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          <Trash2 size={18} />
        </button>
      </div>
           </div>
           

          ))}
        </div>
      )}

     
      {showCategoryForm && (
        <CategoryForm
          onClose={() => setShowCategoryForm(false)}
        
        />
      )}

      {showupdateCategoryForm && (
        <UpdateCategoryForm
          onClose={() => setShowUpdateCategoryForm(false)}
          category={selectedCategory}
        />
      )}

      {confirmDialogOpen && (
  <ConfirmDialog
    message="Are you sure you want to delete this category?"
    onConfirm={confirmDelete}
    onCancel={() => setConfirmDialogOpen(false)}
  />
)}
    </div>
    </RoleBasedLayout>
  );
};

export default CategoryManagement;
