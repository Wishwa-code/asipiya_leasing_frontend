import { useState, useEffect, useRef, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router";
import {
  EyeIcon,
  PencilIcon,
  HorizontaLDots,
  CloseIcon,
  MapIcon as MapPinIcon,
} from "../../icons";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import ViewCustomerModal from "./components/ViewCustomerModal";
import LocationModal from "./components/LocationModal";
import { DataTable } from "../../components/ui/table";


type CustomerListItem = {
  ID: number;
  customer_code: string;
  full_name: string;
  first_name: string;
  last_name: string;
  title: string;
  new_nic: string;
  old_nic: string;
  contact_no: string;
  email: string;
  status: string;
  city: string;
  latitude: number;
  longitude: number;
};

type ColKey = "nic" | "contact" | "email" | "status" | "city";

const TABS = [
  { label: "All customers", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedLocationCus, setSelectedLocationCus] = useState<CustomerListItem | null>(null);
  const [openActionMenuId, setOpenActionMenuId] = useState<number | null>(null);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Column Visibility State
  const [visibleCols, setVisibleCols] = useState<Record<ColKey, boolean>>({
    nic: true,
    contact: true,
    email: false,
    status: true,
    city: true,
  });

  // Active Popover State
  const [activePopover, setActivePopover] = useState<
    "code" | "nic" | "day" | "city" | "columns" | null
  >(null);

  // Filters State
  const [filters, setFilters] = useState({
    code: "",
    nic: "",
    status: "",
    city: "",
    collectionDay: "",
  });

  // Temporary filter state (holds input before Apply)
  const [tempFilters, setTempFilters] = useState({
    code: "",
    nic: "",
    city: "",
    collectionDay: "",
  });

  const popoverRef = useRef<HTMLDivElement | null>(null);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setActivePopover(null);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(event.target as Node)
      ) {
        setOpenActionMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/customers", {
        params: {
          code: filters.code,
          nic: filters.nic,
          status: filters.status,
          city: filters.city,
          collection_day: filters.collectionDay,
        },
      });
      setCustomers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (statusVal: string) => {
    setFilters((prev) => ({ ...prev, status: statusVal }));
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    setCustomers(
      customers.map((c) => (c.ID === id ? { ...c, status: newStatus } : c))
    );
    try {
      await apiClient.post(`/customers/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      setCustomers(
        customers.map((c) => (c.ID === id ? { ...c, status: currentStatus } : c))
      );
    }
  };

  const handleExport = () => {
    const headers = [
      "ID", "Customer Code", "Title", "Full Name", "NIC",
      "Contact No", "Email", "Status", "City",
    ];
    const rows = customers.map((c) => [
      c.ID, c.customer_code, c.title, c.full_name,
      c.new_nic || c.old_nic, c.contact_no, c.email || "",
      c.status, c.city || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) =>
          e
            .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
            .join(",")
        ),
      ].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute(
      "download",
      `customers_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openFilterPopover = (
    type: "code" | "nic" | "day" | "city" | "columns"
  ) => {
    setTempFilters({
      code: filters.code,
      nic: filters.nic,
      city: filters.city,
      collectionDay: filters.collectionDay,
    });
    setActivePopover(type);
  };

  const handleApplyFilter = (
    key: "code" | "nic" | "collectionDay" | "city",
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActivePopover(null);
  };

  const handleClearSingleFilter = (
    key: "code" | "nic" | "collectionDay" | "city"
  ) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setTempFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllFilters = () => {
    setFilters({ code: "", nic: "", status: filters.status, city: "", collectionDay: "" });
    setTempFilters({ code: "", nic: "", city: "", collectionDay: "" });
    setActivePopover(null);
  };

  const isAnyFilterActive =
    filters.code || filters.nic || filters.city || filters.collectionDay;

  // Client-side search filter (runs on top of API-filtered data)
  const searchLower = searchQuery.trim().toLowerCase();
  const searchFiltered = searchLower
    ? customers.filter(
        (c) =>
          c.full_name?.toLowerCase().includes(searchLower) ||
          c.customer_code?.toLowerCase().includes(searchLower) ||
          c.new_nic?.toLowerCase().includes(searchLower) ||
          c.old_nic?.toLowerCase().includes(searchLower) ||
          c.contact_no?.toLowerCase().includes(searchLower) ||
          c.city?.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower)
      )
    : customers;

  // Pagination derived values
  const totalItems = searchFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const pagedCustomers = searchFiltered.slice(pageStart, pageEnd);

  // Reset to page 1 when search query or pageSize changes
  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Reusable filter pill button
  const FilterPill = ({
    label,
    activeValue,
    onClear,
    onOpen,
  }: {
    label: string;
    activeValue: string;
    onClear: () => void;
    onOpen: () => void;
  }) =>
    activeValue ? (
      <span className="inline-flex items-center gap-1 border border-brand-400 dark:border-brand-500/40 rounded-full px-2.5 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-500/10">
        {label}: {activeValue}
        <button
          onClick={onClear}
          className="ml-0.5 text-brand-400 hover:text-brand-600 transition-colors"
        >
          <CloseIcon className="w-3 h-3" />
        </button>
      </span>
    ) : (
      <button
        onClick={onOpen}
        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      >
        <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full border border-current leading-none text-[9px] font-bold">
          +
        </span>
        {label}
      </button>
    );

  // Reusable popover container
  const FilterPopover = ({
    children,
    align = "left",
  }: {
    children: React.ReactNode;
    align?: "left" | "right";
  }) => (
    <div
      ref={popoverRef}
      className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 z-50 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg p-4 min-w-[240px]`}
    >
      {children}
    </div>
  );

  const columns = useMemo(() => [
    {
      key: "idx",
      label: "#",
      toggleable: false,
      render: (_: any, idx: number) => <span className="text-gray-400">{pageStart + idx + 1}</span>,
    },
    {
      key: "avatar",
      label: "",
      toggleable: false,
      render: (customer: CustomerListItem) => (
        <div
          style={{ width: 22, height: 22 }}
          className="rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-semibold text-[9px] border border-brand-100 dark:border-brand-500/20 shrink-0 select-none"
        >
          {(customer.first_name?.[0] || customer.full_name?.[0] || "?").toUpperCase()}
          {(customer.last_name?.[0] || "").toUpperCase()}
        </div>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      toggleable: false,
      render: (customer: CustomerListItem) => (
        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
          {customer.title} {customer.full_name}
        </p>
      ),
    },
    {
      key: "nic",
      label: "NIC",
      toggleable: true,
      render: (customer: CustomerListItem) =>
        customer.new_nic || customer.old_nic || <span className="text-gray-300 dark:text-gray-600">—</span>,
    },
    {
      key: "contact",
      label: "Contact No",
      toggleable: true,
      render: (customer: CustomerListItem) =>
        customer.contact_no || <span className="text-gray-300 dark:text-gray-600">—</span>,
    },
    {
      key: "email",
      label: "Email",
      toggleable: true,
      render: (customer: CustomerListItem) =>
        customer.email || <span className="text-gray-300 dark:text-gray-600">—</span>,
    },
    {
      key: "status",
      label: "Status",
      toggleable: true,
      render: (customer: CustomerListItem) => (
        <span
          onClick={() => toggleStatus(customer.ID, customer.status)}
          title="Click to toggle status"
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium cursor-pointer select-none transition-colors ${
            customer.status === "active"
              ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-700/60 dark:text-gray-400"
          }`}
        >
          {customer.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "city",
      label: "City",
      toggleable: true,
      render: (customer: CustomerListItem) =>
        customer.city || <span className="text-gray-300 dark:text-gray-600">—</span>,
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (customer: CustomerListItem) => (
        <div
          className="relative flex justify-end"
          ref={openActionMenuId === customer.ID ? actionMenuRef : undefined}
        >
          <button
            onClick={() =>
              setOpenActionMenuId(openActionMenuId === customer.ID ? null : customer.ID)
            }
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Actions"
          >
            <HorizontaLDots className="w-4 h-4" />
          </button>

          {openActionMenuId === customer.ID && (
            <div className="absolute right-0 top-8 z-50 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 min-w-[160px]">
              <button
                onClick={() => {
                  setSelectedCustomerId(customer.ID);
                  setOpenActionMenuId(null);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <EyeIcon className="w-4 h-4 fill-current shrink-0" />
                View details
              </button>
              <button
                onClick={() => {
                  navigate(ROUTES.EDIT_CUSTOMER.replace(":id", customer.ID.toString()));
                  setOpenActionMenuId(null);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <PencilIcon className="w-4 h-4 shrink-0" />
                Edit record
              </button>
              <button
                onClick={() => {
                  setSelectedLocationCus(customer);
                  setOpenActionMenuId(null);
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <MapPinIcon className="w-4 h-4 shrink-0" />
                Update location
              </button>
            </div>
          )}
        </div>
      ),
    },
  ], [pageStart, openActionMenuId, visibleCols]);

  const filterBarLeft = (
    <>
      {/* Code */}
      <div className="relative">
        <FilterPill
          label="Code"
          activeValue={filters.code}
          onClear={() => handleClearSingleFilter("code")}
          onOpen={() => openFilterPopover("code")}
        />
        {activePopover === "code" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: Customer Code
              </p>
              <input
                type="text"
                placeholder="Enter customer code"
                autoFocus
                className="w-full text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg outline-none text-gray-800 dark:text-white focus:border-brand-400"
                value={tempFilters.code}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, code: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleApplyFilter("code", tempFilters.code)
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActivePopover(null)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleApplyFilter("code", tempFilters.code)
                  }
                  className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </FilterPopover>
        )}
      </div>

      {/* NIC */}
      <div className="relative">
        <FilterPill
          label="NIC"
          activeValue={filters.nic}
          onClear={() => handleClearSingleFilter("nic")}
          onOpen={() => openFilterPopover("nic")}
        />
        {activePopover === "nic" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: NIC Number
              </p>
              <input
                type="text"
                placeholder="Enter NIC number"
                autoFocus
                className="w-full text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg outline-none text-gray-800 dark:text-white focus:border-brand-400"
                value={tempFilters.nic}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, nic: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleApplyFilter("nic", tempFilters.nic)
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActivePopover(null)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleApplyFilter("nic", tempFilters.nic)
                  }
                  className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </FilterPopover>
        )}
      </div>

      {/* Collection Day */}
      <div className="relative">
        <FilterPill
          label="Collection Day"
          activeValue={filters.collectionDay}
          onClear={() => handleClearSingleFilter("collectionDay")}
          onOpen={() => openFilterPopover("day")}
        />
        {activePopover === "day" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: Collection Day
              </p>
              <select
                className="w-full text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg outline-none text-gray-800 dark:text-white focus:border-brand-400"
                value={tempFilters.collectionDay}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    collectionDay: e.target.value,
                  })
                }
              >
                <option value="">Select Day</option>
                {[
                  "monday",
                  "tuesday",
                  "wednesday",
                  "thursday",
                  "friday",
                  "saturday",
                  "sunday",
                ].map((d) => (
                  <option key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </option>
                ))}
              </select>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActivePopover(null)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleApplyFilter(
                      "collectionDay",
                      tempFilters.collectionDay
                    )
                  }
                  className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </FilterPopover>
        )}
      </div>

      {/* City */}
      <div className="relative">
        <FilterPill
          label="City"
          activeValue={filters.city}
          onClear={() => handleClearSingleFilter("city")}
          onOpen={() => openFilterPopover("city")}
        />
        {activePopover === "city" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: City
              </p>
              <input
                type="text"
                placeholder="Enter city"
                autoFocus
                className="w-full text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg outline-none text-gray-800 dark:text-white focus:border-brand-400"
                value={tempFilters.city}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, city: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleApplyFilter("city", tempFilters.city)
                }
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActivePopover(null)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleApplyFilter("city", tempFilters.city)
                  }
                  className="px-3 py-1 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold rounded-md transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </FilterPopover>
        )}
      </div>

      {isAnyFilterActive && (
        <button
          onClick={clearAllFilters}
          className="text-xs font-medium text-brand-500 hover:text-brand-600 transition-colors ml-1"
        >
          Clear filters
        </button>
      )}
    </>
  );

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Customers | Asipiya Leasing"
        description="Manage your customers and their details"
      />

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 mt-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Customers
        </h1>
        <button
          onClick={() => navigate(ROUTES.CREATE_CUSTOMER)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Create customer
        </button>
      </div>

      {/* ── Reusable Generic DataTable ── */}
      <DataTable<CustomerListItem>
        data={pagedCustomers}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search customers…"
        tabs={TABS}
        activeTab={filters.status}
        onTabChange={handleTabChange}
        filterBarLeft={filterBarLeft}
        onExport={handleExport}
        visibleCols={visibleCols}
        onVisibleColsChange={setVisibleCols}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* ── Modals ── */}
      {selectedCustomerId && (
        <ViewCustomerModal
          customerId={selectedCustomerId}
          onClose={() => setSelectedCustomerId(null)}
        />
      )}

      {selectedLocationCus && (
        <LocationModal
          customerId={selectedLocationCus.ID}
          initialLat={selectedLocationCus.latitude}
          initialLng={selectedLocationCus.longitude}
          onClose={() => setSelectedLocationCus(null)}
          onSuccess={fetchCustomers}
        />
      )}
    </div>
  );
}

