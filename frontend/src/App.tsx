import AdminLogin from "./pages/admin/AdminLogin";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./pages/AuthForm";
import { NotFound } from "./pages/404pageNotFount";
import { UserHomePage } from "./pages/student/Home";
import { TutorHome } from "./pages/tutor/Home";
import { AdminHome } from "./pages/admin/Home";
import UsersList from "./pages/admin/UserList";
import TutorListing from "./pages/admin/TutorListing";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { PublicAdminRoute } from "./private/admin/PublicAdminRoute";
import { ProtectedUserRoute } from "./private/user/ProtectedUserRoute";
import { ProtectedAdminRoute } from "./private/admin/ProtectedAdminRoute";
import { PublicUserRoute } from "./private/user/PublicUserRoute";
import { TutorProfileDetails } from "./pages/tutor/TutorProfileDetails";
import StudentProfile from "./pages/student/UserProfile";
import { TutorCourses } from "./pages/tutor/TutorCourses";
import { CourseListingPage } from "./pages/student/CourseListing";
import { CourseDetails } from "./pages/tutor/CourseDetails";
import { CourseDetailsPage } from "./pages/student/CourseDetails";
import WishlistPage from "./pages/student/Wishlist";
import { CourseEnrollPage } from "./pages/student/CourseEnrollPage";
import { CommunityChat } from "./pages/student/CommunityChat";
import { Notifications } from "./pages/student/components/Notification";
import { MyCoursesPage } from "./pages/student/MyCoursePage";
import { AdminCourses } from "./pages/admin/Courses";
import { CallNotification } from "./components/videoCall/CallNotification";
import { useAppContext } from "./provider/AppProvider";
import ErrorBoundary from "./components/error-bountry/ErrorBoundry";
import { StudentsPage } from "./pages/tutor/StduentsPage";
import { PrivateChat } from "./components/privateChat/PrivateChat";
import { MessagesPage } from "./pages/tutor/components/MessagesPage";
import { WalletPage } from "./pages/tutor/Wallet";
import { FinancePage } from "./pages/admin/FinancePage";
import { AdminCourseDetails } from "./pages/admin/CourseDetails";

function App() {
  const { tutorId } = useAppContext();

  return (
    <Provider store={store}>
      <Router>
        <Notifications />
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <UserHomePage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <StudentProfile />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/courses"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <CourseListingPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <WishlistPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/courses/:courseId"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <CourseDetailsPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/courses/:courseId/enroll"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <CourseEnrollPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <CommunityChat />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/my-courses"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <MyCoursesPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/courses/:courseId/chat"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <PrivateChat />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/auth"
            element={
              <PublicUserRoute>
                <ErrorBoundary>
                  <AuthForm />
                </ErrorBoundary>
              </PublicUserRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <ErrorBoundary>
                  <AdminLogin />
                </ErrorBoundary>
              </PublicAdminRoute>
            }
          />
          <Route
            path="/tutor/home"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <TutorHome />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tutor/courses"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <TutorCourses />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tutor/courses/:courseId"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <CourseDetails />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tutor/students"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <StudentsPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/tutor/messages"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <MessagesPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/tutor/wallet"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <WalletPage />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/tutor/profileDetails"
            element={
              <ProtectedUserRoute>
                <ErrorBoundary>
                  <TutorProfileDetails />
                </ErrorBoundary>
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/admin/home"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <AdminHome />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/userList"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <UsersList />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/tutorList"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <TutorListing />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <AdminCourses />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/finances"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <FinancePage />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/courses/:courseId"
            element={
              <ProtectedAdminRoute>
                <ErrorBoundary>
                  <AdminCourseDetails />
                </ErrorBoundary>
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="*"
            element={
              <ErrorBoundary>
                <NotFound />
              </ErrorBoundary>
            }
          />
        </Routes>
        {tutorId && <CallNotification tutorId={tutorId} />}
      </Router>
    </Provider>
  );
}

export default App;
