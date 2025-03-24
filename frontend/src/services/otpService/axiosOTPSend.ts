import { authAxiosInstance } from "@/api/authAxiosInstance";
import { RegisterFormData } from "@/validation";

export const sendOtp = async (data: RegisterFormData) => {
  const response = await authAxiosInstance.post("/otp/sendOtp", data);
  return response.data
};
