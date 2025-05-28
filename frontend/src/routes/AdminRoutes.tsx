import { memo } from "react";
import { ProtectedAdminRoute } from "../private/admin/ProtectedAdminRoute";
import { AdminHome } from "../pages/admin/Home";
import UsersList from "../pages/admin/UserList";
import TutorListing from "../pages/admin/TutorListing";
import AdminCourses from "../pages/admin/Courses";
import FinancePage from "../pages/admin/FinancePage";
import AdminCourseDetails from "../pages/admin/CourseDetails";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

// Memoize components to prevent unnecessary re-renders
const MemoizedAdminHome = memo(AdminHome);
const MemoizedUsersList = memo(UsersList);
const MemoizedTutorListing = memo(TutorListing);
const MemoizedAdminCourses = memo(AdminCourses);
const MemoizedFinancePage = memo(FinancePage);
const MemoizedAdminCourseDetails = memo(AdminCourseDetails);

export const adminRoutes = [
  {
    key: "admin-home",
    path: "/admin/home",
    element: (
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <MemoizedAdminHome />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    ),
  },
  {
    key: "admin-user-list",
    path: "/admin/userList",
    element: (
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <MemoizedUsersList />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    ),
  },
  {
    key: "admin-tutor-list",
    path: "/admin/tutorList",
    element: (
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <MemoizedTutorListing />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    ),
  },
  {
    key: "admin-courses",
    path: "/admin/courses",
    element: (
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <MemoizedAdminCourses />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    ),
  },
  {
    key: "admin-finances",
    path: "/admin/finances",
    element: (
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <MemoizedFinancePage />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    ),
  },
  {
    key: "admin-course-details",
    path: "/admin/courses/:courseId",
    element: (
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <MemoizedAdminCourseDetails />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    ),
  },
];
