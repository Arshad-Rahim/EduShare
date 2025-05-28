import { BrowserRouter as Router, Routes } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./redux/store";
import { Notifications } from "./pages/student/components/Notification";
import  {CallNotification}  from "./components/videoCall/CallNotification";
import { useAppContext } from "./provider/AppProvider";
import { lazy, memo, Suspense, useCallback, useMemo } from "react";

// Lazy load route modules
const LazyUserRoutes = lazy(() => import("./routes/UserRoutes"));
const LazyTutorRoutes = lazy(() => import("./routes/TutorRoutes"));
const LazyAdminRoutes = lazy(() => import("./routes/AdminRoutes"));
const LazyPublicRoutes = lazy(() => import("./routes/PublicRoutes"));

// Memoize Notifications and CallNotification
const MemoizedNotifications = memo(Notifications);
const MemoizedCallNotification = memo(CallNotification);

function App() {
  const { tutorId } = useAppContext();    

  // Memoize route rendering functions
  const renderUserRoutes = useCallback(() => <LazyUserRoutes />, []);
  const renderTutorRoutes = useCallback(() => <LazyTutorRoutes />, []);
  const renderAdminRoutes = useCallback(() => <LazyAdminRoutes />, []);
  const renderPublicRoutes = useCallback(() => <LazyPublicRoutes />, []);

  // Memoize the Routes component
  const memoizedRoutes = useMemo(
    () => (
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {renderUserRoutes()}
          {renderTutorRoutes()}
          {renderAdminRoutes()}
          {renderPublicRoutes()}
        </Routes>
      </Suspense>
    ),
    [renderUserRoutes, renderTutorRoutes, renderAdminRoutes, renderPublicRoutes]
  );

  return (
    <Provider store={store}>
      <Router>
        <MemoizedNotifications />
        {memoizedRoutes}
        {tutorId && <MemoizedCallNotification tutorId={tutorId} />}
      </Router>
    </Provider>
  );
}

export default memo(App);
