import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

// adjunta token desde localStorage en cada petición
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined" && config.headers) {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    /* ignore */
  }
  return config;
}, (error) => Promise.reject(error));

export default api;