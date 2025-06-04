import { memo } from "react";
import { ProtectedUserRoute } from "../private/user/ProtectedUserRoute";
import StudentProfile from "../pages/student/UserProfile";
import WishlistPage from "../pages/student/Wishlist";
import { CourseEnrollPage } from "../pages/student/CourseEnrollPage";
import { CommunityChat } from "../pages/student/CommunityChat";
import MyCoursesPage from "../pages/student/MyCoursePage";
import { PrivateChat } from "../pages/student/components/privateChat/PrivateChat";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

// Memoize components to prevent unnecessary re-renders
const MemoizedStudentProfile = memo(StudentProfile);
const MemoizedWishlistPage = memo(WishlistPage);
const MemoizedCourseEnrollPage = memo(CourseEnrollPage);
const MemoizedCommunityChat = memo(CommunityChat);
const MemoizedMyCoursesPage = memo(MyCoursesPage);
const MemoizedPrivateChat = memo(PrivateChat);

export const userRoutes = [
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
