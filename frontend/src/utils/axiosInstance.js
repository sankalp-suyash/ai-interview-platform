import axios from "axios";
import { BASE_URL } from "./apiPaths";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 80000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle API errors
    if (error.response) {
      if (error.response.status === 500) {
        console.error("Server Error (500): Please try again later");
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request Timeout. Please try again.");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
