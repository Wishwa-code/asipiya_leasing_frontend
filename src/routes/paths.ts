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

  // Forms & Products
  CREATE_PRODUCT: "/products/create",
  PRODUCTS_LIST: "/products",
  FORM_ELEMENTS: "/form-elements",

  // Leasing
  CREATE_LEASE: "/leasing/create",
  DRAFT_LEASES: "/leasing/drafts",
  
  // Leasing Partners
  SUPPLIERS: "/leasing-partners/suppliers",
  SEIZERS: "/leasing-partners/seizers",
  INTRODUCERS: "/leasing-partners/introducers",
  VALUATION_COMPANIES: "/leasing-partners/valuation-companies",
  INSURANCE_COMPANIES: "/leasing-partners/insurance-companies",
  AUCTION_COMPANIES: "/leasing-partners/auction-companies",
  VEHICLE_YARDS: "/leasing-partners/vehicle-yards",

  // Customers
  CREATE_CUSTOMER: "/customers/create",

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
