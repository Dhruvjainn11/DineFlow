// /admin/pages/MenuManagement.jsx
import React, { useEffect, useState } from "react";
import { getMenus } from "../services/menuService";
import MenuForm from "../components/MenuForm";
import MenuItem from "../components/MenuItem";
import CategoryForm from "../components/CategoryForm";
import AdminLayout from "../layouts/AdminLayout";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    const data = await getMenus();
    setMenus(data);
  };

  return (
    <AdminLayout>
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Menu Management</h2>
      <div className="flex space-x-2">  
       
        <button
          onClick={() => {
            setEditData(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer"
        >
          + Add Menu Item
        </button>
        </div>
      </div>

      {menus.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menus.map((menu) => (
            <MenuItem
              key={menu._id}
              menu={menu}
              onEdit={(item) => {
                setEditData(item);
                setShowForm(true);
              }}
              onRefresh={fetchMenus}
            />
          ))}
        </div>
      )}

      {showForm && (
        <MenuForm
          onClose={() => setShowForm(false)}
          onRefresh={fetchMenus}
          editData={editData}
        />
      )}

      
     

    </div>
    </AdminLayout>
  );
};

export default MenuManagement;
