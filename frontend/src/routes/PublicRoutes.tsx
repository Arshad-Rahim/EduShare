import { memo } from "react";
import { Navigate } from "react-router-dom"; // Import Navigate for redirection
import { PublicUserRoute } from "../private/user/PublicUserRoute";
import { PublicAdminRoute } from "../private/admin/PublicAdminRoute";
import AuthForm from "../pages/AuthForm";
import AdminLogin from "../pages/admin/AdminLogin";
import NotFound from "../pages/404pageNotFount";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";
import UserHomePage from "../pages/student/Home";
import { CourseListingPage } from "../pages/student/CourseListing";
import { CourseDetailsPage } from "../pages/student/CourseDetails";
import { useSelector } from "react-redux"; // Import useSelector to check user state

// Memoize components to prevent unnecessary re-renders
const MemoizedAuthForm = memo(AuthForm);
const MemoizedAdminLogin = memo(AdminLogin);
const MemoizedNotFound = memo(NotFound);
const MemoizedUserHomePage = memo(UserHomePage);
const MemoizedCourseListingPage = memo(CourseListingPage);
const MemoizedCourseDetailsPage = memo(CourseDetailsPage);

// Component to handle redirect based on authentication status
const AuthRedirect = () => {
  const user = useSelector((state: any) => state.user.userDatas);
  // If user is not authenticated, redirect to home; otherwise, show auth page
  return !user?.id && !user?._id ? (
    <Navigate to="/" replace />
  ) : (
    <MemoizedAuthForm />
  );
};

export const publicRoutes = [
  {
    key: "auth",
    path: "/auth",
    element: (
      <PublicUserRoute>
        <ErrorBoundary>
          <AuthRedirect />
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
    key: "user-home",
    path: "/",
    element: (
      <ErrorBoundary>
        <MemoizedUserHomePage />
      </ErrorBoundary>
    ),
  },
  {
    key: "user-courses",
    path: "/courses",
    element: (
      <ErrorBoundary>
        <MemoizedCourseListingPage />
      </ErrorBoundary>
    ),
  },
  {
    key: "user-course-details",
    path: "/courses/:courseId",
    element: (
      <ErrorBoundary>
        <MemoizedCourseDetailsPage />
      </ErrorBoundary>
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
