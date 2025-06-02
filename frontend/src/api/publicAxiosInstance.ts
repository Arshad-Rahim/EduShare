import axios from "axios";

export const publicAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASEURL, 
  headers: {
    "Content-Type": "application/json",
  },
});
