// /admin/services/menuService.js
import api from "../utils/api"; // Axios instance with auth headers

export const getMenus = async () => {
  const res = await api.get("/menus");
  return res.data;
};

export const createMenu = async (menuData) => {
  const res = await api.post("/menus", menuData);
  return res.data;
};

export const updateMenu = async (id, menuData) => {
  const res = await api.put(`/menus/${id}`, menuData);
  return res.data;
};

export const deleteMenu = async (id) => {
  const res = await api.delete(`/menus/${id}`);
  return res.data;
};
