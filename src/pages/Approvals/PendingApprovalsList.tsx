import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { EyeIcon, CloseIcon, CheckCircleIcon, CloseLineIcon, InfoIcon, CalenderIcon, UserIcon, BuildingIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { useAuth } from "../../context/AuthContext";

type ApprovalRequestItem = {
  idapproval_request?: number;
  id?: number;
  approvalName: string;
  userName: string;
  dateTime: string;
  branchName: string;
  branchId?: number;
  description: string;
  canApprove: boolean;
  actionable_approval_id: number | null;
  totalApprovals?: number;
  approvedCount?: number;
  status: number;
  approvals?: any[];
  data?: any;
};

export default function PendingApprovalsList() {
  const { user, isHeadOffice } = useAuth();
  const [approvals, setApprovals] = useState<ApprovalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters State
  const [filters, setFilters] = useState({
    branchId: "all",
    approvalName: "all",
  });

  // Selected item for detail drawer
  const [selectedItem, setSelectedItem] = useState<ApprovalRequestItem | null>(null);
  const [comment, setComment] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchApprovals();
  }, [filters]);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/universal-approval/pending", {
        params: {
          branch_id: filters.branchId,
          approval_name: filters.approvalName,
        },
      });
      const raw = res.data?.data ?? res.data;
      setApprovals(Array.isArray(raw) ? raw : []);
    } catch (err) {
      console.error("Failed to fetch pending approvals", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (responseType: "approved" | "rejected") => {
    if (!selectedItem || !selectedItem.actionable_approval_id) return;
    setSubmittingAction(true);
    try {
      await apiClient.post("/universal-approval/action", {
        approvalId: selectedItem.actionable_approval_id,
        responseType,
        comment,
      });
      setToast({
        type: "success",
        message: `Approval request was successfully ${responseType}.`,
      });
      setComment("");
      setSelectedItem(null);
      fetchApprovals();
    } catch (err: any) {
      console.error("Failed to submit approval action", err);
      setToast({
        type: "error",
        message: err.response?.data?.error || err.message || "Failed to process approval action.",
      });
    } finally {
      setSubmittingAction(false);
    }
  };

  // Close toast automatically
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Client-side search filtering
  const searchLower = searchQuery.trim().toLowerCase();
  const searchFiltered = searchLower
    ? approvals.filter((item) => {
        const customerName = item.data?.customer_details?.name || "";
        const customerCode = item.data?.customer_details?.customer_no || "";
        return (
          item.approvalName.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.userName.toLowerCase().includes(searchLower) ||
          item.branchName.toLowerCase().includes(searchLower) ||
          customerName.toLowerCase().includes(searchLower) ||
          customerCode.toLowerCase().includes(searchLower)
        );
      })
    : approvals;

  // Pagination derived values
  const totalItems = searchFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);
  const pagedApprovals = searchFiltered.slice(pageStart, pageEnd);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Static options for approval name
  const approvalTypes = [
    { label: "All Types", value: "all" },
    { label: "Loan Approval", value: "LOAN APPROVAL" },
    { label: "Customer Blacklist", value: "CUSTOMER BLACKLIST" },
    { label: "Loan Reschedule", value: "LOAN RE-SCHEDULE" },
    { label: "Due Skip", value: "LOAN DUE SKIP" },
    { label: "Payment Reversal", value: "PAYMENT_UNDO" },
    { label: "Customer Creation", value: "CUSTOMER CREATION" },
  ];

  const columns = useMemo(() => [
    {
      key: "idx",
      label: "#",
      toggleable: false,
      render: (_: any, idx: number) => (
        <span className="text-gray-400 font-semibold">{pageStart + idx + 1}</span>
      ),
    },
    {
      key: "dateTime",
      label: "Submitted At",
      toggleable: false,
      render: (item: ApprovalRequestItem) => {
        if (!item.dateTime) return "—";
        const date = new Date(item.dateTime);
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {date.toLocaleDateString()}
            </span>
            <span className="text-gray-400 text-[10px]">
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        );
      },
    },
    {
      key: "approvalName",
      label: "Approval Type",
      toggleable: false,
      render: (item: ApprovalRequestItem) => {
        let badgeColor = "bg-gray-100 text-gray-800 dark:bg-gray-850 dark:text-gray-350 border-gray-200 dark:border-gray-800";
        const type = item.approvalName.toUpperCase();
        if (type.includes("LOAN APPROVAL")) {
          badgeColor = "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
        } else if (type.includes("BLACKLIST")) {
          badgeColor = "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20";
        } else if (type.includes("RESCHEDULE")) {
          badgeColor = "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20";
        } else if (type.includes("DUE SKIP")) {
          badgeColor = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
        } else if (type.includes("CUSTOMER")) {
          badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
        } else if (type.includes("PAYMENT") || type.includes("UNDO")) {
          badgeColor = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
        }

        return (
          <span className={`px-2.5 py-1 text-[11px] font-bold border rounded-full tracking-wide inline-block uppercase ${badgeColor}`}>
            {item.approvalName}
          </span>
        );
      },
    },
    {
      key: "requestedBy",
      label: "Requested By",
      toggleable: true,
      render: (item: ApprovalRequestItem) => (
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {item.userName || "System"}
        </span>
      ),
    },
    {
      key: "branch",
      label: "Branch / Location",
      toggleable: true,
      render: (item: ApprovalRequestItem) => (
        <span className="font-semibold text-gray-650 dark:text-gray-350">
          {item.branchName || "—"}
        </span>
      ),
    },
    {
      key: "description",
      label: "Description",
      toggleable: true,
      render: (item: ApprovalRequestItem) => {
        const customer = item.data?.customer_details;
        return (
          <div className="max-w-xs overflow-hidden text-ellipsis">
            <p className="font-semibold text-gray-800 dark:text-gray-200 text-xs">
              {item.description}
            </p>
            {customer && (
              <span className="text-[10px] text-gray-400 font-bold block mt-0.5">
                Cust: {customer.name} ({customer.customer_no})
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "progress",
      label: "Progress",
      toggleable: true,
      render: (item: ApprovalRequestItem) => {
        let total = item.totalApprovals || 0;
        let approved = item.approvedCount || 0;

        if (total === 0 && item.approvals && item.approvals.length > 0) {
          total = item.approvals.length;
          approved = item.approvals.filter((a: any) => String(a.status) === "1").length;
        }

        const percent = total > 0 ? (approved / total) * 100 : 0;
        const color = percent === 100 ? "bg-emerald-500" : "bg-brand-500";

        return (
          <div className="flex items-center gap-2" style={{ minWidth: "120px" }}>
            <div className="progress flex-grow w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
            </div>
            <span className="text-[10px] font-bold text-gray-500 whitespace-nowrap">
              {approved}/{total} ({Math.round(percent)}%)
            </span>
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (item: ApprovalRequestItem) => (
        <div className="flex justify-end gap-1.5">
          {item.canApprove ? (
            <button
              onClick={() => setSelectedItem(item)}
              className="p-1 px-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition-all flex items-center gap-1 text-[10px] font-black uppercase tracking-wider shadow-sm"
              title="Action Required"
            >
              <CheckCircleIcon className="w-3.5 h-3.5 fill-current" />
              Act
            </button>
          ) : (
            <button
              onClick={() => setSelectedItem(item)}
              className="p-1 px-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 dark:bg-gray-900 dark:hover:bg-gray-800 border border-gray-150 dark:border-gray-800 rounded-lg transition-all flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
              title="View Details"
            >
              <EyeIcon className="w-3.5 h-3.5 fill-current" />
              View
            </button>
          )}
        </div>
      ),
    },
  ], [pageStart, pageSize]);

  const filterBarLeft = (
    <div className="flex items-center gap-3">
      {/* Branch Selector */}
      {isHeadOffice && user?.branches && (
        <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          <BuildingIcon className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={filters.branchId}
            onChange={(e) => setFilters({ ...filters, branchId: e.target.value })}
            className="bg-transparent text-xs font-semibold text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer p-0.5 border-none"
          >
            <option value="all">All Branches</option>
            {user.branches.map((b) => (
              <option key={b.idBranch} value={b.idBranch}>
                {b.Name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Approval Type Selector */}
      <div className="flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <InfoIcon className="w-3.5 h-3.5 text-gray-400" />
        <select
          value={filters.approvalName}
          onChange={(e) => setFilters({ ...filters, approvalName: e.target.value })}
          className="bg-transparent text-xs font-semibold text-gray-600 dark:text-gray-350 focus:outline-none cursor-pointer p-0.5 border-none"
        >
          {approvalTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Pending Approvals | Asipiya Leasing"
        description="Review and act on pending workflow approvals"
      />

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm font-semibold flex items-center gap-2 animate-fade-in ${
          toast.type === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-250"
            : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-250"
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Workflow Approvals Queue
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pending workflow approvals requiring attention or audit
          </p>
        </div>
      </div>

      <DataTable<ApprovalRequestItem>
        data={pagedApprovals}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search approvals, customers…"
        filterBarLeft={filterBarLeft}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={handlePageSizeChange}
      />

      {/* Details Slide-over Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setSelectedItem(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-lg bg-white dark:bg-gray-900 h-screen shadow-2xl flex flex-col z-10 animate-slide-in border-l border-gray-100 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-150 dark:border-gray-800">
              <div>
                <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest block mb-0.5">
                  Approval Request Details
                </span>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {selectedItem.approvalName} (#{selectedItem.idapproval_request || selectedItem.id})
                </h3>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <CloseLineIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* General Description Card */}
              <div className="p-4 bg-gray-55 dark:bg-gray-850 border border-gray-100 dark:border-gray-800 rounded-xl space-y-3.5">
                <p className="text-xs text-gray-850 dark:text-gray-150 font-semibold leading-relaxed">
                  {selectedItem.description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200/60 dark:border-gray-750/50 text-[11px]">
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Req by: <strong>{selectedItem.userName || "System"}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500">
                    <CalenderIcon className="w-3.5 h-3.5" />
                    <span>{selectedItem.dateTime ? new Date(selectedItem.dateTime).toLocaleDateString() : "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 col-span-2">
                    <BuildingIcon className="w-3.5 h-3.5" />
                    <span>Location: <strong>{selectedItem.branchName || "—"}</strong></span>
                  </div>
                </div>
              </div>

              {/* Customer Details block */}
              {selectedItem.data?.customer_details && (
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Customer Information
                  </h4>
                  <div className="border border-gray-150 dark:border-gray-800 rounded-xl p-4 space-y-2.5 bg-white dark:bg-gray-900 shadow-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-medium text-gray-400">Name</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {selectedItem.data.customer_details.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2">
                      <span className="text-[11px] font-medium text-gray-400">Customer Code</span>
                      <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
                        {selectedItem.data.customer_details.customer_no}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2">
                      <span className="text-[11px] font-medium text-gray-400">NIC</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {selectedItem.data.customer_details.nic}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-100 dark:border-gray-800 pt-2">
                      <span className="text-[11px] font-medium text-gray-400">Mobile</span>
                      <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {selectedItem.data.customer_details.contact_number}
                      </span>
                    </div>
                    <div className="flex justify-between items-start border-t border-gray-100 dark:border-gray-800 pt-2">
                      <span className="text-[11px] font-medium text-gray-400 mt-0.5">Address</span>
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 text-right max-w-[250px] leading-tight">
                        {selectedItem.data.customer_details.address}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval Stages Auditing Timeline */}
              {selectedItem.approvals && selectedItem.approvals.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Approval Pipeline Stages
                  </h4>

                  <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-3.5 space-y-5">
                    {selectedItem.approvals.map((app: any, idx: number) => {
                      const isApproved = String(app.status) === "1";
                      const isRejected = String(app.status) === "2";
                      const isActiveStage = String(app.status) === "0";

                      return (
                        <div key={idx} className="relative pl-6">
                          {/* Indicator Circle */}
                          <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white dark:bg-gray-900 transition-all ${
                            isApproved
                              ? "border-emerald-500 bg-emerald-500 dark:bg-emerald-500"
                              : isRejected
                              ? "border-red-500 bg-red-500 dark:bg-red-500"
                              : "border-gray-300 dark:border-gray-700"
                          }`} />

                          {/* Stage Content */}
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                Stage {app.no || idx + 1}: {app.approvalLevelName || app.name || "Approval Level"}
                              </span>
                              <span className={`px-1.5 py-0.25 text-[9px] font-black rounded uppercase tracking-wider ${
                                isApproved
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
                                  : isRejected
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                              }`}>
                                {isApproved ? "Approved" : isRejected ? "Rejected" : "Pending"}
                              </span>
                            </div>

                            {/* Logs/User Details */}
                            {isApproved && app.logs && app.logs.length > 0 && (
                              <div className="text-[10px] text-gray-400 space-y-0.5 mt-0.5">
                                <span>Approved by: <strong>{app.logs[0].userName || "User"}</strong></span>
                                <span className="block">Date: {new Date(app.logs[0].dateTime).toLocaleString()}</span>
                                {app.logs[0].comment && (
                                  <span className="block italic text-gray-500 bg-gray-50 dark:bg-gray-805 p-1 rounded mt-1 border-l-2 border-brand-400">
                                    "{app.logs[0].comment}"
                                  </span>
                                )}
                              </div>
                            )}

                            {!isApproved && !isRejected && (
                              <span className="text-[10px] text-gray-400 italic block mt-0.5">
                                Awaiting action ({app.type || "ordered"})
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action panel footer */}
            {selectedItem.canApprove && (
              <div className="p-4 bg-gray-50 dark:bg-gray-850 border-t border-gray-150 dark:border-gray-800 space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase block">
                    Review Comment
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide any comments or instructions (optional)..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-lg focus:ring-1 focus:ring-brand-500 focus:border-brand-500 outline-none text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("rejected")}
                    disabled={submittingAction}
                    className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 select-none shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => handleAction("approved")}
                    disabled={submittingAction}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 select-none shadow-sm flex items-center justify-center gap-1.5"
                  >
                    Approve Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
