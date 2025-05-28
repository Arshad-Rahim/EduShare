import { BrowserRouter } from "react-router-dom";
import AdminRoutes from "./routes/AdminRoutes";
import PublicRoutes from "./routes/PublicRoutes";
import TutorRoutes from "./routes/TutorRoutes";
import UserRoutes from "./routes/UserRoutes";

function App() {
  return (
    <BrowserRouter>
      <AdminRoutes />
      <PublicRoutes />
      <TutorRoutes />
      <UserRoutes />
    </BrowserRouter>
  );
}

export default App;
