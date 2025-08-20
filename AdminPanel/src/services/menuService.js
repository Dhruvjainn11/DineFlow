// /admin/services/menuService.js
import api from "../utils/api"; // Axios instance with auth headers
import { handleApiError, handleApiSuccess } from "../utils/errorHandler";

export const getMenus = async () => {
  try {
    const res = await api.get("/menu");
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fetch menus');
    throw error;
  }
};

export const createMenu = async (menuData) => {
  try {
    const res = await api.post("/menu", menuData);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Create menu item');
    throw error;
  }
};

export const updateMenu = async (id, menuData) => {
  try {
    // Send as JSON instead of FormData
    const res = await api.put(`/menu/${id}`, menuData);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Update menu item');
    throw error;
  }
};
export const deleteMenu = async (id) => {
  try {
    const res = await api.delete(`/menu/${id}`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Delete menu item');
    throw error;
  }
};

export const createCategory = async (categoryData) => {
  try {
    const res = await api.post("/categories", categoryData);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Create category');
    throw error;
  }
}

export const updateCategory = async (id, data) => {
  try {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Update category');
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Delete category');
    throw error;
  }
}

export const getCategories = async () => {
  try {
    const res = await api.get("/categories");
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fetch categories');
    throw error;
  }
} 