import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Send httpOnly cookie automatically (same-origin)
});

// In-memory token — set by AuthContext on login/logout (no extra cookie needed)
let _token = null;
export const setAuthToken = (token) => { _token = token; };
export const clearAuthToken = () => { _token = null; };

// Attach Bearer token for cross-origin requests
api.interceptors.request.use((config) => {
  if (_token) {
    config.headers.Authorization = `Bearer ${_token}`;
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