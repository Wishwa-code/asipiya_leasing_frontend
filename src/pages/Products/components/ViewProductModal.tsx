import { useState, useEffect, useMemo } from "react";
import {
  CloseLineIcon,
  BoxIcon,
  CalenderIcon as CalendarIcon,
  DollarLineIcon,
  TimeIcon,
  ListIcon,
  DocsIcon,
  CheckLineIcon,
  EyeIcon,
} from "../../../icons";
import apiClient from "../../../api/apiClient";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { generateRepaymentSchedule } from "../../../utils/leasingUtils";
import { cn } from "@/lib/utils";

interface ViewProductModalProps {
  productId: number;
  onClose: () => void;
}

export default function ViewProductModal({ productId, onClose }: ViewProductModalProps) {
  const [product, setProduct] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Installment Preview State ──────────────────────────────────────────────
  const [previewingItem, setPreviewingItem] = useState<Record<string, any> | null>(null);
  const [previewForm, setPreviewForm] = useState({
    amount: 0,
    interestRate: 0,
    period: 0,
    startDate: new Date().toISOString().split("T")[0],
  });
  const [previewSchedule, setPreviewSchedule] = useState<any[]>([]);

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/leasing/products/${productId}`);
      setProduct(res.data?.data || res.data?.product || res.data);
    } catch (error) {
      console.error("Failed to load product details", error);
    } finally {
      setLoading(false);
    }
  };

  if (!productId) return null;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const formatText = (text?: string) => {
    if (!text) return "-";
    return text.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatCurrency = (val: string | number) => {
    const num = Number(val) || 0;
    return num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // ── Loan limit band across sub-products ───────────────────────────────────
  let minLoanLimit = 0;
  let maxLoanLimit = 0;
  if (product?.product_has_items?.length > 0) {
    let min = Infinity;
    let max = -Infinity;
    product.product_has_items.forEach((item: Record<string, any>) => {
      const imin = Number(item.minimum_loan_amount) || 0;
      const imax = Number(item.maximum_loan_amount) || 0;
      if (imin < min) min = imin;
      if (imax > max) max = imax;
    });
    if (min !== Infinity) minLoanLimit = min;
    if (max !== -Infinity) maxLoanLimit = max;
  }

  // ── Preview helpers ────────────────────────────────────────────────────────
  const calculatePreview = (
    amount: number,
    interestRate: number,
    period: number,
    startDate: string
  ) => {
    if (!product) return;
    const mockProduct = {
      interest_method: product.interest_method,
      loan_period_type: product.loan_period_type,
      interest_period_type: product.interest_period_type,
      collection_period_type: product.collection_period_type,
      additional_charges: (product.additional_charges || []).map((c: any) => ({
        deduction_type: c.deduction_type,
        value_type: c.value_type,
        value: c.value,
      })),
    };
    const schedule = generateRepaymentSchedule(amount, interestRate, period, startDate, mockProduct);
    setPreviewSchedule(schedule);
  };

  const handleOpenPreview = (item: Record<string, any>) => {
    const defaultAmount = Number(item.minimum_loan_amount) || 0;
    const defaultInterest = Number(item.minimum_interest) || 0;
    const defaultPeriod = Number(item.minimum_loan_period) || 0;
    const today = new Date().toISOString().split("T")[0];

    setPreviewingItem(item);
    setPreviewForm({ amount: defaultAmount, interestRate: defaultInterest, period: defaultPeriod, startDate: today });
    calculatePreview(defaultAmount, defaultInterest, defaultPeriod, today);
  };

  // ── Preview summary memo ───────────────────────────────────────────────────
  const previewSummary = useMemo(() => {
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalPayable = 0;
    previewSchedule.forEach((row) => {
      totalPrincipal += parseFloat(row.capital) || 0;
      totalInterest += parseFloat(row.interest) || 0;
      totalPayable += parseFloat(row.total_due) || 0;
    });

    let disbursementCharges = 0;
    (product?.additional_charges || []).forEach((c: any) => {
      if ((c.deduction_type || "").toLowerCase().includes("disbursement")) {
        const isPercent = (c.value_type || "").toLowerCase() === "percentage";
        const amt = isPercent
          ? (previewForm.amount * parseFloat(c.value)) / 100
          : parseFloat(c.value) || 0;
        disbursementCharges += amt;
      }
    });

    const netDisbursement = previewForm.amount - disbursementCharges;
    const regularRow = previewSchedule.find((r) => parseFloat(r.capital) > 0) || previewSchedule[0];
    const installmentAmount = regularRow ? parseFloat(regularRow.total_due) : 0;

    return { totalPrincipal, totalInterest, disbursementCharges, netDisbursement, totalPayable, installmentAmount };
  }, [previewSchedule, previewForm.amount, product]);

  // ── Out-of-range checks ────────────────────────────────────────────────────
  const amountOutOfRange =
    previewingItem &&
    previewForm.amount > 0 &&
    (previewForm.amount < Number(previewingItem.minimum_loan_amount) ||
      previewForm.amount > Number(previewingItem.maximum_loan_amount));

  const interestOutOfRange =
    previewingItem &&
    previewForm.interestRate > 0 &&
    (previewForm.interestRate < Number(previewingItem.minimum_interest) ||
      previewForm.interestRate > Number(previewingItem.maximum_interest));

  const periodOutOfRange =
    previewingItem &&
    previewForm.period > 0 &&
    (previewForm.period < Number(previewingItem.minimum_loan_period) ||
      previewForm.period > Number(previewingItem.maximum_loan_period));

  const recalcDisabled = !!(amountOutOfRange || interestOutOfRange || periodOutOfRange);

  return (
    <Drawer open={!!productId} onOpenChange={(open) => !open && onClose()} direction="right">
      <DrawerContent className={cn(
        "h-full p-0 border-l border-gray-150 dark:border-gray-800 transition-all duration-500 ease-in-out rounded-tl-[20px] overflow-hidden",
        previewingItem 
          ? "data-[direction=right]:max-w-[95vw] md:data-[direction=right]:max-w-[1480px] md:data-[direction=right]:w-[1480px]" 
          : "data-[direction=right]:max-w-[95vw] md:data-[direction=right]:max-w-[1000px] md:data-[direction=right]:w-[1000px]"
      )}>
        <div className="flex flex-row-reverse h-full w-full min-w-0 overflow-hidden">
          
          {/* RIGHT: Main Product Details Panel (always visible, independently scrollable) */}
          <div className={cn(
            "w-[1000px] max-w-full shrink-0 h-full flex flex-col min-w-0 bg-gray-50 dark:bg-gray-900 overflow-hidden",
            !previewingItem && "rounded-tl-[20px]"
          )}>
            {/* Header */}
            <div className={cn(
              "bg-brand-600 px-6 py-4 border-b border-brand-500/10 flex items-center justify-between shrink-0",
              !previewingItem && "rounded-tl-[20px]"
            )}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                  <BoxIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-sm font-bold text-white leading-none">Product Details</h2>
                  <p className="text-[11px] text-brand-100 uppercase tracking-wider font-semibold mt-1">
                    Comprehensive overview
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
              >
                <CloseLineIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-brand-500">
                  <span className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></span>
                  <p className="font-semibold text-sm">Loading product details...</p>
                </div>
              ) : !product ? (
                <div className="text-center py-20 text-gray-500">Failed to load product.</div>
              ) : (
                <>
                  {/* Top header card */}
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-5">
                      <div className="shrink-0 w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
                        <BoxIcon className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2 gap-3">
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{product.product_name}</h2>
                          {product.status === "active" ? (
                            <span className="shrink-0 px-3 py-1 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 rounded-full text-xs font-bold border border-success-200 dark:border-success-800">Active</span>
                          ) : (
                            <span className="shrink-0 px-3 py-1 bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 rounded-full text-xs font-bold border border-error-200 dark:border-error-800">Inactive</span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg font-bold text-gray-700 dark:text-gray-300 text-xs">
                            Code: {product.product_code}
                          </span>
                          <span className="flex items-center gap-1.5 text-xs">
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Created: <span className="font-medium">{product.CreatedAt ? new Date(product.CreatedAt).toLocaleDateString() : "N/A"}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: <BoxIcon className="w-5 h-5 text-info-500 dark:text-info-400" />, label: "Interest Method", value: formatText(product.interest_method), color: "info" },
                      { icon: <DollarLineIcon className="w-5 h-5 text-brand-500 dark:text-brand-400" />, label: "Loan Limits", value: `${formatCurrency(minLoanLimit)} – ${formatCurrency(maxLoanLimit)}`, color: "brand" },
                      { icon: <TimeIcon className="w-5 h-5 text-success-500 dark:text-success-400" />, label: "Period Type", value: formatText(product.loan_period_type), color: "success" },
                    ].map(({ icon, label, value, color }) => (
                      <div key={label} className="bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex items-center gap-4">
                        <div className={`w-10 h-10 bg-${color}-50 text-${color}-500 dark:bg-${color}-500/10 dark:text-${color}-400 rounded-full flex items-center justify-center shrink-0`}>
                          {icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">{label}</p>
                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">{value}</h4>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Sub Products Table */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                        <ListIcon className="w-4 h-4 text-brand-500" />
                        Sub Products (Configuration)
                      </h3>
                      <span className="px-3 py-1 bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-full text-xs font-bold">
                        {product.product_has_items?.length || 0} Items
                      </span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-[10px] font-bold uppercase text-gray-400">
                          <tr>
                            <th className="px-5 py-3">Item Name</th>
                            <th className="px-5 py-3">Loan Amount Range</th>
                            <th className="px-5 py-3">Period &amp; Interest</th>
                            <th className="px-5 py-3">Penalty</th>
                            <th className="px-5 py-3 text-right">Preview</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                          {!product.product_has_items || product.product_has_items.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                                No items configured for this product.
                              </td>
                            </tr>
                          ) : (
                            product.product_has_items.map((cfg: Record<string, any>, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <td className="px-5 py-3.5">
                                  <p className="font-bold text-gray-900 dark:text-gray-200">{cfg.product_item_name}</p>
                                </td>
                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-300">
                                  {formatCurrency(cfg.minimum_loan_amount)} – {formatCurrency(cfg.maximum_loan_amount)}
                                </td>
                                <td className="px-5 py-3.5">
                                  <p className="font-bold text-gray-900 dark:text-gray-200">
                                    {cfg.minimum_interest}% – {cfg.maximum_interest}%
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {cfg.minimum_loan_period} – {cfg.maximum_loan_period} {formatText(product.loan_period_type)}
                                  </p>
                                </td>
                                <td className="px-5 py-3.5">
                                  {cfg.penalty_percentage > 0 ? (
                                    <>
                                      <p className="text-error-500 font-bold">{cfg.penalty_percentage}%</p>
                                      <p className="text-xs text-gray-400 mt-0.5">{formatText(cfg.penalty_apply_type)}</p>
                                    </>
                                  ) : (
                                    <span className="text-gray-400 font-medium text-xs">No penalty</span>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenPreview(cfg)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-lg text-xs font-bold transition-colors"
                                    title="Preview Installment Schedule"
                                  >
                                    <EyeIcon className="w-3.5 h-3.5 fill-current" />
                                    Preview
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bottom: Charges + Docs */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    
                    {/* Charges */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                          <DollarLineIcon className="w-4 h-4 text-warning-500" /> Additional Charges
                        </h3>
                      </div>
                      <div className="flex-1 overflow-x-auto p-2">
                        <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                            {!product.additional_charges || product.additional_charges.length === 0 ? (
                              <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No additional charges.</td></tr>
                            ) : product.additional_charges.map((charge: Record<string, any>, idx: number) => (
                              <tr key={idx}>
                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">{charge.description}</td>
                                <td className="px-4 py-3 font-bold">{formatCurrency(charge.value)}{charge.value_type === "percentage" ? "%" : ""}</td>
                                <td className="px-4 py-3 text-right">
                                  {charge.value_type === "percentage" ? (
                                    <span className="px-2 py-0.5 bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400 text-xs font-bold rounded">Percentage</span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-bold rounded">Fixed</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Docs */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 text-sm">
                          <DocsIcon className="w-4 h-4 text-success-500" /> Required Documents
                        </h3>
                      </div>
                      <div className="flex-1 p-4">
                        <ul className="space-y-2">
                          {!product.required_documents || product.required_documents.length === 0 ? (
                            <li className="text-center py-4 text-gray-400 text-sm">No documents required.</li>
                          ) : product.required_documents.map((doc: Record<string, any>, idx: number) => (
                            <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                              <div className="w-6 h-6 shrink-0 bg-success-100 dark:bg-success-500/20 text-success-500 rounded-full flex justify-center items-center">
                                <CheckLineIcon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex-1">{doc.name}</span>
                              <span className="text-xs font-medium text-gray-400">{doc.status || "Required"}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
              >
                Close
              </button>
            </div>
          </div>

          {/* LEFT: Installment Preview Panel (slides out from left edge) */}
          <div className={cn(
            "h-full bg-white dark:bg-gray-900 border-r border-gray-150 dark:border-gray-800 transition-all duration-500 ease-in-out overflow-hidden shrink-0 flex flex-col rounded-tl-[20px]",
            previewingItem ? "w-[480px] opacity-100" : "w-0 opacity-0"
          )}>
            <div className="w-[480px] h-full flex flex-col min-h-0">
              {previewingItem && (
                <>
                  {/* Preview Header */}
                  <div className="bg-amber-500 px-6 py-4 rounded-tl-[20px] border-b border-amber-400/20 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                        <EyeIcon className="w-4 h-4 fill-current text-white" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-white leading-none">Installment Preview</h3>
                        <p className="text-[11px] text-amber-100 uppercase tracking-wider font-semibold mt-1">
                          {previewingItem.product_item_name}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewingItem(null)}
                      className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      <CloseLineIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Preview Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6 space-y-6 bg-gray-50/50 dark:bg-gray-900/50">
                    {/* Inputs */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Simulation Inputs
                      </h4>
                      <div className="border border-gray-150 dark:border-gray-800 rounded-2xl p-4 space-y-4 bg-white dark:bg-gray-900 shadow-sm">
                        
                        {/* Loan Amount */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Loan Amount (LKR)</label>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                              {Number(previewingItem.minimum_loan_amount).toLocaleString()} – {Number(previewingItem.maximum_loan_amount).toLocaleString()}
                            </span>
                          </div>
                          <Input
                            type="number"
                            value={previewForm.amount || ""}
                            onChange={(e) => setPreviewForm((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white dark:bg-gray-900"
                          />
                          {amountOutOfRange && (
                            <p className="text-[10px] text-error-500 mt-1 font-semibold">
                              Must be between {Number(previewingItem.minimum_loan_amount).toLocaleString()} and {Number(previewingItem.maximum_loan_amount).toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* Interest Rate */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Interest Rate % ({formatText(product?.interest_period_type)})
                            </label>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                              {previewingItem.minimum_interest}% – {previewingItem.maximum_interest}%
                            </span>
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            value={previewForm.interestRate || ""}
                            onChange={(e) => setPreviewForm((prev) => ({ ...prev, interestRate: parseFloat(e.target.value) || 0 }))}
                            className="w-full bg-white dark:bg-gray-900"
                          />
                          {interestOutOfRange && (
                            <p className="text-[10px] text-error-500 mt-1 font-semibold">
                              Must be between {previewingItem.minimum_interest}% and {previewingItem.maximum_interest}%
                            </p>
                          )}
                        </div>

                        {/* Loan Period */}
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                              Loan Period ({formatText(product?.loan_period_type)})
                            </label>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold">
                              {previewingItem.minimum_loan_period} – {previewingItem.maximum_loan_period}
                            </span>
                          </div>
                          <Input
                            type="number"
                            value={previewForm.period || ""}
                            onChange={(e) => setPreviewForm((prev) => ({ ...prev, period: parseInt(e.target.value, 10) || 0 }))}
                            className="w-full bg-white dark:bg-gray-900"
                          />
                          {periodOutOfRange && (
                            <p className="text-[10px] text-error-500 mt-1 font-semibold">
                              Must be between {previewingItem.minimum_loan_period} and {previewingItem.maximum_loan_period}
                            </p>
                          )}
                        </div>

                        {/* Start Date */}
                        <div>
                          <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                            Disbursement Date
                          </label>
                          <Input
                            type="date"
                            value={previewForm.startDate}
                            onChange={(e) => setPreviewForm((prev) => ({ ...prev, startDate: e.target.value }))}
                            className="w-full bg-white dark:bg-gray-900"
                          />
                        </div>

                        {/* Recalculate */}
                        <button
                          type="button"
                          disabled={recalcDisabled}
                          onClick={() =>
                            calculatePreview(previewForm.amount, previewForm.interestRate, previewForm.period, previewForm.startDate)
                          }
                          className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                        >
                          Recalculate Preview
                        </button>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Simulation Results
                      </h4>
                      <div className="border border-gray-150 dark:border-gray-800 rounded-2xl p-4 space-y-2.5 bg-white dark:bg-gray-900 shadow-sm">
                        {[
                          { label: "Interest Method", value: formatText(product?.interest_method), accent: true },
                          { label: "Loan Principal", value: `LKR ${previewSummary.totalPrincipal.toLocaleString("en-LK", { minimumFractionDigits: 2 })}` },
                          { label: "Total Interest", value: `LKR ${previewSummary.totalInterest.toLocaleString("en-LK", { minimumFractionDigits: 2 })}` },
                          { label: "Upfront Charges (Deducted)", value: `LKR ${previewSummary.disbursementCharges.toLocaleString("en-LK", { minimumFractionDigits: 2 })}` },
                          { label: "Net Disbursement Amount", value: `LKR ${previewSummary.netDisbursement.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, emerald: true },
                          { label: "Total Payable", value: `LKR ${previewSummary.totalPayable.toLocaleString("en-LK", { minimumFractionDigits: 2 })}` },
                          { label: "Per-Installment Amount", value: `LKR ${previewSummary.installmentAmount.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`, gold: true },
                        ].map(({ label, value, accent, emerald, gold }) => (
                          <div key={label} className="flex justify-between items-center border-t first:border-t-0 border-gray-100 dark:border-gray-800 pt-2.5 first:pt-0">
                            <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">{label}</span>
                            <span className={`text-xs font-bold ${accent ? "text-amber-600 dark:text-amber-400" : emerald ? "text-emerald-600 dark:text-emerald-400 text-sm" : gold ? "text-amber-600 dark:text-amber-400 text-sm" : "text-gray-800 dark:text-gray-200"}`}>
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        Repayment Schedule ({previewSchedule.length} payments)
                      </h4>
                      <div className="border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm flex flex-col bg-white dark:bg-gray-900">
                        <div className="overflow-y-auto custom-scrollbar max-h-[300px]">
                          <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
                            <thead className="bg-gray-50 dark:bg-gray-850 text-[10px] uppercase font-bold text-gray-400 sticky top-0 z-10 border-b border-gray-150 dark:border-gray-800">
                              <tr>
                                <th className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850">No.</th>
                                <th className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850">Date</th>
                                <th className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-right">Capital</th>
                                <th className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-right">Interest</th>
                                <th className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-right">Charges</th>
                                <th className="px-3 py-2.5 bg-gray-50 dark:bg-gray-850 text-right">Total Due</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80 bg-white dark:bg-gray-900">
                              {previewSchedule.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-3 py-8 text-center text-gray-400">
                                    Enter values above and click Recalculate.
                                  </td>
                                </tr>
                              ) : (
                                previewSchedule.map((row) => (
                                  <tr key={row.no} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{row.no}</td>
                                    <td className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-300">{row.collection_date}</td>
                                    <td className="px-3 py-2 text-right">LKR {parseFloat(row.capital).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                                    <td className="px-3 py-2 text-right">LKR {parseFloat(row.interest).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                                    <td className="px-3 py-2 text-right">LKR {parseFloat(row.charges).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                                    <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">LKR {parseFloat(row.total_due).toLocaleString("en-LK", { minimumFractionDigits: 2 })}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Footer */}
                  <div className="p-4 flex justify-end border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewingItem(null)}
                      className="py-2.5 px-5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-850 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-xl transition-all"
                    >
                      Close Preview
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </DrawerContent>
    </Drawer>
  );
}
