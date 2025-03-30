import { authAxiosInstance } from '@/api/authAxiosInstance';

export const profileService = async () => {
  const response = await authAxiosInstance.get('/users/me');
  return response.data;
};
