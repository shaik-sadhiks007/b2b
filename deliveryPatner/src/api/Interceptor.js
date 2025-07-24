import axios from "axios";

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
  });
  
// Request interceptor
api.interceptors.request.use(
  (config) => {
    // You can add headers or logging here
    return config;
  },
  (error) => {
    // Handle request error
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle response errors globally
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);

// No export needed, just import this file once in your app entry point
