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
      
      console.log('🔍 Fetching cafe info for ID:', cafeId);
      
      try {
        // Use the public theme endpoint to get cafe info with theme
        const response = await api.get(`/theme/${cafeId}`);
        console.log('🎨 Theme API response:', response.data);
        
        if (response.data.success) {
          const cafeData = {
            ...response.data.data,
            id: cafeId,
            name: response.data.data.cafeName
          };
          console.log('✅ Setting cafe info:', cafeData);
          setCafeInfo(cafeData);
        }
      } catch (error) {
        console.error('❌ Theme API failed:', error);
        // Fallback to regular cafe endpoint
        try {
          const fallbackResponse = await api.get(`/public/cafe/${cafeId}/menu`);
          console.log('🔄 Fallback response:', fallbackResponse.data);
          setCafeInfo(fallbackResponse.data.data?.cafe);
        } catch (fallbackError) {
          console.error('❌ Fallback fetch failed:', fallbackError);
        }
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