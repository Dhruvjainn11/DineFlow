import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.236.119:5000/api", // Align with server IP
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
