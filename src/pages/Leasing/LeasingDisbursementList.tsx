import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import {
  EyeIcon,
  CloseLineIcon,
  InfoIcon,
  CalenderIcon,
  UserIcon,
  BuildingIcon,
} from "../../icons";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { useAuth } from "../../context/AuthContext";

type DisbursementItem = {
  id: number;
  loanNo: string;
  status: string;
  loanAmount: number;
  disburseAmount: number;
  additionalCharges: number;
  interestRate: number;
  product: string;
  issueType: string;
  customerId: number;
  customerName: string;
  customerCode: string;
  customerNic: string;
  customerContact: string;
  branchId: number;
  internalName: string;
  submittedAt: string;
};

const formatCurrency = (val: number) =>
  val
    ? val.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : "0.00";

export default function LeasingDisbursementList() {
  const { user, isHeadOffice } = useAuth();
  const [items, setItems] = useState<DisbursementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [filters, setFilters] = useState({
    issueType: "all",
    status: "all",
  });

  // Detail drawer
  const [selectedItem, setSelectedItem] = useState<DisbursementItem | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Disburse confirmation
  const [confirmItem, setConfirmItem] = useState<DisbursementItem | null>(null);
  const [disbursing, setDisbursing] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/leasing-applications/disbursement-queue", {
        params: {
          issue_type: filters.issueType !== "all" ? filters.issueType : undefined,
          status: filters.status !== "all" ? filters.status : undefined,
        },
      });
      const raw = res.data?.data ?? res.data;
      setItems(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch disbursement queue", err);
      setToast({ type: "error", message: "Failed to load disbursement queue." });
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async () => {
    if (!confirmItem) return;
    setDisbursing(true);
    try {
      await apiClient.post(`/leasing-applications/${confirmItem.id}/disburse`);
      setToast({
        type: "success",
        message: `Loan ${confirmItem.loanNo} disbursed successfully. Installment schedule generated.`,
      });
      setConfirmItem(null);
      setSelectedItem(null);
      fetchItems(); // refresh table — loan moves out of pending-disburse
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Failed to disburse loan. Please try again.";
      setToast({ type: "error", message: errMsg });
    } finally {
      setDisbursing(false);
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

  const issueTypeBadge = (type: string) => {
    if (type === "Bank Transfer") {
      return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
    }
    return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  };

  const statusBadge = (status: string) => {
    if (status === "pending-disburse") {
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
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
        label: "Loan No.",
        toggleable: false,
        render: (item: DisbursementItem) => (
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-[10px] border border-amber-100 dark:border-amber-500/20 shrink-0">
              D
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
        render: (item: DisbursementItem) => (
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
        render: (item: DisbursementItem) => (
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {item.product}
          </span>
        ),
      },
      {
        key: "amounts",
        label: "Loan / Disburse Amount",
        toggleable: true,
        render: (item: DisbursementItem) => (
          <div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              LKR {formatCurrency(item.loanAmount)}
            </span>
            <span className="text-[10px] text-gray-400">
              Disburse: LKR {formatCurrency(item.disburseAmount)}
            </span>
          </div>
        ),
      },
      {
        key: "issueType",
        label: "Issue Type",
        toggleable: true,
        render: (item: DisbursementItem) => (
          <span
            className={`px-2.5 py-1 text-[10px] font-bold border rounded-full tracking-wide inline-block uppercase ${issueTypeBadge(
              item.issueType
            )}`}
          >
            {item.issueType}
          </span>
        ),
      },
      {
        key: "status",
        label: "Status",
        toggleable: true,
        render: (item: DisbursementItem) => (
          <span
            className={`px-2.5 py-1 text-[10px] font-bold border rounded-full tracking-wide inline-block uppercase ${statusBadge(
              item.status
            )}`}
          >
            {item.status === "pending-disburse" ? "Pending Disburse" : item.status}
          </span>
        ),
      },
      {
        key: "submittedAt",
        label: "Updated At",
        toggleable: true,
        render: (item: DisbursementItem) => {
          if (!item.submittedAt) return <span className="text-gray-400">—</span>;
          const d = new Date(item.submittedAt);
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
        render: (item: DisbursementItem) => (
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedItem(item)}
              className="p-1 px-2.5 bg-gray-50 hover:bg-amber-50 text-gray-500 hover:text-amber-600 dark:bg-gray-900 dark:hover:bg-amber-500/10 border border-gray-150 dark:border-gray-800 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              title="Disburse"
            >
              <EyeIcon className="w-3.5 h-3.5 fill-current" />
              Disburse
            </button>
          </div>
        ),
      },
    ],
    [pageStart, pageSize]
  );

  const filterBarLeft = (
    <div className="flex items-center gap-3">
      {/* Issue Type Filter */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <InfoIcon className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={filters.issueType}
          onChange={(e) => {
            setFilters({ ...filters, issueType: e.target.value });
            setCurrentPage(1);
          }}
          className="bg-transparent text-xs font-semibold text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer p-0.5 border-none"
        >
          <option value="all">All Issue Types</option>
          <option value="cash">Cash</option>
          <option value="bank">Bank Transfer</option>
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <BuildingIcon className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={filters.status}
          onChange={(e) => {
            setFilters({ ...filters, status: e.target.value });
            setCurrentPage(1);
          }}
          className="bg-transparent text-xs font-semibold text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer p-0.5 border-none"
        >
          <option value="all">All Statuses</option>
          <option value="pending-disburse">Pending Disburse</option>
          <option value="pending">Pending</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Leasing Disbursement Queue | Asipiya Leasing"
        description="View leasing applications ready for disbursement"
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
            Leasing Disbursement Queue
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Approved leasing applications awaiting fund disbursement
          </p>
        </div>
      </div>

      <DataTable<DisbursementItem>
        data={pagedItems}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search by loan no., customer, NIC…"
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
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-screen shadow-2xl flex flex-col z-10 animate-slide-in border-l border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-0.5">
                  Disbursement Details
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
              {/* Status + Type strip */}
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold border rounded-full tracking-wide uppercase ${statusBadge(
                    selectedItem.status
                  )}`}
                >
                  {selectedItem.status === "pending-disburse" ? "Pending Disburse" : selectedItem.status}
                </span>
                <span
                  className={`px-2.5 py-1 text-[10px] font-bold border rounded-full tracking-wide uppercase ${issueTypeBadge(
                    selectedItem.issueType
                  )}`}
                >
                  {selectedItem.issueType}
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
                      {selectedItem.submittedAt
                        ? new Date(selectedItem.submittedAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Customer Information
                </h4>
                <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-2.5 bg-white dark:bg-gray-900 shadow-sm">
                  {[
                    { label: "Name", value: selectedItem.customerName },
                    { label: "Customer Code", value: selectedItem.customerCode, accent: true },
                    { label: "NIC", value: selectedItem.customerNic || "—" },
                    { label: "Mobile", value: selectedItem.customerContact || "—" },
                  ].map(({ label, value, accent }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center border-t first:border-t-0 border-gray-100 dark:border-gray-800 pt-2 first:pt-0"
                    >
                      <span className="text-[11px] font-medium text-gray-400">{label}</span>
                      <span
                        className={`text-xs font-bold ${
                          accent
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Loan / Financial Details */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Financial Details
                </h4>
                <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-2.5 bg-white dark:bg-gray-900 shadow-sm">
                  {[
                    { label: "Product", value: selectedItem.product },
                    { label: "Interest Rate", value: `${selectedItem.interestRate}%` },
                    { label: "Loan Amount", value: `LKR ${formatCurrency(selectedItem.loanAmount)}` },
                    { label: "Additional Charges", value: `LKR ${formatCurrency(selectedItem.additionalCharges)}` },
                    { label: "Disbursement Amount", value: `LKR ${formatCurrency(selectedItem.disburseAmount)}`, highlight: true },
                    { label: "Issue Type", value: selectedItem.issueType },
                  ].map(({ label, value, highlight }) => (
                    <div
                      key={label}
                      className="flex justify-between items-center border-t first:border-t-0 border-gray-100 dark:border-gray-800 pt-2 first:pt-0"
                    >
                      <span className="text-[11px] font-medium text-gray-400">{label}</span>
                      <span
                        className={`text-xs font-bold ${
                          highlight
                            ? "text-emerald-600 dark:text-emerald-400 text-sm"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer — Disburse action */}
            {selectedItem.status === "pending-disburse" && (
              <div className="p-4 border-t border-gray-150 dark:border-gray-800 bg-white dark:bg-gray-900">
                <button
                  onClick={() => setConfirmItem(selectedItem)}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Disburse Loan
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => !disbursing && setConfirmItem(null)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 w-full max-w-md z-10 overflow-hidden">
            {/* Accent header */}
            <div className="bg-emerald-600 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Confirm Disbursement</h3>
                  <p className="text-[11px] text-emerald-100">{confirmItem.loanNo}</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4">
              {/* Summary rows */}
              <div className="space-y-2.5 bg-gray-50 dark:bg-gray-850 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                {[
                  { label: "Customer", value: confirmItem.customerName },
                  { label: "Product", value: confirmItem.product },
                  { label: "Loan Amount", value: `LKR ${formatCurrency(confirmItem.loanAmount)}` },
                  {
                    label: "Disbursement Charges",
                    value: confirmItem.additionalCharges > 0
                      ? `LKR ${formatCurrency(confirmItem.additionalCharges)} (deducted)`
                      : "None",
                  },
                  {
                    label: "Net Disburse Amount",
                    value: `LKR ${formatCurrency(confirmItem.disburseAmount)}`,
                    highlight: true,
                  },
                  { label: "Issue Type", value: confirmItem.issueType },
                ].map(({ label, value, highlight }) => (
                  <div key={label} className="flex justify-between items-center text-[11px] border-t first:border-t-0 border-gray-200 dark:border-gray-750 pt-2 first:pt-0">
                    <span className="text-gray-400 font-medium">{label}</span>
                    <span className={`font-bold ${
                      highlight ? "text-emerald-600 dark:text-emerald-400 text-sm" : "text-gray-800 dark:text-gray-200"
                    }`}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
                <svg className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                  This action is <strong>irreversible</strong>. The loan will be activated and a full installment schedule will be generated from today's disbursement date.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setConfirmItem(null)}
                  disabled={disbursing}
                  className="flex-1 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 rounded-xl transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisburse}
                  disabled={disbursing}
                  className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {disbursing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Disbursing…
                    </>
                  ) : (
                    "Confirm Disburse"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
