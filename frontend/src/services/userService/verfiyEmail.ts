import { authAxiosInstance } from "@/api/authAxiosInstance";

export const verifyEmail = async (email: string) => {
  const response = await authAxiosInstance.post("/verifyEmail", {
    email: email,
  });
  return response.data;
};
