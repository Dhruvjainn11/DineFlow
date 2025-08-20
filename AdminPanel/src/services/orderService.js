import api from "../utils/api";
import { handleApiError } from "../utils/errorHandler";

export const getOrders = async (params = {}) => {
  try {
    const res = await api.get(`/orders`, { params });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Fetch orders');
    throw error;
  }
};

export const createOrder = async (data) => {
  try {
    const res = await api.post("/orders", data);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Create order');
    throw error;
  }
};

export const updateOrderStatus = async (id, status) => {
  try {
    const res = await api.put(`/orders/${id}/status`, { status });
    return res.data;
  } catch (error) {
    handleApiError(error, 'Update order status');
    throw error;
  }
};

export const deleteOrder = async (id) => {
  try {
    const res = await api.delete(`/orders/${id}`);
    return res.data;
  } catch (error) {
    handleApiError(error, 'Delete order');
    throw error;
  }
};
