import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Send httpOnly cookie automatically (same-origin)
});

// In-memory token — set by AuthContext on login/logout
// Also persisted in a client-readable 'auth_token' cookie to survive page refresh
let _token = null;

const _getCookieToken = () => {
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
};

// Restore token from cookie on page load/refresh
_token = _getCookieToken();

export const setAuthToken = (token) => {
  _token = token;
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `auth_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
};

export const clearAuthToken = () => {
  _token = null;
  document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`;
};

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