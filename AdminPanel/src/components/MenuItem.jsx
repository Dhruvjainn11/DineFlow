import React from 'react';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import UpdateMenuItemForm from './UpdateMenuItemForm';
import ConfirmDialog from './ConfirmDialog'; // Adjust the import path as necessary
import { deleteMenu } from '../services/menuService'; // Adjust the import path as necessary
// Adjust the import path as necessary

const MenuItem = ({  onEdit, menu }) => {
  const [updateMenuForm, setUpdateMenuForm] = useState(false);
  const [selectMenuItem, setSelectMenuItem] = useState(null);
   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [menuItemToDelete, setMenuItemToDelete] = useState(null);



  
   const promptDelete = (id) => {
  setMenuItemToDelete(id);
  setConfirmDialogOpen(true);
};

const confirmDelete = async () => {
  try {
    await deleteMenu(menuItemToDelete);
    setConfirmDialogOpen(false);
    setMenuItemToDelete(null);
  } catch (err) {
    console.error("Failed to delete:", err);
  }
};
 
  
  return (
    <div className="flex items-center justify-between bg-white shadow p-4 rounded-xl hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={menu.imageUrl}
          alt={menu.name}
          className="w-24 h-24 object-cover rounded-lg "
        />
        <div>
          <h3 className="text-lg font-semibold">{menu.name}</h3>
          <p className="text-gray-600 text-sm">{menu.description}</p>
          <span className="text-green-600 font-medium">₹{menu.price}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200" 
          onClick={() => {
            setSelectMenuItem(menu);
            setUpdateMenuForm(true);
          }}
        >
          <Pencil size={18} />
        </button>
        <button
         onClick={() => promptDelete(menu._id)}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {updateMenuForm && (
        <UpdateMenuItemForm
          item={selectMenuItem}
          onClose={() => setUpdateMenuForm(false)}
          onRefresh={() => {
            setUpdateMenuForm(false);
            onEdit();
          }}
        />
        
      )}

       {confirmDialogOpen && (
        <ConfirmDialog
          message="Are you sure you want to delete this Menu item?"
          onConfirm={confirmDelete}
          onCancel={() => setConfirmDialogOpen(false)}
        />
      )}

    </div>
  );
};

export default MenuItem;
