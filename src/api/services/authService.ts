export const handleLogout = () => {
  // Clear tokens from localStorage
  localStorage.removeItem("auth_token");
  localStorage.removeItem("refresh_token");

  // Redirect to login page if window is available
  if (typeof window !== "undefined") {
    window.location.href = "/signin";
  }
};

/**
 * You can add more auth-related services here later,
 * like login, signup, etc.
 */
