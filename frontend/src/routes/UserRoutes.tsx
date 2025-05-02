import { Route } from "react-router-dom";
import { ProtectedUserRoute } from "../private/user/ProtectedUserRoute";
import { UserHomePage } from "../pages/student/Home";
import StudentProfile from "../pages/student/UserProfile";
import { CourseListingPage } from "../pages/student/CourseListing";
import WishlistPage from "../pages/student/Wishlist";
import { CourseDetailsPage } from "../pages/student/CourseDetails";
import { CourseEnrollPage } from "../pages/student/CourseEnrollPage";
import { CommunityChat } from "../pages/student/CommunityChat";
import { MyCoursesPage } from "../pages/student/MyCoursePage";
import { PrivateChat } from "../components/privateChat/PrivateChat";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

export const UserRoutes = () => [
  <Route
    key="user-home"
    path="/"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <UserHomePage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-profile"
    path="/profile"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <StudentProfile />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-courses"
    path="/courses"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <CourseListingPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-wishlist"
    path="/wishlist"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <WishlistPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-course-details"
    path="/courses/:courseId"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <CourseDetailsPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-course-enroll"
    path="/courses/:courseId/enroll"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <CourseEnrollPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-community"
    path="/community"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <CommunityChat />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-my-courses"
    path="/my-courses"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MyCoursesPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="user-private-chat"
    path="/courses/:courseId/chat"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <PrivateChat />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
];
