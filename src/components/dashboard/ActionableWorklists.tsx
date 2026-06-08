import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { notification } from "../../services/notification";
import { Eye, CheckCircle, ArrowRight, UserCircle } from "lucide-react";
import { useNavigate } from "react-router";
import { ROUTES } from "../../routes/paths";

interface WorklistItem {
  id: number;
  loanNo: string;
  customerName: string;
  customerCode: string;
  customerNic: string;
  loanAmount: number;
  disburseAmount: number;
  product: string;
  submittedAt: string;
  issueType?: string;
  branchId?: number;
}

interface ActionableWorklistsProps {
  onDisburseSuccess?: () => void;
}

export const ActionableWorklists: React.FC<ActionableWorklistsProps> = ({ onDisburseSuccess }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"disbursements" | "approvals">("disbursements");
  const [disbursements, setDisbursements] = useState<WorklistItem[]>([]);
  const [approvals, setApprovals] = useState<WorklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [disbRes, appRes] = await Promise.all([
        apiClient.get("/leasing-applications/disbursement-queue"),
        apiClient.get("/leasing-applications/pending"),
      ]);

      const formattedDisbursements = (disbRes.data?.data || disbRes.data || []).map((item: any) => ({
        id: item.id || item.ID,
        loanNo: item.loanNo || item.draft_code || `LSE-${item.id}`,
        customerName: item.customerName || item.customer_name || "Unknown Customer",
        customerCode: item.customerCode || item.customer_code || "-",
        customerNic: item.customerNic || item.customer_nic || "-",
        loanAmount: item.loanAmount || 0,
        disburseAmount: item.disburseAmount || 0,
        product: item.product || "Leasing",
        submittedAt: item.submittedAt || item.UpdatedAt || item.CreatedAt || "",
        issueType: item.issueType || "Cash",
      }));

      const formattedApprovals = (appRes.data?.data || appRes.data || []).map((item: any) => {
        let parsedProgress: any = {};
        try {
          parsedProgress = typeof item.current_progress_data === "string"
            ? JSON.parse(item.current_progress_data)
            : item.current_progress_data;
        } catch (e) {}
        
        return {
          id: item.ID || item.id,
          loanNo: item.draft_code || `LSE-PENDING-${item.ID}`,
          customerName: parsedProgress?.customer_name || item.customer_name || "Unknown Customer",
          customerCode: parsedProgress?.customer_code || "-",
          customerNic: parsedProgress?.new_nic || parsedProgress?.old_nic || "-",
          loanAmount: parseFloat(parsedProgress?.loan_amount || "0"),
          disburseAmount: parseFloat(parsedProgress?.disburse_amount || "0"),
          product: parsedProgress?.product_id ? "Leasing" : "Leasing Draft",
          submittedAt: item.UpdatedAt || item.CreatedAt || "",
        };
      });

      setDisbursements(formattedDisbursements);
      setApprovals(formattedApprovals);
    } catch (err) {
      console.error("Failed to fetch dashboard worklists", err);
      notification.error("Failed to load actionable worklists.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async (id: number, loanNo: string) => {
    if (!window.confirm(`Are you sure you want to disburse loan ${loanNo}? This will activate the lease and generate the installment schedule.`)) {
      return;
    }
    setProcessingId(id);
    try {
      await apiClient.post(`/leasing-applications/${id}/disburse`);
      notification.success(`Loan ${loanNo} disbursed successfully!`);
      fetchData();
      if (onDisburseSuccess) {
        onDisburseSuccess();
      }
    } catch (err: any) {
      console.error(err);
      notification.error("Failed to disburse loan: " + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-LK", { month: "short", day: "numeric", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Actionable Worklist
          </h4>
          <p className="text-xs font-semibold text-gray-500">
            Tasks requiring immediate verification or processing
          </p>
        </div>
        
        {/* Soft UI Tab Selector */}
        <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <button
            onClick={() => setActiveTab("disbursements")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "disbursements"
                ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            Pending Disbursements ({disbursements.length})
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "approvals"
                ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800 dark:hover:text-white"
            }`}
          >
            Awaiting Approval ({approvals.length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-[250px] flex items-center justify-center text-sm font-semibold text-gray-400">
          Loading worklist items...
        </div>
      ) : activeTab === "disbursements" ? (
        /* Disbursements queue table */
        disbursements.length === 0 ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <p className="text-sm font-bold text-gray-500">All loans disbursed!</p>
            <p className="text-xs text-gray-400">No applications are currently in the payout queue.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-bold">Loan / Code</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Payout Amount</th>
                  <th className="pb-3 font-bold">Method</th>
                  <th className="pb-3 font-bold">Submitted Date</th>
                  <th className="pb-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {disbursements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                    <td className="py-4">
                      <span className="px-1.5 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-black rounded uppercase tracking-wider">
                        {item.loanNo}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 font-semibold">{item.product}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <UserCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {item.customerName}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">NIC: {item.customerNic}</div>
                    </td>
                    <td className="py-4 font-black text-gray-900 dark:text-white">
                      {formatCurrency(item.disburseAmount)}
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.issueType === "Bank Transfer"
                          ? "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400"
                          : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                      }`}>
                        {item.issueType}
                      </span>
                    </td>
                    <td className="py-4 text-gray-500 font-medium">{formatDate(item.submittedAt)}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleDisburse(item.id, item.loanNo)}
                        disabled={processingId !== null}
                        className="p-1 px-3 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg shadow-sm hover:shadow transition-all text-[10px] uppercase tracking-wider flex items-center gap-1.5 inline-flex cursor-pointer disabled:opacity-50"
                      >
                        {processingId === item.id ? "Processing..." : (
                          <>
                            Disburse <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        /* Approvals queue table */
        approvals.length === 0 ? (
          <div className="h-[250px] flex flex-col items-center justify-center text-gray-400 gap-2 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <p className="text-sm font-bold text-gray-500">All approvals cleared!</p>
            <p className="text-xs text-gray-400">No applications are currently pending authorization.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 text-gray-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 font-bold">Draft Code</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Requested Facility</th>
                  <th className="pb-3 font-bold">Submitted Date</th>
                  <th className="pb-3 text-right font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-850">
                {approvals.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                    <td className="py-4">
                      <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded uppercase tracking-wider">
                        {item.loanNo}
                      </span>
                      <div className="text-[10px] text-gray-400 mt-1 font-semibold">{item.product}</div>
                    </td>
                    <td className="py-4">
                      <div className="font-bold text-gray-800 dark:text-white flex items-center gap-1">
                        <UserCircle className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        {item.customerName}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">NIC: {item.customerNic}</div>
                    </td>
                    <td className="py-4 font-black text-gray-900 dark:text-white">
                      {formatCurrency(item.loanAmount)}
                    </td>
                    <td className="py-4 text-gray-500 font-medium">{formatDate(item.submittedAt)}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`${ROUTES.CREATE_LEASE}?draftId=${item.id}`)}
                        className="p-1 px-3 bg-gray-50 hover:bg-amber-50 border border-gray-150 dark:bg-gray-900 dark:border-gray-700 text-gray-500 hover:text-amber-500 font-bold rounded-lg transition-all text-[10px] uppercase tracking-wider flex items-center gap-1.5 inline-flex cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};
