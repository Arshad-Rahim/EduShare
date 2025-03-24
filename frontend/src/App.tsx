import AdminLogin from "./pages/admin/AdminLogin";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./pages/AuthForm";
import { NotFound } from "./pages/404pageNotFount";
import { UserHomePage } from "./pages/student/home";
import { TutorHome } from "./pages/tutor/home";
import { AdminHome } from "./pages/admin/Home";
import UsersList from "./pages/admin/UserList";
import TutorListing from "./pages/admin/TutorListing";
import { Provider } from "react-redux";
import { store } from "./redux/store";

import { PublicAdminRoute } from "./private/admin/PublicAdminRoute";
import { ProtectedUserRoute } from "./private/user/ProtectedUserRoute";
import { ProtectedAdminRoute } from "./private/admin/ProtectedAdminRoute";
import { PublicUserRoute } from "./private/user/PublicUserRoute";
import { TutorProfileDetails } from "./pages/tutor/TutorProfileDetails";

function App() {
  return (
    <>
      <Provider store={store}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedUserRoute>
                  <UserHomePage />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/auth"
              element={
                <PublicUserRoute>
                  <AuthForm />
                </PublicUserRoute>
              }
            />

            <Route
              path="/admin/login"
              element={
                <PublicAdminRoute>
                  <AdminLogin />
                </PublicAdminRoute>
              }
            />

            <Route
              path="/tutor/home"
              element={
                <ProtectedUserRoute>
                  <TutorHome />
                </ProtectedUserRoute>
              }
            />
            <Route
              path="/admin/home"
              element={
                <ProtectedAdminRoute>
                  <AdminHome />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/userList"
              element={
                <ProtectedAdminRoute>
                  <UsersList />
                </ProtectedAdminRoute>
              }
            />
            <Route
              path="/admin/tutorList"
              element={
                <ProtectedAdminRoute>
                  <TutorListing />
                </ProtectedAdminRoute>
              }
            />

            <Route
              path="/tutor/profileDetails"
              element={
                <ProtectedUserRoute>
                  <TutorProfileDetails />
                </ProtectedUserRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </Provider>
    </>
  );
}

export default App;
