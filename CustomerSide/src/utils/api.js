import axios from "axios";

// Replace with your actual IP
const baseURL = "http://192.168.236.119:5000/api";

const api = axios.create({
  baseURL,
  withCredentials: false, // Set true if you use cookies/auth
});

export default api;
