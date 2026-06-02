import { lazy } from "react";
import { ROUTES } from "./paths";

// Dashboard Components
const Home = lazy(() => import("../pages/Dashboard/Home"));
const UserProfiles = lazy(() => import("../pages/UserProfiles"));
const Calendar = lazy(() => import("../pages/Calendar"));
const Blank = lazy(() => import("../pages/Blank"));

const CreateProduct = lazy(() => import("../pages/Products/CreateProduct"));
const ProductList = lazy(() => import("../pages/Products/ProductList"));

// Customers
const CreateCustomer = lazy(() => import("../pages/Customers/CreateCustomer"));
const CustomerList = lazy(() => import("../pages/Customers/CustomerList"));

// Leasing
const CreateLeasing = lazy(() => import("../pages/Leasing/CreateLeasing"));
const DraftLeasesList = lazy(() => import("../pages/Leasing/DraftLeasesList"));
const PendingLeasesList = lazy(() => import("../pages/Leasing/PendingLeasesList"));
const LeasingDisbursementList = lazy(() => import("../pages/Leasing/LeasingDisbursementList"));
const PendingApprovalsList = lazy(() => import("../pages/Approvals/PendingApprovalsList"));

const FormElements = lazy(() => import("../pages/Forms/FormElements"));

// Leasing Partners
const SuppliersManagement = lazy(() => import("../pages/Partners/SuppliersManagement"));
const SeizersManagement = lazy(() => import("../pages/Partners/SeizersManagement"));
const IntroducersManagement = lazy(() => import("../pages/Partners/IntroducersManagement"));
const ValuationCompaniesManagement = lazy(() => import("../pages/Partners/ValuationCompaniesManagement"));
const InsuranceCompaniesManagement = lazy(() => import("../pages/Partners/InsuranceCompaniesManagement"));
const AuctionCompaniesManagement = lazy(() => import("../pages/Partners/AuctionCompaniesManagement"));
const VehicleYardsManagement = lazy(() => import("../pages/Partners/VehicleYardsManagement"));

// Tables
const BasicTables = lazy(() => import("../pages/Tables/BasicTables"));

// UI Elements
const Alerts = lazy(() => import("../pages/UiElements/Alerts"));
const Avatars = lazy(() => import("../pages/UiElements/Avatars"));
const Badges = lazy(() => import("../pages/UiElements/Badges"));
const Buttons = lazy(() => import("../pages/UiElements/Buttons"));
const Images = lazy(() => import("../pages/UiElements/Images"));
const Videos = lazy(() => import("../pages/UiElements/Videos"));

// Charts
const LineChart = lazy(() => import("../pages/Charts/LineChart"));
const BarChart = lazy(() => import("../pages/Charts/BarChart"));

// Auth
const SignIn = lazy(() => import("../pages/AuthPages/SignIn"));
const SignUp = lazy(() => import("../pages/AuthPages/SignUp"));
const AutoLogin = lazy(() => import("../pages/AuthPages/AutoLogin"));
const NotFound = lazy(() => import("../pages/OtherPage/NotFound"));

// Public routes — accessible without authentication
// AutoLogin is listed here but handled separately in App.tsx (outside GuestGuard)
export const publicRoutes = [
  {
    path: ROUTES.SIGNIN,
    element: <SignIn />,
  },
  {
    path: ROUTES.SIGNUP,
    element: <SignUp />,
  },
  {
    path: ROUTES.NOT_FOUND,
    element: <NotFound />,
  },
];

// AutoLogin route — exported separately so App.tsx can place it outside GuestGuard
export const autoLoginRoute = {
  path: ROUTES.AUTO_LOGIN,
  element: <AutoLogin />,
};


export const privateRoutes = [
  {
    path: ROUTES.DASHBOARD,
    element: <Home />,
  },
  {
    path: ROUTES.PROFILE,
    element: <UserProfiles />,
  },
  {
    path: ROUTES.CALENDAR,
    element: <Calendar />,
  },
  {
    path: ROUTES.BLANK,
    element: <Blank />,
  },
  {
    path: ROUTES.CREATE_PRODUCT,
    element: <CreateProduct />,
  },
  {
    path: ROUTES.EDIT_PRODUCT,
    element: <CreateProduct />,
  },
  {
    path: ROUTES.PRODUCTS_LIST,
    element: <ProductList />,
  },
  {
    path: ROUTES.CREATE_CUSTOMER,
    element: <CreateCustomer />,
  },
  {
    path: ROUTES.CUSTOMERS_LIST,
    element: <CustomerList />,
  },
  {
    path: ROUTES.EDIT_CUSTOMER,
    element: <CreateCustomer />,
  },
  {
    path: ROUTES.CREATE_LEASE,
    element: <CreateLeasing />,
  },
  {
    path: ROUTES.DRAFT_LEASES,
    element: <DraftLeasesList />,
  },
  {
    path: ROUTES.PENDING_LEASES,
    element: <PendingLeasesList />,
  },
  {
    path: ROUTES.LEASING_DISBURSEMENT,
    element: <LeasingDisbursementList />,
  },
  {
    path: ROUTES.PENDING_APPROVALS,
    element: <PendingApprovalsList />,
  },
  {
    path: ROUTES.FORM_ELEMENTS,
    element: <FormElements />,
  },
  {
    path: ROUTES.SUPPLIERS,
    element: <SuppliersManagement />,
  },
  {
    path: ROUTES.SEIZERS,
    element: <SeizersManagement />,
  },
  {
    path: ROUTES.INTRODUCERS,
    element: <IntroducersManagement />,
  },
  {
    path: ROUTES.VALUATION_COMPANIES,
    element: <ValuationCompaniesManagement />,
  },
  {
    path: ROUTES.INSURANCE_COMPANIES,
    element: <InsuranceCompaniesManagement />,
  },
  {
    path: ROUTES.AUCTION_COMPANIES,
    element: <AuctionCompaniesManagement />,
  },
  {
    path: ROUTES.VEHICLE_YARDS,
    element: <VehicleYardsManagement />,
  },
  {
    path: ROUTES.BASIC_TABLES,
    element: <BasicTables />,
  },
  {
    path: ROUTES.ALERTS,
    element: <Alerts />,
  },
  {
    path: ROUTES.AVATARS,
    element: <Avatars />,
  },
  {
    path: ROUTES.BADGE,
    element: <Badges />,
  },
  {
    path: ROUTES.BUTTONS,
    element: <Buttons />,
  },
  {
    path: ROUTES.IMAGES,
    element: <Images />,
  },
  {
    path: ROUTES.VIDEOS,
    element: <Videos />,
  },
  {
    path: ROUTES.LINE_CHART,
    element: <LineChart />,
  },
  {
    path: ROUTES.BAR_CHART,
    element: <BarChart />,
  },
];
