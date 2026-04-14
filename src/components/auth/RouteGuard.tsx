import React from "react";
import { Navigate, Outlet } from "react-router";
import { ROUTES } from "../../routes/paths";
import Cookies from "js-cookie";

/**
 * AuthGuard: Protects routes that require authentication.
 * Redirects to sign-in if no token is found.
 */
export const AuthGuard: React.FC = () => {
  const isAuthenticated = !!Cookies.get("auth_token");

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.SIGNIN} replace />;
  }

  return <Outlet />;
};

/**
 * GuestGuard: Prevents authenticated users from accessing guest pages (like login).
 * Redirects to dashboard if a token is found.
 */
export const GuestGuard: React.FC = () => {
  const isAuthenticated = !!Cookies.get("auth_token");

  if (isAuthenticated) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <Outlet />;
};
