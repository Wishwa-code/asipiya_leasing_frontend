import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { privateRoutes, publicRoutes, autoLoginRoute } from "./routes";
import { AuthGuard, GuestGuard } from "./components/auth/RouteGuard";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ROUTES } from "./routes/paths";
import { Toaster } from "sonner";
import { useTheme } from "./context/ThemeContext";

export default function App() {
  const { theme } = useTheme();

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
          {/* ─────────────────────────────────────────────────────────────────
              Account Center SSO callback — must be OUTSIDE both guards so:
              • Authenticated users can still hit it (e.g., token refresh scenarios)
              • Unauthenticated users are NOT redirected away before the login completes
          ───────────────────────────────────────────────────────────────── */}
          <Route
            path={autoLoginRoute.path}
            element={autoLoginRoute.element}
          />

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
      <Toaster theme={theme} closeButton richColors position="top-right" />
    </Router>
  );
}
