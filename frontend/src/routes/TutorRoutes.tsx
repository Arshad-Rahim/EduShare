import { memo } from "react";
import { ProtectedUserRoute } from "../private/user/ProtectedUserRoute";
import { TutorHome } from "../pages/tutor/Home";
import TutorCourses from "../pages/tutor/TutorCourses";
import { CourseDetails } from "../pages/tutor/CourseDetails";
import { StudentsPage } from "../pages/tutor/StduentsPage";
import MessagesPage from "../pages/tutor/components/MessagesPage";
import WalletPage from "../pages/tutor/Wallet";
import TutorProfileDetails from "../pages/tutor/TutorProfileDetails";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

// Memoize components to prevent unnecessary re-renders
const MemoizedTutorHome = memo(TutorHome);
const MemoizedTutorCourses = memo(TutorCourses);
const MemoizedCourseDetails = memo(CourseDetails);
const MemoizedStudentsPage = memo(StudentsPage);
const MemoizedMessagesPage = memo(MessagesPage);
const MemoizedWalletPage = memo(WalletPage);
const MemoizedTutorProfileDetails = memo(TutorProfileDetails);

export const tutorRoutes = [
  {
    key: "tutor-home",
    path: "/tutor/home",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedTutorHome />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "tutor-courses",
    path: "/tutor/courses",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedTutorCourses />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "tutor-course-details",
    path: "/tutor/courses/:courseId",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedCourseDetails />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "tutor-students",
    path: "/tutor/students",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedStudentsPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "tutor-messages",
    path: "/tutor/messages",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedMessagesPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "tutor-wallet",
    path: "/tutor/wallet",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedWalletPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
  {
    key: "tutor-profile-details",
    path: "/tutor/profileDetails",
    element: (
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MemoizedTutorProfileDetails />
        </ErrorBoundary>
      </ProtectedUserRoute>
    ),
  },
];
