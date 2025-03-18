import { authAxiosInstance } from "@/api/authAxiosInstance"


export const registerUser = async (data:any)=>{
    const response = await authAxiosInstance.post("/register/user", {
      name: data.name,
      email: data.email,
      password: data.password,
      role:data.role
    });
    return response.data;
}