import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  EyeIcon,
  CloseLineIcon,
  CalenderIcon,
  UserIcon,
  BuildingIcon,
  InfoIcon,
} from "../../icons";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { useAuth } from "../../context/AuthContext";

type LeaseListItem = {
  id: number;
  loanNo: string;
  status: string;
  loanAmount: number;
  totalBalance: number;
  totalLoanBalance: number;
  totalPaidAmount: number;
  arrearsAmount: number;
  interestRate: number;
  product: string;
  customerId: number;
  customerName: string;
  customerCode: string;
  customerNic: string;
  customerContact: string;
  branchId: number;
  internalName: string;
  disbursedAt: string | null;
  createdAt: string;
};

type InstallmentItem = {
  id: number;
  no: number;
  type: string;
  due_date: string;
  collection_date: string;
  penalty_date: string | null;
  capital_amount: number;
  interest_amount: number;
  installment_amount: number;
  penalty_amount: number;
  additional_charges_amount: number;
  total_amount: number;
  paid_total: number;
  capital_balance: number;
  interest_balance: number;
  penalty_balance: number;
  additional_charge_balance: number;
  total_balance: number;
  status: string;
};

const formatCurrency = (val: number) =>
  val
    ? val.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

export default function LeasesList() {
  const { user, isHeadOffice } = useAuth();
  const [items, setItems] = useState<LeaseListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [filters, setFilters] = useState({
    status: "all",
    branchId: "all",
  });

  const [branches, setBranches] = useState<any[]>([]);

  // Detail drawer
  const [selectedItem, setSelectedItem] = useState<LeaseListItem | null>(null);
  const [detailedApp, setDetailedApp] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchItems();
  }, [filters]);

  useEffect(() => {
    if (isHeadOffice) {
      fetchBranches();
    }
  }, [isHeadOffice]);

  useEffect(() => {
    if (selectedItem) {
      fetchDetails(selectedItem.id);
    } else {
      setDetailedApp(null);
    }
  }, [selectedItem]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/leasing-applications", {
        params: {
          status: filters.status !== "all" ? filters.status : undefined,
          branch_id: filters.branchId !== "all" ? filters.branchId : undefined,
        },
      });
      const raw = res.data?.data ?? res.data;
      setItems(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch leases list", err);
      setToast({ type: "error", message: "Failed to load leases list." });
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const res = await apiClient.get("/lookups/branches");
      const raw = res.data?.data ?? res.data;
      setBranches(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch branches", err);
    }
  };

  const fetchDetails = async (id: number) => {
    setLoadingDetails(true);
    try {
      const res = await apiClient.get(`/leasing-applications/${id}`);
      setDetailedApp(res.data?.data || res.data);
    } catch (err) {
      console.error("Failed to fetch lease details", err);
      setToast({ type: "error", message: "Failed to load detailed lease information." });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // Client-side search
  const searchLower = searchQuery.trim().toLowerCase();
  const searchFiltered = searchLower
    ? items.filter((item) =>
        item.loanNo.toLowerCase().includes(searchLower) ||
        item.customerName.toLowerCase().includes(searchLower) ||
        item.customerCode.toLowerCase().includes(searchLower) ||
        item.customerNic.toLowerCase().includes(searchLower) ||
        item.product.toLowerCase().includes(searchLower) ||
        item.internalName.toLowerCase().includes(searchLower)
      )
    : items;

  // Pagination
  const totalItems = searchFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const pagedItems = searchFiltered.slice(pageStart, pageEnd);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };
  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const statusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
    }
    if (s === "arrears") {
      return "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
    }
    if (s === "settled") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
    }
    if (s === "write-off" || s === "write_off") {
      return "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20";
    }
    if (s === "pending") {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
    }
    if (s === "pending-disburse" || s === "pending_disburse") {
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
    }
    return "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700";
  };

  const columns = useMemo(
    () => [
      {
        key: "idx",
        label: "#",
        toggleable: false,
        render: (_: any, idx: number) => (
          <span className="text-gray-400 font-semibold">{pageStart + idx + 1}</span>
        ),
      },
      {
        key: "loanNo",
        label: "Lease No.",
        toggleable: false,
        render: (item: LeaseListItem) => (
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-[10px] border border-emerald-100 dark:border-emerald-500/20 shrink-0">
              L
            </div>
            <div>
              <span className="font-bold text-gray-900 dark:text-white text-xs block">
                {item.loanNo}
              </span>
              <span className="text-[10px] text-gray-400">{item.internalName || "—"}</span>
            </div>
          </div>
        ),
      },
      {
        key: "customer",
        label: "Customer",
        toggleable: false,
        render: (item: LeaseListItem) => (
          <div>
            <span className="font-semibold text-gray-800 dark:text-gray-200 block text-xs">
              {item.customerName || "—"}
            </span>
            <span className="text-[10px] text-gray-400">
              {item.customerCode} · {item.customerNic || "—"}
            </span>
          </div>
        ),
      },
      {
        key: "product",
        label: "Product",
        toggleable: true,
        render: (item: LeaseListItem) => (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {item.product}
          </span>
        ),
      },
      {
        key: "loanAmount",
        label: "Lease Amount",
        toggleable: true,
        render: (item: LeaseListItem) => (
          <div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              LKR {formatCurrency(item.loanAmount)}
            </span>
            <span className="text-[10px] text-gray-400">
              Int: {item.interestRate}%
            </span>
          </div>
        ),
      },
      {
        key: "balances",
        label: "Outstanding / Paid",
        toggleable: true,
        render: (item: LeaseListItem) => (
          <div>
            <span className="text-xs font-bold text-red-600 dark:text-red-400 block">
              LKR {formatCurrency(item.totalBalance)}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Paid: LKR {formatCurrency(item.totalPaidAmount)}
            </span>
          </div>
        ),
      },
      {
        key: "arrears",
        label: "Arrears",
        toggleable: true,
        render: (item: LeaseListItem) => (
          <span className={`text-xs font-bold ${item.arrearsAmount > 0 ? "text-red-600 dark:text-red-500 animate-pulse" : "text-gray-500"}`}>
            LKR {formatCurrency(item.arrearsAmount)}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        toggleable: true,
        render: (item: LeaseListItem) => (
          <span
            className={`px-2.5 py-1 text-[10px] font-bold border rounded-full tracking-wide inline-block uppercase ${statusBadge(
              item.status
            )}`}
          >
            {item.status}
          </span>
        ),
      },
      {
        key: "disbursedAt",
        label: "Disbursed At",
        toggleable: true,
        render: (item: LeaseListItem) => {
          if (!item.disbursedAt) return <span className="text-gray-400">—</span>;
          const d = new Date(item.disbursedAt);
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
                {d.toLocaleDateString()}
              </span>
              <span className="text-[10px] text-gray-400">
                {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        },
      },
      {
        key: "actions",
        label: "",
        toggleable: false,
        render: (item: LeaseListItem) => (
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedItem(item)}
              className="p-1 px-2.5 bg-gray-55 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 dark:bg-gray-900 dark:hover:bg-emerald-500/10 border border-gray-150 dark:border-gray-800 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              title="View Details"
            >
              <EyeIcon className="w-3.5 h-3.5 fill-current" />
              View
            </button>
          </div>
        ),
      },
    ],
    [pageStart, pageSize]
  );

  const filterBarLeft = (
    <div className="flex items-center gap-3">
      {/* Branch Filter (Head office / SA only) */}
      {isHeadOffice && (
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <BuildingIcon className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filters.branchId}
            onChange={(e) => {
              setFilters({ ...filters, branchId: e.target.value });
              setCurrentPage(1);
            }}
            className="bg-transparent text-xs font-semibold text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer p-0.5 border-none"
          >
            <option value="all">All Branches</option>
            {branches.map((b) => (
              <option key={b.idBranch} value={b.idBranch}>
                {b.Name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <InfoIcon className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setCurrentPage(1);
          }}
          className="bg-transparent text-xs font-semibold text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer p-0.5 border-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending Approval</option>
          <option value="pending-disburse">Pending Disbursement</option>
          <option value="active">Active</option>
          <option value="arrears">Arrears</option>
          <option value="settled">Settled</option>
          <option value="write-off">Write-Off</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Leases List | Asipiya Leasing"
        description="View all leases except drafts"
      />

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-fade-in ${
            toast.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-250"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-250"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Leases List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage all non-draft leasing applications, approvals, disbursements and repayments
          </p>
        </div>
      </div>

      <DataTable<LeaseListItem>
        data={pagedItems}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by lease no., customer, NIC…"
        filterBarLeft={filterBarLeft}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Detail Slide-over Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setSelectedItem(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />

          {/* Drawer */}
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 h-screen shadow-2xl flex flex-col z-10 animate-slide-in border-l border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest block mb-0.5">
                  Lease Information
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedItem.loanNo}
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <CloseLineIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {loadingDetails ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4">
                  <svg className="w-8 h-8 text-emerald-600 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <p className="text-xs text-gray-500">Loading details and repayment schedule…</p>
                </div>
              ) : (
                <>
                  {/* Status strip */}
                  <div className="flex gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-1 text-[10px] font-bold border rounded-full tracking-wide uppercase ${statusBadge(
                        selectedItem.status
                      )}`}
                    >
                      {selectedItem.status}
                    </span>
                  </div>

                  {/* General Info Card */}
                  <div className="p-4 bg-gray-55 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3.5">
                    <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold leading-relaxed">
                      {selectedItem.internalName || selectedItem.loanNo}
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-750/50 text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <UserIcon className="w-3.5 h-3.5" />
                        <span>
                          Customer: <strong>{selectedItem.customerName || "—"}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <CalenderIcon className="w-3.5 h-3.5" />
                        <span>
                          Disbursed: <strong>{selectedItem.disbursedAt ? new Date(selectedItem.disbursedAt).toLocaleDateString() : "—"}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Layout for Customer & Financial Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Information */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Customer Information
                      </h4>
                      <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-2.5 bg-white dark:bg-gray-900 shadow-sm">
                        {[
                          { label: "Name", value: selectedItem.customerName },
                          { label: "Customer Code", value: selectedItem.customerCode },
                          { label: "NIC", value: selectedItem.customerNic || "—" },
                          { label: "Mobile", value: selectedItem.customerContact || "—" },
                        ].map(({ label, value }) => (
                          <div
                            key={label}
                            className="flex justify-between items-center border-t first:border-t-0 border-gray-100 dark:border-gray-800 pt-2 first:pt-0"
                          >
                            <span className="text-[11px] font-medium text-gray-400">{label}</span>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Details */}
                    <div className="space-y-2">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Financial Details
                      </h4>
                      <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-2.5 bg-white dark:bg-gray-900 shadow-sm">
                        {[
                          { label: "Product", value: selectedItem.product },
                          { label: "Interest Rate", value: `${selectedItem.interestRate}%` },
                          { label: "Lease Amount", value: `LKR ${formatCurrency(selectedItem.loanAmount)}` },
                          { label: "Paid Amount", value: `LKR ${formatCurrency(selectedItem.totalPaidAmount)}`, textClass: "text-emerald-600 dark:text-emerald-400" },
                          { label: "Total Outstanding", value: `LKR ${formatCurrency(selectedItem.totalBalance)}`, textClass: "text-red-600 dark:text-red-400" },
                          { label: "Arrears", value: `LKR ${formatCurrency(selectedItem.arrearsAmount)}`, textClass: selectedItem.arrearsAmount > 0 ? "text-red-655 font-extrabold animate-pulse" : "" },
                        ].map(({ label, value, textClass }) => (
                          <div
                            key={label}
                            className="flex justify-between items-center border-t first:border-t-0 border-gray-100 dark:border-gray-800 pt-2 first:pt-0"
                          >
                            <span className="text-[11px] font-medium text-gray-400">{label}</span>
                            <span className={`text-xs font-bold ${textClass || "text-gray-800 dark:text-gray-200"}`}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Repayment Schedule Section */}
                  {detailedApp?.installments && detailedApp.installments.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                        Repayment Schedule
                      </h4>
                      <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
                        <div className="overflow-x-auto">
                           <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-gray-50 dark:bg-gray-850 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-150 dark:border-gray-800">
                                <th className="py-2.5 px-3">No</th>
                                <th className="py-2.5 px-3">Due Date</th>
                                <th className="py-2.5 px-3 text-right">Amount</th>
                                <th className="py-2.5 px-3 text-right">Paid</th>
                                <th className="py-2.5 px-3 text-right">Balance</th>
                                <th className="py-2.5 px-3 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                              {detailedApp.installments.map((inst: InstallmentItem) => (
                                <tr key={inst.id} className="text-xs hover:bg-gray-55/50 dark:hover:bg-gray-850/50">
                                  <td className="py-2 px-3 font-semibold text-gray-500">{inst.no}</td>
                                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                                    {inst.due_date ? new Date(inst.due_date).toLocaleDateString() : "—"}
                                  </td>
                                  <td className="py-2 px-3 text-right font-medium text-gray-800 dark:text-gray-200">
                                    {formatCurrency(inst.total_amount)}
                                  </td>
                                  <td className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                                    {formatCurrency(inst.paid_total)}
                                  </td>
                                  <td className="py-2 px-3 text-right text-gray-800 dark:text-gray-200 font-bold">
                                    {formatCurrency(inst.total_balance)}
                                  </td>
                                  <td className="py-2 px-3 text-center">
                                    <span
                                      className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide border ${
                                        inst.status === "paid"
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                                          : inst.status === "partial"
                                          ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                                          : "bg-gray-100 border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-750 dark:text-gray-400"
                                      }`}
                                    >
                                      {inst.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
