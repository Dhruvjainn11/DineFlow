import axios from "axios";

export const getOrders = async () => {
  const res = await axios.get(`/api/orders`);
  return res.data ;
};

export const createTable = async (data) => {
  const res = await axios.post("/api/order", data);
  return res.data;
};

export const updateTable = async (id, data) => {
  const res = await axios.put(`/api/order/${id}`, data);
  return res.data;
};

export const deleteTable = async (id) => {
  const res = await axios.delete(`/api/order/${id}`);
  return res.data;
};
