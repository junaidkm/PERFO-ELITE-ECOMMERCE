import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // Send the httpOnly cookie on every request automatically
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