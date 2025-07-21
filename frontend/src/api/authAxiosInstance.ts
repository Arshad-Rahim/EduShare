import { removeUser } from "@/redux/slice/userSlice";
import { store } from "@/redux/store";
import axios from "axios";
import { toast } from "sonner";

export const authAxiosInstance = axios.create({
  // baseURL: import.meta.env.VITE_AUTH_BASEURL,
  baseURL: 'https://edushare.arshadrahim.tech',

  withCredentials: true,
});

let isRefreshing = false;

authAxiosInstance.interceptors.request.use(
  (config) => {
    // Skip Authorization header for /all-courses
    if (config.url?.includes("/all-courses")) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem("userDatas")
        ? JSON.parse(localStorage.getItem("userDatas")!).token
        : null;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authAxiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAllCourses = originalRequest?.url?.includes("/all-courses");

    // Skip token refresh and redirect for /all-courses
    if (isAllCourses) {
      return Promise.reject(error);
    }

    if (
      error.response?.status === 401 &&
      error.response.data.message === "Unauthorized access." &&
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
          store.dispatch(removeUser());
          localStorage.removeItem("userDatas");
          window.location.href = "/auth";
          toast.info("Please login again");
          return Promise.reject(refreshError);
        }
      }
    }

    if (
      error.response?.status === 403 &&
      error.response.data.message === "Token Expired" &&
      !originalRequest._retry
    ) {
      store.dispatch(removeUser());
      localStorage.removeItem("clientSession");
      window.location.href = "/auth";
      toast.info("Please login again");
      return Promise.reject(error);
    }

    if (
      error.response?.status === 403 &&
      error.response.data.message ===
        "Access denied: Your account has been blocked" &&
      !originalRequest._retry
    ) {
      store.dispatch(removeUser());
      localStorage.removeItem("clientSession");
      window.location.href = "/auth";
      toast.info("Please login again");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);
