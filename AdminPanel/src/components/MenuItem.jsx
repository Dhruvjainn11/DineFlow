import React from 'react';
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const MenuItem = ({ item, onEdit, onDelete ,menu }) => {
  const [updateMenuForm, setUpdateMenuForm] = useState(false);
  return (
    <div className="flex items-center justify-between bg-white shadow p-4 rounded-xl hover:shadow-md transition">
      <div className="flex items-center gap-4">
        <img
          src={menu.imageUrl}
          alt={menu.name}
          className="w-16 h-16 object-cover rounded-lg border"
        />
        <div>
          <h3 className="text-lg font-semibold">{menu.name}</h3>
          <p className="text-gray-600 text-sm">{menu.description}</p>
          <span className="text-green-600 font-medium">₹{menu.price}</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setUpdateMenuForm(true)}
          className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
        >
          <Pencil size={18} />
        </button>
        <button
          onClick={() => onDelete(item._id)}
          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
