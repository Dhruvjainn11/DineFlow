// /admin/pages/MenuManagement.jsx
import React, { useEffect, useState } from "react";
import { getMenus } from "../services/menuService";
import MenuForm from "../components/MenuForm";
import BulkMenuForm from "../components/BulkMenuForm";
import MenuItem from "../components/MenuItem";
import CategoryForm from "../components/CategoryForm";
import RoleBasedLayout from "../layouts/RoleBasedLayout";
import { socket } from "../utils/socket";
import { toast } from "react-toastify";
import { Plus, Upload, Search } from "lucide-react";
import MenuSkeleton from "../components/Common/MenuSkeleton";

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchMenus();

    // Real-time updates for menu state
    socket.on("menuCreated", (newItem) => {
      setMenus((prev) => [...prev, newItem]);
    });

    socket.on("menuUpdated", (updatedItem) => {
      setMenus((prev) =>
        prev.map((item) => item._id === updatedItem._id ? updatedItem : item)
      );
    });

    socket.on("menuDeleted", (deletedId) => {
      setMenus((prev) => prev.filter((item) => item._id !== deletedId));
    });

    return () => {
      socket.off("menuCreated");
      socket.off("menuUpdated"); 
      socket.off("menuDeleted");
    }
  }, []);

  const fetchMenus = async () => {
    try {
      const data = await getMenus();
      console.log(data.data);
      setMenus(data.data);
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenus = menus.filter(menu =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    menu.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedMenus = filteredMenus.reduce((acc, menu) => {
    const categoryName = menu.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(menu);
    return acc;
  }, {});

  return (
    <RoleBasedLayout>
      <div className="">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Menu Management</h2>
          <div className="flex space-x-2">  
            <button
              onClick={() => {
                setEditData(null);
                setShowForm(true);
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer flex items-center gap-2"
            >
              <Plus size={16} />
              Add Menu Item
            </button>
            <button
              onClick={() => setShowBulkForm(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:cursor-pointer flex items-center gap-2"
            >
              <Upload size={16} />
              Bulk Create
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menu items by name, category, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full  pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <MenuSkeleton />
        ) : filteredMenus.length === 0 ? (
          <p>{searchTerm ? `No menu items found for "${searchTerm}"` : "No menu items found."}</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedMenus).map(([categoryName, categoryMenus]) => (
              <div key={categoryName}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                  {categoryName} ({categoryMenus.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categoryMenus.map((menu) => (
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
              </div>
            ))}
          </div>
        )}

        {showForm && (
          <MenuForm
            onClose={() => setShowForm(false)}
            onRefresh={fetchMenus}
            onEdit={fetchMenus}
            onDelete={fetchMenus}
            editData={editData}
          />
        )}

        {showBulkForm && (
          <BulkMenuForm
            onClose={() => setShowBulkForm(false)}
            onRefresh={fetchMenus}
          />
        )}
      </div>
    </RoleBasedLayout>
  );
};

export default MenuManagement;
