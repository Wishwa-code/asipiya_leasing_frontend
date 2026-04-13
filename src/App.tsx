import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import { privateRoutes, publicRoutes } from "./routes";
import { AuthGuard, GuestGuard } from "./components/auth/RouteGuard";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ROUTES } from "./routes/paths";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        }
      >
        <Routes>
          {/* Dashboard Layout - Protected Routes */}
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              {privateRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
            </Route>
          </Route>

          {/* Auth Layout - Guest Only Routes */}
          <Route element={<GuestGuard />}>
            {publicRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                element={route.element}
              />
            ))}
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

// Helper component for Navigate in the fallback route
import { Navigate } from "react-router";
