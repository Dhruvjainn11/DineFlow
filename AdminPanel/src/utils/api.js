import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update if using a different port
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = token; // Already includes "Bearer"
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});


export default api;
