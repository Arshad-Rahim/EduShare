import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useAppContext } from "./provider/AppProvider";
import CallNotification from "./components/videoCall/CallNotification";
import { adminRoutes } from "./routes/AdminRoutes";
import { publicRoutes } from "./routes/PublicRoutes";
import { tutorRoutes } from "./routes/TutorRoutes";
import { userRoutes } from "./routes/UserRoutes";

function App() {
  const { tutorId } = useAppContext(); // Assuming user contains role and id

  return (
    <BrowserRouter>
      {/* Render CallNotification for tutors */}
      {tutorId && <CallNotification tutorId={tutorId} />}

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

