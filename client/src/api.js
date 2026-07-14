import axios from "axios";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

fetch(`${BACKEND_URL}/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
});
const api = axios.create({
    baseURL: "/api"
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
