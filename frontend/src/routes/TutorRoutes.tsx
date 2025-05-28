import { FC, memo, useMemo } from "react";
import { Route } from "react-router-dom";
import { ProtectedUserRoute } from "../private/user/ProtectedUserRoute";
import { TutorHome } from "../pages/tutor/Home";
import  TutorCourses  from "../pages/tutor/TutorCourses";
import { CourseDetails } from "../pages/tutor/CourseDetails";
import { StudentsPage } from "../pages/tutor/StduentsPage";
import  MessagesPage  from "../pages/tutor/components/MessagesPage";
import  WalletPage  from "../pages/tutor/Wallet";
import  TutorProfileDetails  from "../pages/tutor/TutorProfileDetails";
import ErrorBoundary from "../components/error-bountry/ErrorBoundry";

// Memoize components to prevent unnecessary re-renders
const MemoizedTutorHome = memo(TutorHome);
const MemoizedTutorCourses = memo(TutorCourses);
const MemoizedCourseDetails = memo(CourseDetails);
const MemoizedStudentsPage = memo(StudentsPage);
const MemoizedMessagesPage = memo(MessagesPage);
const MemoizedWalletPage = memo(WalletPage);
const MemoizedTutorProfileDetails = memo(TutorProfileDetails);

const TutorRoutes: FC = () => {
  // Memoize the routes to avoid recreating JSX on every render
  const routes = useMemo(
    () => (
      <>
        <Route
          key="tutor-home"
          path="/tutor/home"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedTutorHome />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
        <Route
          key="tutor-courses"
          path="/tutor/courses"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedTutorCourses />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
        <Route
          key="tutor-course-details"
          path="/tutor/courses/:courseId"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedCourseDetails />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
        <Route
          key="tutor-students"
          path="/tutor/students"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedStudentsPage />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
        <Route
          key="tutor-messages"
          path="/tutor/messages"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedMessagesPage />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
        <Route
          key="tutor-wallet"
          path="/tutor/wallet"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedWalletPage />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
        <Route
          key="tutor-profile-details"
          path="/tutor/profileDetails"
          element={
            <ProtectedUserRoute>
              <ErrorBoundary>
                <MemoizedTutorProfileDetails />
              </ErrorBoundary>
            </ProtectedUserRoute>
          }
        />
      </>
    ),
    [] // Empty dependency array since routes are static
  );

  return routes;
};

export default memo(TutorRoutes);
