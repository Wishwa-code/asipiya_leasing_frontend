import React from "react";
import { Navigate, Outlet } from "react-router";
import { ROUTES } from "../../routes/paths";
import { useAuth } from "../../context/AuthContext";

/**
 * AuthGuard: Protects routes that require authentication.
 * If the user is not authenticated, redirects to Account Center's /systems page
 * so they can log in via SSO and be redirected back.
 */
export const AuthGuard: React.FC = () => {
  const { isAuthenticated, accountCenterUrl } = useAuth();

  if (!isAuthenticated) {
    // Redirect to Account Center — it will send the user back here with a token
    window.location.href = `${accountCenterUrl}/systems`;
    return null;
  }

  return <Outlet />;
};

/**
 * GuestGuard: Prevents authenticated users from accessing guest pages (like auto-login).
 * Redirects to dashboard if already authenticated.
 */
export const GuestGuard: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
