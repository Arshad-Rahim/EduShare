import { memo } from "react";
import { ProtectedUserRoute } from "../private/user/ProtectedUserRoute";
import UserHomePage from "../pages/student/Home";
import StudentProfile from "../pages/student/UserProfile";
import { CourseListingPage } from "../pages/student/CourseListing";
import WishlistPage from "../pages/student/Wishlist";
import { CourseDetailsPage } from "../pages/student/CourseDetails";
import { CourseEnrollPage } from "../pages/student/CourseEnrollPage";
import { CommunityChat } from "../pages/student/CommunityChat";
import MyCoursesPage from "../pages/student/MyCoursePage";
import { PrivateChat } from "../components/privateChat/PrivateChat";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

// Memoize components to prevent unnecessary re-renders
const MemoizedUserHomePage = memo(UserHomePage);
const MemoizedStudentProfile = memo(StudentProfile);
const MemoizedCourseListingPage = memo(CourseListingPage);
const MemoizedWishlistPage = memo(WishlistPage);
const MemoizedCourseDetailsPage = memo(CourseDetailsPage);
const MemoizedCourseEnrollPage = memo(CourseEnrollPage);
const MemoizedCommunityChat = memo(CommunityChat);
const MemoizedMyCoursesPage = memo(MyCoursesPage);
const MemoizedPrivateChat = memo(PrivateChat);

export const userRoutes = [
  {
    key: "user-home",
    path: "/",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedUserHomePage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-profile",
    path: "/profile",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedStudentProfile />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-courses",
    path: "/courses",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedCourseListingPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-wishlist",
    path: "/wishlist",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedWishlistPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-course-details",
    path: "/courses/:courseId",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedCourseDetailsPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-course-enroll",
    path: "/courses/:courseId/enroll",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedCourseEnrollPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-community",
    path: "/community",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedCommunityChat />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-my-courses",
    path: "/my-courses",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedMyCoursesPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "user-private-chat",
    path: "/courses/:courseId/chat",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedPrivateChat />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
];
