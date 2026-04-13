export const ROUTES = {
  // Public Routes
  SIGNIN: "/signin",
  SIGNUP: "/signup",
  RESET_PASSWORD: "/reset-password",

  // Authenticated Routes
  DASHBOARD: "/",
  PROFILE: "/profile",
  CALENDAR: "/calendar",
  BLANK: "/blank",

  // Forms
  FORM_ELEMENTS: "/form-elements",

  // Tables
  BASIC_TABLES: "/basic-tables",

  // UI Elements
  ALERTS: "/alerts",
  AVATARS: "/avatars",
  BADGE: "/badge",
  BUTTONS: "/buttons",
  IMAGES: "/images",
  VIDEOS: "/videos",

  // Charts
  LINE_CHART: "/line-chart",
  BAR_CHART: "/bar-chart",

  // Other
  NOT_FOUND: "*",
} as const;
