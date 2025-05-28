import { BrowserRouter, Routes, Route } from "react-router-dom";
import { adminRoutes } from "./routes/AdminRoutes";
import { publicRoutes } from "./routes/PublicRoutes";
import { tutorRoutes } from "./routes/TutorRoutes";
import { userRoutes } from "./routes/UserRoutes";

function App() {
  return (
    <BrowserRouter>
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
