import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

// Adjunta token automáticamente si existe (token sin "Bearer " en storage)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      // si guardaste el token sin "Bearer ":
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // opcional: más logging en desarrollo
    // console.error("API response error:", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);

export default api;