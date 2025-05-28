import { BrowserRouter, Routes } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import TutorRoutes from "./routes/TutorRoutes";
import UserRoutes from "./routes/UserRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <AdminRoutes />
        <TutorRoutes />
        <UserRoutes />
        <PublicRoutes /> {/* Place PublicRoutes last due to catch-all */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
