import api from '../utils/api';

export const createTable = async (tableData) => {
  try {
    console.log('TableService: Creating table with data:', tableData);
    
    // Ensure cafeId is included in the request body
    if (!tableData.cafeId) {
      throw new Error('cafeId is required');
    }

    const response = await api.post('/tables', tableData);
    return response.data;
  } catch (error) {
    console.error('TableService: Create table failed:', error);
    throw error;
  }
};

export const getTables = async (cafeId) => {
  try {
    const params = cafeId ? { cafeId } : {};
    const response = await api.get('/tables', { params });
    return response.data;
  } catch (error) {
    console.error('TableService: Get tables failed:', error);
    throw error;
  }
};

export const updateTable = async (tableId, updateData) => {
  try {
    const response = await api.put(`/tables/${tableId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('TableService: Update table failed:', error);
    throw error;
  }
};

export const deleteTable = async (tableId) => {
  try {
    const response = await api.delete(`/tables/${tableId}`);
    return response.data;
  } catch (error) {
    console.error('TableService: Delete table failed:', error);
    throw error;
  }
};