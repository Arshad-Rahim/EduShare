import { RootState } from "@/redux/store"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";



interface PublicUserRouteProps{
    children:React.ReactNode
}

export function PublicUserRoute({children}:PublicUserRouteProps){
    const userData = useSelector((state:RootState)=>{
        return state?.user?.userDatas;
    });
        console.log("USERDATA IN PUBLIC", userData);

     if (userData) {
       return <Navigate to={`/${userData.role}/home`} />;
     }
     return children;
}