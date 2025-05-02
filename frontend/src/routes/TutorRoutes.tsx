import { Route } from "react-router-dom";
import { ProtectedUserRoute } from "../private/user/ProtectedUserRoute";
import { TutorHome } from "../pages/tutor/Home";
import { TutorCourses } from "../pages/tutor/TutorCourses";
import { CourseDetails } from "../pages/tutor/CourseDetails";
import { StudentsPage } from "../pages/tutor/StduentsPage";
import { MessagesPage } from "../pages/tutor/components/MessagesPage";
import { WalletPage } from "../pages/tutor/Wallet";
import { TutorProfileDetails } from "../pages/tutor/TutorProfileDetails";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

export const TutorRoutes = () => [
  <Route
    key="tutor-home"
    path="/tutor/home"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <TutorHome />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="tutor-courses"
    path="/tutor/courses"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <TutorCourses />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="tutor-course-details"
    path="/tutor/courses/:courseId"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <CourseDetails />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="tutor-students"
    path="/tutor/students"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <StudentsPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="tutor-messages"
    path="/tutor/messages"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <MessagesPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="tutor-wallet"
    path="/tutor/wallet"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <WalletPage />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
  <Route
    key="tutor-profile-details"
    path="/tutor/profileDetails"
    element={
      <ProtectedUserRoute>
        <ErrorBoundary>
          <TutorProfileDetails />
        </ErrorBoundary>
      </ProtectedUserRoute>
    }
  />,
];
