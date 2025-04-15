import { authAxiosInstance } from '@/api/authAxiosInstance';
export interface IRegisterUserData {
  name: string;
  email: string;
  password: string;
  role: string; 
}

export const userAuthService =  {

  async registerUser(data:IRegisterUserData){
    try {
      const response = await authAxiosInstance.post("/auth/register/user", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  async logoutUser(){
    try {
     const response = await authAxiosInstance.post("/auth/logout");
     return response;
    } catch (error) {
      throw error;
    }
  },

  async verifyPassword(password:string){
    try {
       const response = await authAxiosInstance.post("/verify-password", {
              password,
            });
            return response;
    } catch (error) {
      throw error;
    }
  }
  
};