import { useState, useEffect, useMemo, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router";
import { EyeIcon, CloseIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import { DataTable } from "../../components/ui/table";

type PendingLeaseItem = {
  ID: number;
  customer_id: number;
  draft_code: string;
  internal_identification_name: string;
  current_progress_data: any;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
};

const STEP_LABELS = [
  "Customer details",
  "Introducers",
  "Vehicle & asset details",
  "Insurance info",
  "Product & loan configuration",
  "Guarantors",
  "PDC security",
  "Cheque configuration",
  "CR & compliance documents"
];

function getStepStatuses(parsedData: any) {
  const statuses = Array(9).fill("pristine");
  if (!parsedData) return statuses;

  // Step 1: Customer
  const step1Touched = !!parsedData.customer_db_id || !!parsedData.customer_name;
  if (step1Touched) {
    const step1Complete = !!parsedData.customer_db_id;
    statuses[0] = step1Complete ? "complete" : "error";
  }

  // Step 2: Introducers (Optional)
  const step2Touched = parsedData.introducers && parsedData.introducers.length > 0;
  if (step2Touched) {
    statuses[1] = "complete";
  }

  // Step 3: Vehicle Asset
  const step3Fields = [
    parsedData.vehicle_type_id,
    parsedData.vehicle_make_id,
    parsedData.vehicle_model_id,
    parsedData.vehicle_status,
    parsedData.engine_cc,
    parsedData.chassis_no || parsedData.chasis_no,
    parsedData.manu_year,
    parsedData.color_id,
    parsedData.usage_type,
    parsedData.manu_country,
    parsedData.reg_year,
    parsedData.reg_no,
    parsedData.supplier_id,
    parsedData.market_value,
    parsedData.forced_value,
    parsedData.invoice_value
  ];
  const step3Touched = step3Fields.some(f => !!f);
  if (step3Touched) {
    const step3Complete = step3Fields.every(f => !!f && f !== "0.00" && f !== "0");
    statuses[2] = step3Complete ? "complete" : "error";
  }

  // Step 4: Insurance
  const step4Fields = [
    parsedData.insurance_company,
    parsedData.insurance_amount,
    parsedData.insurance_premium,
    parsedData.insurance_start_date,
    parsedData.insurance_expiry_date
  ];
  const step4Touched = step4Fields.some(f => !!f);
  if (step4Touched) {
    const step4Complete = step4Fields.every(f => !!f);
    statuses[3] = step4Complete ? "complete" : "error";
  }

  // Step 5: Lease Details
  const step5Fields = [
    parsedData.product_id,
    parsedData.loan_amount,
    parsedData.interest_rate,
    parsedData.period,
    parsedData.tcc_collection_date
  ];
  const step5Touched = step5Fields.some(f => !!f);
  if (step5Touched) {
    const step5Complete = step5Fields.every(f => !!f);
    statuses[4] = step5Complete ? "complete" : "error";
  }

  // Step 6: Guarantors
  const reqGuarCount = parseInt(parsedData.required_guarantor_count || "0") || 0;
  const guarantorsCount = parsedData.guarantors ? parsedData.guarantors.length : 0;
  if (reqGuarCount > 0 || guarantorsCount > 0) {
    statuses[5] = (guarantorsCount >= reqGuarCount) ? "complete" : "error";
  }

  // Step 7: PDC Security
  const step7Touched = !!parsedData.pdc_security_type || !!parsedData.pdc_reference_details;
  if (step7Touched) {
    let step7Complete = !!parsedData.pdc_reference_details;
    if (parsedData.pdc_security_type === "Cheque") {
      step7Complete = step7Complete && !!parsedData.pdc_bank_id && !!parsedData.pdc_cheque_date && !!parsedData.pdc_cheque_no && !!parsedData.pdc_ownership;
    } else if (parsedData.pdc_security_type === "CR Book") {
      step7Complete = step7Complete && !!parsedData.pdc_book_date;
    }
    statuses[6] = step7Complete ? "complete" : "error";
  }

  // Step 8: Cheque Define
  const step8Touched = parsedData.cheques && parsedData.cheques.length > 0;
  if (step8Touched) {
    const allChequesValid = parsedData.cheques.every((chq: any) => 
      !!chq.payee_name && !!chq.nic_br_no && !!chq.instructions && 
      !!chq.bank_name && !!chq.branch_name && !!chq.account_number && 
      parseFloat(chq.payment_amount) > 0
    );
    statuses[7] = allChequesValid ? "complete" : "error";
  }

  // Step 9: CR & Docs
  const step9Fields = [
    parsedData.cr_serial_no,
    parsedData.url_cr_front,
    parsedData.url_cr_back,
    parsedData.url_invoice
  ];
  const step9Touched = step9Fields.some(f => !!f);
  if (step9Touched) {
    const step9Complete = step9Fields.every(f => !!f);
    statuses[8] = step9Complete ? "complete" : "error";
  }

  return statuses;
}

export default function PendingLeasesList() {
  const navigate = useNavigate();
  const [pendingApps, setPendingApps] = useState<PendingLeaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Active Popover State
  const [activePopover, setActivePopover] = useState<
    "code" | "nic" | "name" | null
  >(null);

  // Filters State
  const [filters, setFilters] = useState({
    code: "",
    nic: "",
    name: "",
  });

  // Temporary filter state (holds input before Apply)
  const [tempFilters, setTempFilters] = useState({
    code: "",
    nic: "",
    name: "",
  });

  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchPendingApps();
  }, [filters]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setActivePopover(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPendingApps = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/leasing-applications/pending', {
        params: {
          code: filters.code,
          nic: filters.nic,
          name: filters.name,
        },
      });
      setPendingApps(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch pending applications", err);
    } finally {
      setLoading(false);
    }
  };

  const openFilterPopover = (
    type: "code" | "nic" | "name"
  ) => {
    setTempFilters({
      code: filters.code,
      nic: filters.nic,
      name: filters.name,
    });
    setActivePopover(type);
  };

  const handleApplyFilter = (
    key: "code" | "nic" | "name",
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setActivePopover(null);
  };

  const handleClearSingleFilter = (
    key: "code" | "nic" | "name"
  ) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setTempFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const clearAllFilters = () => {
    setFilters({ code: "", nic: "", name: "" });
    setTempFilters({ code: "", nic: "", name: "" });
    setActivePopover(null);
  };

  const isAnyFilterActive =
    filters.code || filters.nic || filters.name;

  // Client-side search filter (runs on top of API-filtered data)
  const searchLower = searchQuery.trim().toLowerCase();
  const searchFiltered = searchLower
    ? pendingApps.filter((app) => {
        let parsedData: any = {};
        try {
          parsedData = typeof app.current_progress_data === "string" 
            ? JSON.parse(app.current_progress_data) 
            : app.current_progress_data;
        } catch (e) {}
        return (
          app.draft_code?.toLowerCase().includes(searchLower) ||
          app.internal_identification_name?.toLowerCase().includes(searchLower) ||
          parsedData?.customer_name?.toLowerCase().includes(searchLower) ||
          parsedData?.customer_code?.toLowerCase().includes(searchLower)
        );
      })
    : pendingApps;

  // Pagination derived values
  const totalItems = searchFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const pagedPendingApps = searchFiltered.slice(pageStart, pageEnd);

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
      render: (_: any, idx: number) => <span className="text-gray-400 font-semibold">{pageStart + idx + 1}</span>,
    },
    {
      key: "identity",
      label: "Application Identity",
      toggleable: false,
      render: (app: PendingLeaseItem) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs border border-amber-100 dark:border-amber-500/20 shrink-0">
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.25 bg-amber-500/10 text-amber-500 text-[9px] font-black rounded uppercase tracking-wider">
                  {app.draft_code || `LSE-PENDING-${app.ID}`}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                {app.internal_identification_name || "Unnamed Application"}
              </h4>
            </div>
          </div>
        );
      }
    },
    {
      key: "customer",
      label: "Customer Details",
      toggleable: true,
      render: (app: PendingLeaseItem) => {
        let parsedData: any = {};
        try {
          parsedData = typeof app.current_progress_data === "string" 
            ? JSON.parse(app.current_progress_data) 
            : app.current_progress_data;
        } catch (e) {}
        return (
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {parsedData?.customer_name || "Unknown Customer"}
            </div>
            <div className="text-gray-500 text-[10px]">
              Code: {parsedData?.customer_code || "-"}
            </div>
          </div>
        );
      }
    },
    {
      key: "progress",
      label: "Application Progress",
      toggleable: true,
      render: (app: PendingLeaseItem) => {
        let parsedData: any = {};
        try {
          parsedData = typeof app.current_progress_data === "string" 
            ? JSON.parse(app.current_progress_data) 
            : app.current_progress_data;
        } catch (e) {}
        const statuses = getStepStatuses(parsedData);
        const completedCount = statuses.filter(s => s === "complete").length;
        return (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {completedCount} / 9
            </span>
            <div className="flex items-center gap-0.5">
              {statuses.map((status, i) => {
                let bgClass = "bg-gray-150 dark:bg-gray-800 border-gray-200 dark:border-gray-750 text-gray-400";
                if (status === "complete") {
                  bgClass = "bg-emerald-500 border-emerald-600 text-white";
                } else if (status === "error") {
                  bgClass = "bg-orange-500 border-orange-600 text-white";
                }
                
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-black border select-none transition-transform hover:scale-110 cursor-help ${bgClass}`}
                    title={`Step ${i + 1}: ${STEP_LABELS[i]} (${status === "complete" ? "Complete" : status === "error" ? "Incomplete / Error" : "Pristine"})`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    },
    {
      key: "updated_at",
      label: "Submitted At",
      toggleable: true,
      render: (app: PendingLeaseItem) => {
        return (
          <div className="text-xs text-gray-500">
            {new Date(app.UpdatedAt).toLocaleDateString()} {new Date(app.UpdatedAt).toLocaleTimeString()}
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (app: PendingLeaseItem) => (
        <div className="flex justify-end">
          <button 
            onClick={() => navigate(`${ROUTES.CREATE_LEASE}?draftId=${app.ID}`)}
            className="p-1 px-2.5 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-500 dark:bg-gray-900 dark:hover:bg-amber-500/10 rounded-lg transition-all border border-gray-100 dark:border-gray-700 flex items-center gap-1.5"
            title="Review Application"
          >
            <EyeIcon className="w-3.5 h-3.5 fill-current" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Review</span>
          </button>
        </div>
      ),
    },
  ], [pageStart, pageSize]);

  const filterBarLeft = (
    <>
      {/* Draft Code / Application Code */}
      <div className="relative">
        <FilterPill
          label="Draft Code"
          activeValue={filters.code}
          onClear={() => handleClearSingleFilter("code")}
          onOpen={() => openFilterPopover("code")}
        />
        {activePopover === "code" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: Draft Code
              </p>
              <input
                type="text"
                placeholder="Enter draft code"
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

      {/* Customer NIC */}
      <div className="relative">
        <FilterPill
          label="Customer NIC"
          activeValue={filters.nic}
          onClear={() => handleClearSingleFilter("nic")}
          onOpen={() => openFilterPopover("nic")}
        />
        {activePopover === "nic" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: Customer NIC
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

      {/* Application Name */}
      <div className="relative">
        <FilterPill
          label="Application Name"
          activeValue={filters.name}
          onClear={() => handleClearSingleFilter("name")}
          onOpen={() => openFilterPopover("name")}
        />
        {activePopover === "name" && (
          <FilterPopover>
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                Filter by: Application Name
              </p>
              <input
                type="text"
                placeholder="Enter application name"
                autoFocus
                className="w-full text-sm px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg outline-none text-gray-800 dark:text-white focus:border-brand-400"
                value={tempFilters.name}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, name: e.target.value })
                }
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  handleApplyFilter("name", tempFilters.name)
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
                    handleApplyFilter("name", tempFilters.name)
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
        title="Pending Leasing Applications | Asipiya Leasing"
        description="View and approve pending leasing applications"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Leasing Approval Queue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Applications awaiting review and approval</p>
        </div>
      </div>

      <DataTable<PendingLeaseItem>
        data={pagedPendingApps}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search applications…"
        filterBarLeft={filterBarLeft}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
}
