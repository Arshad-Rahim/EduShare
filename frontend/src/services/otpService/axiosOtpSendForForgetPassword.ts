import { authAxiosInstance } from "@/api/authAxiosInstance";

export const sendOtpForgetPassword = async (email:string ) => {
  const response = await authAxiosInstance.post("/otp/sendOtp", {email});
  return response.data
};
