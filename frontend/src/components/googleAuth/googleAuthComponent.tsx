import { authAxiosInstance } from "@/api/authAxiosInstance";
import { addUser } from "@/redux/slice/userSlice";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GoogleAuthProps {
  role: "user" | "tutor";
}
export const GoogleAuth = ({ role }: GoogleAuthProps) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  console.log("CLIENTID", clientId);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin
        onSuccess={(credentialResponse) => {
          authAxiosInstance
            .post("/auth/google-auth", { credentialResponse, role })
            .then((response) => {
              console.log("Success", response.data.userData);
              const role = response.data.userData.role;
              const user = response.data.userData;
              console.log("USER", user);

              dispatch(addUser(user));
              toast.success(response.data.message);
              if (role == "tutor") {
                navigate("/tutor/home");
              } else {
                navigate("/");
              }
            })
            .catch((error) => {
              toast.error(error.response.data.message);
            });
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </GoogleOAuthProvider>
  );
};
