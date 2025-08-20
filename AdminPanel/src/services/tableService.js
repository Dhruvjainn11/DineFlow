import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

export const getTables = async () => {
  try {
    const res = await api.get("/tables");
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fetch tables');
    throw error;
  }
};

export const createTable = async (data) => {
  try {
    const res = await api.post("/tables", data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Create table');
    throw error;
  }
};

export const updateTable = async (id, data) => {
  try {
    const res = await api.put(`/tables/${id}`, data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Update table');
    throw error;
  }
};

export const deleteTable = async (id) => {
  try {
    const res = await api.delete(`/tables/${id}`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Delete table');
    throw error;
  }
};
