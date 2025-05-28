import { memo } from "react";
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

export const publicRoutes = [
  {
    key: "auth",
    path: "/auth",
    element: (
      <PublicUserRoute>
        <ErrorBoundary>
          <MemoizedAuthForm />
        </ErrorBoundary>
      </PublicUserRoute>
    ),
  },
  {
    key: "admin-login",
    path: "/admin/login",
    element: (
      <PublicAdminRoute>
        <ErrorBoundary>
          <MemoizedAdminLogin />
        </ErrorBoundary>
      </PublicAdminRoute>
    ),
  },
  {
    key: "not-found",
    path: "*",
    element: (
      <ErrorBoundary>
        <MemoizedNotFound />
      </ErrorBoundary>
    ),
  },
];
