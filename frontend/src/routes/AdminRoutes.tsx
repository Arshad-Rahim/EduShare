import { Route } from "react-router-dom";
import { ProtectedAdminRoute } from "../private/admin/ProtectedAdminRoute";
import { AdminHome } from "../pages/admin/Home";
import UsersList from "../pages/admin/UserList";
import TutorListing from "../pages/admin/TutorListing";
import { AdminCourses } from "../pages/admin/Courses";
import { FinancePage } from "../pages/admin/FinancePage";
import { AdminCourseDetails } from "../pages/admin/CourseDetails";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

export const AdminRoutes = () => [
  <Route
    key="admin-home"
    path="/admin/home"
    element={
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <AdminHome />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-user-list"
    path="/admin/userList"
    element={
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <UsersList />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-tutor-list"
    path="/admin/tutorList"
    element={
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <TutorListing />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-courses"
    path="/admin/courses"
    element={
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <AdminCourses />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-finances"
    path="/admin/finances"
    element={
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <FinancePage />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    }
  />,
  <Route
    key="admin-course-details"
    path="/admin/courses/:courseId"
    element={
      <ProtectedAdminRoute>
        <ErrorBoundary>
          <AdminCourseDetails />
        </ErrorBoundary>
      </ProtectedAdminRoute>
    }
  />,
];
