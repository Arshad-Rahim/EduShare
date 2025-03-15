import axios from "axios";

export const authAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_AUTH_BASEURL,
  withCredentials:true
});