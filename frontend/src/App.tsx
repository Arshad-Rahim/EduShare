import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import CallNotification from "./components/videoCall/CallNotification";
import {Notifications} from "./pages/student/components/Notification";
import { adminRoutes } from "./routes/AdminRoutes";
import { publicRoutes } from "./routes/PublicRoutes";
import { tutorRoutes } from "./routes/TutorRoutes";
import { userRoutes } from "./routes/UserRoutes";

function App() {
  const user = useSelector((state: any) => state.user.userDatas);

  console.log("App user:", {
    userId: user?.id || user?._id,
    userRole: user?.role,
  });

  return (
    <BrowserRouter>
      {/* Render CallNotification for tutors */}
      {user?.role === "tutor" && (user?.id || user?._id) && (
        <CallNotification tutorId={user.id || user._id} />
      )}
      {/* Render Notifications for all authenticated users */}
      {(user?.id || user?._id) && <Notifications />}
      <Routes>
        {adminRoutes.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
        {tutorRoutes.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
        {userRoutes.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
        {publicRoutes.map((route) => (
          <Route key={route.key} path={route.path} element={route.element} />
        ))}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
