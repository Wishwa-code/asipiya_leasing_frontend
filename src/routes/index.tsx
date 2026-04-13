import { lazy } from "react";
import { ROUTES } from "./paths";

// Dashboard Components
const Home = lazy(() => import("../pages/Dashboard/Home"));
const UserProfiles = lazy(() => import("../pages/UserProfiles"));
const Calendar = lazy(() => import("../pages/Calendar"));
const Blank = lazy(() => import("../pages/Blank"));

// Forms
const FormElements = lazy(() => import("../pages/Forms/FormElements"));

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
const NotFound = lazy(() => import("../pages/OtherPage/NotFound"));

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
    path: ROUTES.FORM_ELEMENTS,
    element: <FormElements />,
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
