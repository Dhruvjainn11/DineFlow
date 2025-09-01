import { createContext, useContext, useState, useEffect } from "react";
import React from "react";
import { jwtDecode } from "jwt-decode";
import api from "../utils/api";
import { socket } from "../utils/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [cafe, setCafe] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user and cafe data from token
  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          setUser(decoded);
          
          // Fetch cafe data if user is not super admin
          if (decoded.cafeId) {
            await fetchCafeData(decoded.cafeId);
          } else {
            setLoading(false);
          }
        } catch (error) {
          console.error('Invalid token:', error);
          logout();
        }
      } else {
        setLoading(false);
      }
    };

    // Fallback timeout to prevent infinite loading
    const fallbackTimeout = setTimeout(() => {
      console.warn('Auth initialization taking too long, forcing loading to false');
      setLoading(false);
    }, 15000);

    initializeAuth().finally(() => {
      clearTimeout(fallbackTimeout);
    });

    return () => clearTimeout(fallbackTimeout);
  }, [token]);

  // Apply theme when cafe data is loaded
  useEffect(() => {
    if (cafe && cafe.theme && cafe.features?.themeCustomization) {
      applyTheme(cafe.theme);
    } else {
      // Apply default theme
      applyDefaultTheme();
    }
  }, [cafe]);

  const fetchCafeData = async (cafeId) => {
    try {
      setLoading(true);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );
      
      const response = await Promise.race([
        api.get(`/cafes/${cafeId}`),
        timeoutPromise
      ]);
      
      if (response.data.success) {
        setCafe(response.data.data);
        // Join cafe room for real-time updates
        socket.emit('joinCafeRoom', cafeId);
      } else {
        console.error('Cafe data fetch failed:', response.data.message);
      }
    } catch (error) {
      console.error('Failed to fetch cafe data:', error);
      // If it's a 403 error, it might be a permission issue
      if (error.response?.status === 403) {
        console.error('Access denied to cafe data. User might not have permission to access this cafe.');
        // Don't logout, just continue without cafe data
        setCafe(null);
      } else if (error.response?.status === 401) {
        // Token is invalid, logout
        console.error('Invalid token, logging out...');
        logout();
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const applyTheme = (theme) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      
      // Apply CSS custom properties
      root.style.setProperty('--primary-color', theme.primaryColor || '#3B82F6');
      root.style.setProperty('--secondary-color', theme.secondaryColor || '#F3F4F6');
      root.style.setProperty('--font-family', theme.fontFamily || 'Inter');
      
      // Update document title if white label is enabled
      if (cafe?.features?.whiteLabel && cafe?.name) {
        document.title = `${cafe.name} - Admin Panel`;
      }
    }
  };

  const applyDefaultTheme = () => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', '#3B82F6');
      root.style.setProperty('--secondary-color', '#F3F4F6');
      root.style.setProperty('--font-family', 'Inter');
      document.title = 'DineFlow - Admin Panel';
    }
  };

  const login = async (token, userData = null) => {
    localStorage.setItem("token", token);
    setToken(token);
    
    if (userData) {
      setUser(userData);
      
      // Fetch cafe data if user is not super admin
      if (userData.cafeId) {
        await fetchCafeData(userData.cafeId);
      }
    }
  };

  const logout = () => {
    // Leave cafe room before logout
    if (cafe?._id) {
      socket.emit('leaveCafeRoom', cafe._id);
    }
    
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCafe(null);
    
    // Reset to default theme
    applyDefaultTheme();
  };

  // Helper functions to check user permissions
  const isSuperAdmin = () => {
    return user?.role === 'super-admin';
  };

  const isCafeAdmin = () => {
    return user?.role === 'admin';
  };

  const hasPermission = (permission) => {
    if (isSuperAdmin()) return true;
    return user?.permissions?.[permission] === true;
  };

  const hasFeature = (feature) => {
    if (isSuperAdmin()) return true;
    return cafe?.features?.[feature] === true;
  };

  const updateCafe = (updatedCafe) => {
    setCafe(updatedCafe);
  };

  const refreshCafe = async () => {
    if (user?.cafeId) {
      await fetchCafeData(user.cafeId);
    }
  };

  const value = {
    token,
    user,
    cafe,
    loading,
    login,
    logout,
    isSuperAdmin,
    isCafeAdmin,
    hasPermission,
    hasFeature,
    updateCafe,
    fetchCafeData,
    refreshCafe
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
