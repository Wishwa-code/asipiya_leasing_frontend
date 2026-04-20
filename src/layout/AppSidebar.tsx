import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PieChartIcon,
  PlugInIcon,
  UserCircleIcon,
  DollarLineIcon,
  CheckCircleIcon,
  PlusIcon,
  CloseLineIcon,
  CalenderIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../routes/paths";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  privilege?: string;
  subItems?: { name: string; path: string; privilege?: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered, toggleMobileSidebar } = useSidebar();
  const { user, isHeadOffice, currentBranchId, switchBranch, logout } = useAuth();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: string;
    index: number;
  } | null>(null);

  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  const hasPrivilege = useCallback((priv?: string) => {
    if (!priv) return true;
    return user?.privileges.includes(priv);
  }, [user]);

  const navItems = useMemo(() => {
    const items: NavItem[] = [
      {
        icon: <GridIcon />,
        name: "Dashboard",
        path: ROUTES.DASHBOARD,
      },
    ];

    if (!isHeadOffice) {
      // Branch Menu
      // if (hasPrivilege('VIEW_PRODUCT')) 
      items.push({
        name: "Leasing Products",
        icon: <ListIcon />,
        privilege: 'VIEW_PRODUCT',
        subItems: [
          { name: "Create Product", path: ROUTES.CREATE_PRODUCT, privilege: 'ADD_PRODUCT' },
          { name: "Product List", path: ROUTES.PRODUCTS_LIST, privilege: 'VIEW_PRODUCT' },
        ],
      });

      items.push({
        name: "Customer Management",
        icon: <UserCircleIcon />,
        privilege: 'VIEW_CUSTOMER',
        subItems: [
          { name: "Add Customer", path: ROUTES.CREATE_CUSTOMER, privilege: 'ADD_CUSTOMER' },
          { name: "Customer Draft", path: ROUTES.FORM_ELEMENTS, privilege: 'ADD_CUSTOMER' },
          { name: "Customer List", path: ROUTES.FORM_ELEMENTS, privilege: 'VIEW_CUSTOMER' },
          { name: "Blacklist Management", path: ROUTES.FORM_ELEMENTS, privilege: 'VIEW_BLACKLIST_CUSTOMER' },
          { name: "Savings Accounts", path: ROUTES.FORM_ELEMENTS, privilege: 'CUSTOMER_SAVING_ACC' },
          { name: "Recovery Accounts", path: ROUTES.FORM_ELEMENTS, privilege: 'CUSTOMER_SAVING_ACC' },
          { name: "Insurance Management", path: ROUTES.FORM_ELEMENTS, privilege: 'INSURANCE' },
        ],
      });

      items.push({
        name: "Leasing Partners",
        icon: <PlugInIcon />,
        privilege: 'PENDING_LOAN',
        subItems: [
          { name: "Suppliers", path: ROUTES.SUPPLIERS, privilege: 'CREATE_LOAN' },
          { name: "Introducers/Brokers", path: ROUTES.FORM_ELEMENTS, privilege: 'CREATE_LOAN' },
          { name: "Valuation Companies", path: ROUTES.FORM_ELEMENTS, privilege: 'CREATE_LOAN' },
          { name: "Insurance Companies", path: ROUTES.FORM_ELEMENTS, privilege: 'CREATE_LOAN' },
          { name: "Auction Companies", path: ROUTES.FORM_ELEMENTS, privilege: 'CREATE_LOAN' },
          { name: "Vehicle Yards", path: ROUTES.FORM_ELEMENTS, privilege: 'CREATE_LOAN' },
        ],
      });

      items.push({
        name: "New Leasing Process",
        icon: <PlusIcon />,
        privilege: 'PENDING_LOAN',
        subItems: [
          { name: "New Leasing Application", path: ROUTES.CREATE_LEASE, privilege: 'CREATE_LOAN' },
          { name: "Draft Leasing Application", path: ROUTES.DRAFT_LEASES, privilege: 'CREATE_LOAN' },
          { name: "Leasing Approval Queue", path: ROUTES.FORM_ELEMENTS },
          { name: "Leasing Disbursement", path: ROUTES.FORM_ELEMENTS, privilege: 'LOAN_DISBURSEMENT' },
        ],
      });

      items.push({
        name: "Leasing Management",
        icon: <DollarLineIcon />,
        privilege: 'CURRENT_LOANS',
        subItems: [
          { name: "Active Leases", path: ROUTES.FORM_ELEMENTS },
          { name: "Write-Off Management", path: ROUTES.FORM_ELEMENTS },
          { name: "Lease Reschedule", path: ROUTES.FORM_ELEMENTS, privilege: 'LOAN_RESCHEDULE' },
          { name: "Leases List", path: ROUTES.FORM_ELEMENTS, privilege: 'FULL_LOAN_DETAIL' },
        ],
      });

      items.push({
        name: "Payments",
        icon: <DollarLineIcon />,
        privilege: 'VIEW_PAYMENT',
        subItems: [
          { name: "Single Repayment", path: ROUTES.FORM_ELEMENTS, privilege: 'ADD_REPAYMENT' },
          { name: "Bulk Repayment", path: ROUTES.FORM_ELEMENTS, privilege: 'BULK_REPAYMENT' },
          { name: "Manual Loan Settlement", path: ROUTES.FORM_ELEMENTS, privilege: 'LOAN_SETTLEMENT' },
          { name: "Repayment History", path: ROUTES.FORM_ELEMENTS },
        ],
      });

    } else {
      // Head Office Menu
      items.push({
        name: "Leasing Products",
        icon: <ListIcon />,
        privilege: 'VIEW_PRODUCT',
        subItems: [
          { name: "Create Product", path: ROUTES.CREATE_PRODUCT, privilege: 'ADD_PRODUCT' },
          { name: "Product List", path: ROUTES.PRODUCTS_LIST, privilege: 'VIEW_PRODUCT' },
        ],
      });

      items.push({
        icon: <CalenderIcon />,
        name: "Holiday & Due Skip",
        path: ROUTES.CALENDAR,
      });

      items.push({
        name: "Customer Management",
        icon: <UserCircleIcon />,
        privilege: 'VIEW_CUSTOMER',
        subItems: [
          { name: "Customer List", path: ROUTES.FORM_ELEMENTS, privilege: 'VIEW_CUSTOMER' },
          { name: "Blacklist Management", path: ROUTES.FORM_ELEMENTS, privilege: 'VIEW_BLACKLIST_CUSTOMER' },
          { name: "Insurance Management", path: ROUTES.FORM_ELEMENTS, privilege: 'INSURANCE' },
        ],
      });

      items.push({
        name: "New Leasing Process",
        icon: <PlusIcon />,
        privilege: 'PENDING_LOAN',
        subItems: [
          { name: "Loan Approval Queue", path: ROUTES.FORM_ELEMENTS },
          { name: "Loan Disbursement", path: ROUTES.FORM_ELEMENTS, privilege: 'LOAN_DISBURSEMENT' },
        ],
      });

      items.push({
        name: "Leasing Management",
        icon: <DollarLineIcon />,
        privilege: 'CURRENT_LOANS',
        subItems: [
          { name: "Active Leases", path: ROUTES.FORM_ELEMENTS },
          { name: "Leases List", path: ROUTES.FORM_ELEMENTS, privilege: 'FULL_LOAN_DETAIL' },
        ],
      });

      items.push({
        name: "Collections and Payments",
        icon: <DollarLineIcon />,
        privilege: 'VIEW_PAYMENT',
        subItems: [
          { name: "Repayment History", path: ROUTES.FORM_ELEMENTS },
        ],
      });
    }

    // Common items
    items.push({
      name: "Approvals & Workflow",
      icon: <CheckCircleIcon />,
      subItems: [
        { name: "Pending Approvals", path: ROUTES.FORM_ELEMENTS },
        { name: "Approval History", path: ROUTES.FORM_ELEMENTS },
      ],
    });

    items.push({
      name: "Reports & Analytics",
      icon: <PieChartIcon />,
      privilege: 'MAIN_REPORTS_DASHBOARD',
      subItems: [
        { name: "Portfolio Overview", path: ROUTES.FORM_ELEMENTS },
        { name: "Disbursement Analysis", path: ROUTES.FORM_ELEMENTS, privilege: 'LOAN_DISBURSEMENT_PERFORMANCE' },
        { name: "Repayment Analysis", path: ROUTES.FORM_ELEMENTS },
      ],
    });

    return items.filter(item => hasPrivilege(item.privilege));
  }, [isHeadOffice, hasPrivilege]);

  useEffect(() => {
    let submenuMatched = false;
    navItems.forEach((nav, index) => {
      if (nav.subItems) {
        nav.subItems.forEach((subItem) => {
          if (isActive(subItem.path)) {
            setOpenSubmenu({ type: "main", index });
            submenuMatched = true;
          }
        });
      }
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive, navItems]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number) => {
    setOpenSubmenu((prev) => (prev?.index === index ? null : { type: "main", index }));
  };

  const renderMenuItems = (items: NavItem[]) => (
    <ul className="flex flex-col gap-2">
      {items.map((nav, index) => {
        // Filter sub-items by privilege
        const visibleSubItems = nav.subItems?.filter(sub => hasPrivilege(sub.privilege));

        if (nav.subItems && (!visibleSubItems || visibleSubItems.length === 0)) return null;

        return (
          <li key={nav.name}>
            {nav.subItems ? (
              <button
                onClick={() => handleSubmenuToggle(index)}
                className={`menu-item group ${openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className={`menu-item-icon-size ${openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""}`} />
                )}
              </button>
            ) : (
              nav.path && (
                <Link to={nav.path} className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"}`}>
                  <span className={`menu-item-icon-size ${isActive(nav.path) ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                    {nav.icon}
                  </span>
                  {(isExpanded || isHovered || isMobileOpen) && (
                    <span className="menu-item-text">{nav.name}</span>
                  )}
                </Link>
              )
            )}
            {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
              <div
                ref={(el) => { subMenuRefs.current[`main-${index}`] = el; }}
                className="overflow-hidden transition-all duration-300"
                style={{ height: openSubmenu?.index === index ? `${subMenuHeight[`main-${index}`]}px` : "0px" }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  {visibleSubItems?.map((subItem) => (
                    <li key={subItem.name}>
                      <Link to={subItem.path} className={`menu-dropdown-item ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}>
                        {subItem.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Mobile Profile Header */}
      <div className="lg:hidden p-4 border-b mb-2 bg-gray-50 dark:bg-gray-800/50 rounded-2xl mx-1 mt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={user?.logo || "/assets/images/users/avatar-1.jpg"}
              className="rounded-full border-2 border-white shadow-sm w-12 h-12 object-cover"
              alt="Profile"
            />
            <div className="overflow-hidden">
              <h6 className="mb-0 font-bold text-gray-900 dark:text-white truncate">{user?.full_name}</h6>
              <span className="text-gray-500 text-[11px]">Admin User</span>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMobileSidebar}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <CloseLineIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Branch Switcher */}
      <div className="lg:hidden px-2 mb-4">
        {user?.branch_access === 1 ? (
          <div className="bg-brand-50 dark:bg-brand-900/20 p-3 rounded-xl border border-brand-100 dark:border-brand-800">
            <div className="flex items-center gap-2 mb-1">
              <PlusIcon className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-brand-600 uppercase">Active Branch</span>
            </div>
            <select
              className="w-full bg-transparent border-none text-sm font-medium text-gray-900 dark:text-white focus:ring-0 p-0 cursor-pointer"
              value={currentBranchId || ""}
              onChange={(e) => switchBranch(parseInt(e.target.value))}
            >
              {user.branches?.map(b => (
                <option key={b.idBranch} value={b.idBranch}>{b.Name}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Current Branch</span>
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <PlugInIcon className="w-4 h-4 text-gray-400" />
              {user?.branch_name}
            </div>
          </div>
        )}
      </div>

      {/* Brand Logo (Desktop) */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="min-w-[42px]">
            <img
              src="https://accountcenter.asipiya.com/asipiya.svg"
              alt="Logo"
              className="w-[42px] h-[42px] rounded-full shadow-sm"
            />
          </div>
          {(isExpanded || isHovered || isMobileOpen) && (
            <div className="flex flex-col justify-center">
              <span className="font-bold text-gray-900 dark:text-white text-lg leading-tight truncate max-w-[180px]">
                {user?.company_name || "Asipiya"}
              </span>
              <span className="text-gray-500 text-xs font-medium">Leasing Center</span>
            </div>
          )}
        </Link>
      </div>

      {/* Sidebar Menu */}
      <div className="flex flex-col flex-grow overflow-y-auto no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className={`mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Menu" : <HorizontaLDots className="size-6" />}
              </h2>
              {renderMenuItems(navItems)}
            </div>
          </div>
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-800 py-4">
        <ul className="flex flex-col gap-2">
          <li>
            <a href="https://accountcenter.asipiya.com/systems" className="menu-item group text-gray-600 dark:text-gray-400">
              <span className="menu-item-icon-size"><GridIcon /></span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Account Center</span>}
            </a>
          </li>
          <li>
            <button onClick={logout} className="menu-item group text-error-600 hover:text-error-700 w-full text-left">
              <span className="menu-item-icon-size"><CloseLineIcon className="text-error-500" /></span>
              {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Logout</span>}
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
};

export default AppSidebar;
