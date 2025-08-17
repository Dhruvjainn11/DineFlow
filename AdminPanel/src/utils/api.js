import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const cafeId = localStorage.getItem("cafeId");

  if (token) {
    // Check if token already includes Bearer prefix
    if (token.startsWith('Bearer ')) {
      config.headers.Authorization = token;
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  if (cafeId) {
    config.params = config.params || {};
    config.params.cafeId = cafeId; // append to query string
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details for debugging
    if (error.response) {
      console.error(`API Error ${error.response.status}:`, {
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
        status: error.response.status
      });
      
      // Handle specific error codes
      if (error.response.status === 401) {
        console.error('Unauthorized - token may be invalid or expired');
        // Don't auto-logout here as it should be handled in AuthContext
      } else if (error.response.status === 403) {
        console.error('Forbidden - insufficient permissions');
      }
    }
    
    return Promise.reject(error);
  }
);


export default api;
