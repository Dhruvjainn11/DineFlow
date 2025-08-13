import api from "../utils/api";

export const getOrders = async (params = {}) => {
  const res = await api.get(`/orders`, { params });
  return res.data;
};

export const createTable = async (data) => {
  const res = await api.post("/order", data);
  return res.data;
};

export const updateTable = async (id, data) => {
  const res = await api.put(`/order/${id}`, data);
  return res.data;
};

export const deleteTable = async (id) => {
  const res = await api.delete(`/order/${id}`);
  return res.data;
};
