import { authAxiosInstance } from '@/api/authAxiosInstance';


export const verifyOtp = async(email:string,otp:string) => {
  const response = await authAxiosInstance.post('/otp/verify', { email, otp });
  return response.data;
};