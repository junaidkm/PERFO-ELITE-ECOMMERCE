import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Send httpOnly cookie automatically (same-origin)
});

// Attach stored token as Bearer header for cross-origin requests
api.interceptors.request.use((config) => {
  const match = document.cookie.match(/(?:^|; )token=([^;]*)/);
  const token = match ? decodeURIComponent(match[1]) : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized - redirect to login");
    }
    return Promise.reject(error);
  }
);