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
import { StudentsPage } from "./pages/tutor/StduentsPage";
import { CommunityChat } from "./pages/student/CommunityChat";
import AppProvider from "./provider/AppProvider";
import { Notifications } from "./pages/student/components/Notification";
import { MyCoursesPage } from "./pages/student/MyCoursePage";
import { AdminCourses } from "./pages/admin/Courses";

function App() {
  return (
    <>
      <Provider store={store}>
        <AppProvider>
          <Router>
            <Notifications />

            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedUserRoute>
                    <UserHomePage />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedUserRoute>
                    <StudentProfile />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/courses"
                element={
                  <ProtectedUserRoute>
                    <CourseListingPage />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/wishlist"
                element={
                  <ProtectedUserRoute>
                    <WishlistPage />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/courses/:courseId"
                element={
                  <ProtectedUserRoute>
                    <CourseDetailsPage />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/courses/:courseId/enroll"
                element={
                  <ProtectedUserRoute>
                    <CourseEnrollPage />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/community"
                element={
                  <ProtectedUserRoute>
                    <CommunityChat />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/my-courses"
                element={
                  <ProtectedUserRoute>
                    <MyCoursesPage />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/auth"
                element={
                  <PublicUserRoute>
                    <AuthForm />
                  </PublicUserRoute>
                }
              />

              <Route
                path="/admin/login"
                element={
                  <PublicAdminRoute>
                    <AdminLogin />
                  </PublicAdminRoute>
                }
              />

              <Route
                path="/tutor/home"
                element={
                  <ProtectedUserRoute>
                    <TutorHome />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/tutor/courses"
                element={
                  <ProtectedUserRoute>
                    <TutorCourses />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/tutor/courses/:courseId"
                element={
                  <ProtectedUserRoute>
                    <CourseDetails />
                  </ProtectedUserRoute>
                }
              />

              <Route
                path="/tutor/students"
                element={
                  <ProtectedUserRoute>
                    <StudentsPage />
                  </ProtectedUserRoute>
                }
              />
              <Route
                path="/admin/home"
                element={
                  <ProtectedAdminRoute>
                    <AdminHome />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/userList"
                element={
                  <ProtectedAdminRoute>
                    <UsersList />
                  </ProtectedAdminRoute>
                }
              />
              <Route
                path="/admin/tutorList"
                element={
                  <ProtectedAdminRoute>
                    <TutorListing />
                  </ProtectedAdminRoute>
                }
              />

              <Route
                path="/admin/courses"
                element={
                  <ProtectedAdminRoute>
                    <AdminCourses />
                  </ProtectedAdminRoute>
                }
              />

              <Route
                path="/tutor/profileDetails"
                element={
                  <ProtectedUserRoute>
                    <TutorProfileDetails />
                  </ProtectedUserRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AppProvider>
      </Provider>
    </>
  );
}

export default App;
