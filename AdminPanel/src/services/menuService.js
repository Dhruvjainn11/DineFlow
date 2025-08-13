// /admin/services/menuService.js
import api from "../utils/api"; // Axios instance with auth headers

export const getMenus = async () => {
  const res = await api.get("/menu");
  return res.data;
};

export const createMenu = async (menuData) => {
  const res = await api.post("/menu", menuData ,{
     headers: {
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const updateMenu = async (id, menuData) => {
  // Convert the data to FormData format to match backend expectations
  const formData = new FormData();
  
  // Add all fields with proper type handling
  formData.append('name', menuData.name || '');
  formData.append('description', menuData.description || '');
  if (menuData.price !== undefined && menuData.price !== null) {
    formData.append('price', menuData.price.toString());
  }
  formData.append('category', menuData.category || '');
  formData.append('available', menuData.available ? 'true' : 'false');
  formData.append('jain', menuData.jain ? 'true' : 'false'); // Add jain field
  formData.append('imageUrl', menuData.imageUrl || '');
  formData.append('ingredients', menuData.ingredients || '');
  formData.append('sizes', JSON.stringify(menuData.sizes || []));

  console.log("FormData contents:"); // Debug log
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  const res = await api.put(`/menu/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteMenu = async (id) => {
  const res = await api.delete(`/menu/${id}`);
  return res.data;
};

export const createCategory = async (categoryData) => {
  const res = await api.post("/categories", categoryData);
  return res.data;
}

export const updateCategory = async (id, data) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
}

export const getCategories = async () => {
  const res = await api.get("/categories");
  return res.data;
} 