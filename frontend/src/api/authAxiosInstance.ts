import axios from "axios";
import { toast } from "sonner";

export const authAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASEURL,
  withCredentials: true,
});

let isRefreshing = false;

authAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response.data.message == "Unauthorized access." &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await authAxiosInstance.post("/auth/refresh-token");
          isRefreshing = false;

          return authAxiosInstance(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;

          localStorage.removeItem("userDatas");
          window.location.href = "/";
          toast.info("Please login again");
          return Promise.reject(refreshError);
        }
      }
    }

    if (
      error.response.status === 403 &&
      error.response.data.message === "Token Expired" &&
      !originalRequest._retry
    ) {
      localStorage.removeItem("clientSession");
      window.location.href = "/";
      toast.info("Please login again");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
