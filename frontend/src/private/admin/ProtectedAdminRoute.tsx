import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ProtectedAdminRouteProps {
  children: React.ReactNode; 
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const adminData = useSelector((state:RootState) => {
    return state?.admin?.adminDatas;
  });
  console.log("AdminData:", adminData);

  if (!adminData) {
    return <Navigate to={"/admin/login"} />;
  }
  return children;
}

