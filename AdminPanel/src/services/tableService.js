import api from "../utils/api";

export const getTables = async () => {
  const res = await api.get("/tables");
  return res.data ;
};

export const createTable = async (data) => {
  const res = await api.post("/tables", data);
  return res.data;
};

export const updateTable = async (id, data) => {
  const res = await api.put(`/tables/${id}`, data);
  return res.data;
};

export const deleteTable = async (id) => {
  const res = await api.delete(`/tables/${id}`);
  return res.data;
};
