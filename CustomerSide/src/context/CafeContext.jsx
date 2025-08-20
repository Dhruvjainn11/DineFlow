import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';

const CafeContext = createContext();

export const useCafe = () => {
  const context = useContext(CafeContext);
  if (!context) {
    throw new Error('useCafe must be used within a CafeProvider');
  }
  return context;
};

export const CafeProvider = ({ children }) => {
  const { cafeId } = useParams();
  const [cafeInfo, setCafeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCafeInfo = async () => {
      if (!cafeId) return;
      
      try {
        const response = await api.get(`/cafes/${cafeId}`);
        setCafeInfo(response.data.data);
      } catch (error) {
        console.error('Failed to fetch cafe info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCafeInfo();
  }, [cafeId]);

  return (
    <CafeContext.Provider value={{ cafeInfo, loading }}>
      {children}
    </CafeContext.Provider>
  );
};