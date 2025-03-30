import { authAxiosInstance } from '@/api/authAxiosInstance';
export interface IRegisterUserData {
  name: string;
  email: string;
  password: string;
  role: string; 
}

export const registerUser = async (data:IRegisterUserData) => {
  const response = await authAxiosInstance.post('/auth/register/user', {
    name: data.name,
    email: data.email,
    password: data.password,
    role:data.role
  });
  return response.data;
};