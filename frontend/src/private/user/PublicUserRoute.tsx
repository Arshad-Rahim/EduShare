import { RootState } from "@/redux/store";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface PublicUserRouteProps {
  children: React.ReactNode;
}

export function PublicUserRoute({ children }: PublicUserRouteProps) {
  const userData = useSelector((state: RootState) => {
    return state?.user?.userDatas;
  });

  if (userData?.role == "tutor") {
    console.log("tutor");
    return <Navigate to={`/${userData.role}/home`} />;
  } else if (userData?.role == "user") {
    console.log("user");
    return <Navigate to={"/"} />;
  }

  return children;
}
