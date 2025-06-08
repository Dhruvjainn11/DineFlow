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
  const res = await api.put(`/menu/${id}`, menuData);
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