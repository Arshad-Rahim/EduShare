import { FC, memo } from "react";
import { Route } from "react-router-dom";
import { PublicUserRoute } from "../private/user/PublicUserRoute";
import { PublicAdminRoute } from "../private/admin/PublicAdminRoute";
import AuthForm from "../pages/AuthForm";
import AdminLogin from "../pages/admin/AdminLogin";
import NotFound from "../pages/404pageNotFount";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

// Memoize components to prevent unnecessary re-renders
const MemoizedAuthForm = memo(AuthForm);
const MemoizedAdminLogin = memo(AdminLogin);
const MemoizedNotFound = memo(NotFound);

const PublicRoutes: FC = () => {
  return (
    <>
      <Route
        key="auth"
        path="/auth"
        element={
          <PublicUserRoute>
            <ErrorBoundary>
              <MemoizedAuthForm />
            </ErrorBoundary>
          </PublicUserRoute>
        }
      />
      <Route
        key="admin-login"
        path="/admin/login"
        element={
          <PublicAdminRoute>
            <ErrorBoundary>
              <MemoizedAdminLogin />
            </ErrorBoundary>
          </PublicAdminRoute>
        }
      />
      <Route
        key="not-found"
        path="*"
        element={
          <ErrorBoundary>
            <MemoizedNotFound />
          </ErrorBoundary>
        }
      />
    </>
  );
};

export default memo(PublicRoutes);
