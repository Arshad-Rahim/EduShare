import { Route } from "react-router-dom";
import { PublicUserRoute } from "../private/user/PublicUserRoute";
import { PublicAdminRoute } from "../private/admin/PublicAdminRoute";
import AuthForm from "../pages/AuthForm";
import AdminLogin from "../pages/admin/AdminLogin";
import { NotFound } from "../pages/404pageNotFount";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

export const PublicRoutes = () => [
  <Route
    key="auth"
    path="/auth"
    element={
      <PublicUserRoute>
        <ErrorBoundary>
          <AuthForm />
        </ErrorBoundary>
      </PublicUserRoute>
    }
  />,
  <Route
    key="admin-login"
    path="/admin/login"
    element={
      <PublicAdminRoute>
        <ErrorBoundary>
          <AdminLogin />
        </ErrorBoundary>
      </PublicAdminRoute>
    }
  />,
  <Route
    key="not-found"
    path="*"
    element={
      <ErrorBoundary>
        <NotFound />
      </ErrorBoundary>
    }
  />,
];
