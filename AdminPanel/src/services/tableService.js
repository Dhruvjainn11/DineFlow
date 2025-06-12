import axios from "axios";

export const getTables = async () => {
  const res = await axios.get("/api/tables");
  return res.data ;
};

export const createTable = async (data) => {
  const res = await axios.post("/api/tables", data);
  return res.data;
};

export const updateTable = async (id, data) => {
  const res = await axios.put(`/api/tables/${id}`, data);
  return res.data;
};

export const deleteTable = async (id) => {
  const res = await axios.delete(`/api/tables/${id}`);
  return res.data;
};
