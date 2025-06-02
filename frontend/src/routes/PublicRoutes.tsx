import { memo } from "react";
import { PublicUserRoute } from "../private/user/PublicUserRoute";
import { PublicAdminRoute } from "../private/admin/PublicAdminRoute";
import AuthForm from "../pages/AuthForm";
import AdminLogin from "../pages/admin/AdminLogin";
import NotFound from "../pages/404pageNotFount";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";
import UserHomePage from "../pages/student/Home";
import { CourseListingPage } from "../pages/student/CourseListing";
import { CourseDetailsPage } from "../pages/student/CourseDetails";

// Memoize components to prevent unnecessary re-renders
const MemoizedAuthForm = memo(AuthForm);
const MemoizedAdminLogin = memo(AdminLogin);
const MemoizedNotFound = memo(NotFound);
const MemoizedUserHomePage = memo(UserHomePage);
const MemoizedCourseListingPage = memo(CourseListingPage);
const MemoizedCourseDetailsPage = memo(CourseDetailsPage);

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
