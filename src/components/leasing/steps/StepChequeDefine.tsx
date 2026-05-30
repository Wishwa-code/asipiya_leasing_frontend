import React, { useState, useEffect, useMemo } from "react";
import { PlusIcon, TrashBinIcon } from "../../../icons";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../form/date-picker";

interface StepChequeDefineProps {
  formData: any;
  updateFormData: (fields: any) => void;
  errors?: Record<string, string>;
}

const StepChequeDefine: React.FC<StepChequeDefineProps> = ({ formData, updateFormData, errors }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [branchesCache, setBranchesCache] = useState<Record<string, any[]>>({});

  useEffect(() => {
    const fetchBanks = async () => {
      setLoadingBanks(true);
      try {
        const res = await apiClient.get("/lookup/banks");
        setBanks(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch banks:", err);
      } finally {
        setLoadingBanks(false);
      }
    };
    fetchBanks();
  }, []);

  const handleBankChange = async (idx: number, bankName: string) => {
    updateCheque(idx, { bank_name: bankName, branch_name: "" });
    if (!bankName) return;

    const matched = banks.find(b => (b.name || b.Name) === bankName);
    if (!matched) return;

    const bankId = matched.id || matched.ID;
    if (!bankId || branchesCache[bankId]) return;

    try {
      const res = await apiClient.get(`/lookup/banks/${bankId}/branches`);
      const data = res.data?.data || res.data || [];
      setBranchesCache(prev => ({ ...prev, [bankId]: data }));
    } catch (err) {
      console.error(`Failed to fetch branches for bankId ${bankId}:`, err);
    }
  };

  // Load branches for any pre-filled banks in the cheques list
  useEffect(() => {
    if (banks.length === 0 || !formData.cheques) return;

    const uniqueBanks = Array.from(new Set(formData.cheques.map((c: any) => c.bank_name).filter(Boolean)));
    uniqueBanks.forEach(async (bName: any) => {
      const matched = banks.find(b => (b.name || b.Name) === bName);
      if (matched) {
        const bankId = matched.id || matched.ID;
        if (bankId && !branchesCache[bankId]) {
          try {
            const res = await apiClient.get(`/lookup/banks/${bankId}/branches`);
            const data = res.data?.data || res.data || [];
            setBranchesCache(prev => ({ ...prev, [bankId]: data }));
          } catch (err) {
            console.error(`Failed to load initial branches for bank ${bankId}:`, err);
          }
        }
      }
    });
  }, [banks, formData.cheques]);

  const addCheque = () => {
    const newCheque = {
      cheque_no: "",
      cheque_date: "",
      payee_name: "",
      nic_br_no: "",
      instructions: "A/C Payee only",
      payment_amount: "0.00",
      bank_name: "",
      branch_name: "",
      account_number: "",
    };
    updateFormData({ cheques: [...(formData.cheques || []), newCheque] });
  };

  const removeCheque = (index: number) => {
    const newList = [...(formData.cheques || [])];
    newList.splice(index, 1);
    updateFormData({ cheques: newList });
  };

  const updateCheque = (index: number, fields: any) => {
    const newList = [...(formData.cheques || [])];
    newList[index] = { ...newList[index], ...fields };
    updateFormData({ cheques: newList });
  };

  const totalAmount = useMemo(() => {
    return (formData.cheques || []).reduce(
      (acc: number, curr: any) => acc + (parseFloat(curr.payment_amount) || 0),
      0
    );
  }, [formData.cheques]);

  const replicateFirstRow = () => {
    const chequesList = formData.cheques || [];
    if (chequesList.length < 2) return;
    const firstChq = chequesList[0];
    const newList = chequesList.map((chq: any, idx: number) => {
      if (idx === 0) return chq;
      return {
        ...chq,
        payee_name: firstChq.payee_name || "",
        nic_br_no: firstChq.nic_br_no || "",
        instructions: firstChq.instructions || "",
        bank_name: firstChq.bank_name || "",
        branch_name: firstChq.branch_name || "",
        account_number: firstChq.account_number || "",
      };
    });
    updateFormData({ cheques: newList });
  };

  const generateSeries = () => {
    const chequesList = formData.cheques || [];
    if (chequesList.length < 2) return;

    const firstChq = chequesList[0];
    const startChequeNoStr = firstChq.cheque_no || "";
    const startDateStr = firstChq.cheque_date || "";

    // Extract number parts from cheque_no if possible (e.g. 100234 or CHQ-100234)
    let startChequeNo = parseInt(startChequeNoStr.replace(/\D/g, "")) || 0;
    const prefixMatch = startChequeNoStr.match(/^(\D+)/);
    const prefix = prefixMatch ? prefixMatch[1] : "";
    const digitLength = startChequeNoStr.length - prefix.length;

    const newList = chequesList.map((chq: any, idx: number) => {
      if (idx === 0) return chq;

      // Generate consecutive cheque number
      let nextChequeNoStr = "";
      if (startChequeNo > 0) {
        const nextNum = startChequeNo + idx;
        if (prefix) {
          nextChequeNoStr = prefix + String(nextNum).padStart(digitLength > 0 ? digitLength : 0, '0');
        } else {
          nextChequeNoStr = String(nextNum).padStart(startChequeNoStr.length, '0');
        }
      }

      // Generate monthly date increment
      let nextDateStr = "";
      if (startDateStr) {
        const date = new Date(startDateStr);
        if (!isNaN(date.getTime())) {
          date.setMonth(date.getMonth() + idx);
          nextDateStr = date.toISOString().split('T')[0];
        }
      }

      return {
        ...chq,
        cheque_no: nextChequeNoStr || chq.cheque_no || "",
        cheque_date: nextDateStr || chq.cheque_date || "",
      };
    });
    updateFormData({ cheques: newList });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-3 space-y-6">
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div>
              <h3 className="text-lg font-bold">Cheque Definitions</h3>
              <p className="text-sm text-gray-500 font-medium">
                Define payout/disbursement instructions for the leasing application
              </p>
              {errors?.cheques && (
                <p className="text-sm text-red-500 font-bold mt-2">{errors.cheques}</p>
              )}
            </div>
            <button
              onClick={addCheque}
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              <PlusIcon className="w-5 h-5" /> Add Row
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left table-auto">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-4 py-4 w-12 text-center">#</th>
                    <th className="px-4 py-4 min-w-[120px]">Cheque No</th>
                    <th className="px-4 py-4 min-w-[170px]">Cheque Date</th>
                    <th className="px-4 py-4 min-w-[160px]">Payee Name</th>
                    <th className="px-4 py-4 min-w-[140px]">NIC / BR No.</th>
                    <th className="px-4 py-4 min-w-[150px]">Instructions</th>
                    <th className="px-4 py-4 min-w-[120px]">Payment Amount</th>
                    <th className="px-4 py-4 min-w-[180px]">Bank Name</th>
                    <th className="px-4 py-4 min-w-[140px]">Branch Name</th>
                    <th className="px-4 py-4 min-w-[145px]">Account Number</th>
                    <th className="px-4 py-4 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                  {(!formData.cheques || formData.cheques.length === 0) ? (
                    <tr>
                      <td colSpan={11} className="px-6 py-20 text-center text-gray-400 italic font-bold opacity-60">
                        No payout definitions defined yet.
                      </td>
                    </tr>
                  ) : (
                    formData.cheques.map((chq: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="px-4 py-4 text-center">
                          <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-black text-gray-500">
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={chq.cheque_no || ""}
                            onChange={(e) => updateCheque(idx, { cheque_no: e.target.value })}
                            placeholder="Cheque No"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
                          />
                        </td>
                        <td className="px-2 py-3">
                          <DatePicker
                            id={`cheque_date_${idx}`}
                            placeholder="Pick date"
                            defaultDate={chq.cheque_date || ""}
                            static={false}
                            onChange={(_dates, dateStr) => updateCheque(idx, { cheque_date: dateStr })}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={chq.payee_name || ""}
                            onChange={(e) => updateCheque(idx, { payee_name: e.target.value })}
                            placeholder="Payee Name"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-semibold outline-none transition-all ${
                              errors?.[`cheques.${idx}.payee_name`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-900 dark:text-white"
                            }`}
                            title={errors?.[`cheques.${idx}.payee_name`]}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={chq.nic_br_no || ""}
                            onChange={(e) => updateCheque(idx, { nic_br_no: e.target.value })}
                            placeholder="NIC / BR No."
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-semibold outline-none transition-all ${
                              errors?.[`cheques.${idx}.nic_br_no`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-900 dark:text-white"
                            }`}
                            title={errors?.[`cheques.${idx}.nic_br_no`]}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={chq.instructions || ""}
                            onChange={(e) => updateCheque(idx, { instructions: e.target.value })}
                            placeholder="Instructions"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-semibold outline-none transition-all ${
                              errors?.[`cheques.${idx}.instructions`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-900 dark:text-white"
                            }`}
                            title={errors?.[`cheques.${idx}.instructions`]}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={chq.payment_amount || ""}
                            onChange={(e) => updateCheque(idx, { payment_amount: e.target.value })}
                            placeholder="0.00"
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-bold outline-none transition-all ${
                              errors?.[`cheques.${idx}.payment_amount`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-brand-600 dark:text-brand-400"
                            }`}
                            title={errors?.[`cheques.${idx}.payment_amount`]}
                          />
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={chq.bank_name || ""}
                            onChange={(e) => handleBankChange(idx, e.target.value)}
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-semibold outline-none transition-all ${
                              errors?.[`cheques.${idx}.bank_name`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-900 dark:text-white"
                            }`}
                            title={errors?.[`cheques.${idx}.bank_name`]}
                          >
                            <option value="">
                              {loadingBanks ? "Loading banks..." : "Select Bank"}
                            </option>
                            {banks.map((b) => (
                              <option key={b.id || b.ID} value={b.name || b.Name}>
                                {b.name || b.Name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <select
                            value={chq.branch_name || ""}
                            onChange={(e) => updateCheque(idx, { branch_name: e.target.value })}
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-semibold outline-none transition-all ${
                              errors?.[`cheques.${idx}.branch_name`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-900 dark:text-white"
                            }`}
                            title={errors?.[`cheques.${idx}.branch_name`]}
                            disabled={!chq.bank_name}
                          >
                            <option value="">Select Branch</option>
                            {(() => {
                              const selectedBank = banks.find(b => (b.name || b.Name) === chq.bank_name);
                              const bankId = selectedBank?.id || selectedBank?.ID;
                              const rowBranches = bankId ? (branchesCache[bankId] || []) : [];
                              return rowBranches.map((br: any) => (
                                <option key={br.id || br.ID} value={br.name || br.Name}>
                                  {br.name || br.Name}
                                </option>
                              ));
                            })()}
                          </select>
                        </td>
                        <td className="px-2 py-3">
                          <input
                            type="text"
                            value={chq.account_number || ""}
                            onChange={(e) => updateCheque(idx, { account_number: e.target.value })}
                            placeholder="Account No."
                            className={`w-full px-3 py-2 bg-white dark:bg-gray-900 border rounded-xl text-sm font-semibold outline-none transition-all ${
                              errors?.[`cheques.${idx}.account_number`]
                                ? "border-red-500 focus:border-red-500 text-red-500"
                                : "border-gray-200 dark:border-gray-700 focus:border-brand-500 text-gray-900 dark:text-white"
                            }`}
                            title={errors?.[`cheques.${idx}.account_number`]}
                          />
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => removeCheque(idx)}
                            className="p-2 text-gray-400 hover:text-error-500 transition-colors"
                          >
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900 dark:bg-brand-950 p-8 rounded-3xl text-white shadow-xl">
            <p className="text-[10px] font-bold uppercase tracking-[2px] opacity-60 mb-2">DISBURSEMENT TOTALS</p>
            <h2 className="text-3xl font-black mb-6">LKR {totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-60">Total Payable</span>
                <span className="font-bold">LKR {parseFloat(formData.total_payable || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-60">Remaining Balance</span>
                <span className={`font-bold ${totalAmount === parseFloat(formData.total_payable || "0") ? 'text-success-400' : 'text-orange-400'}`}>
                  LKR {(parseFloat(formData.total_payable || "0") - totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-brand-50/50 dark:bg-brand-500/5 p-6 rounded-2xl border border-brand-100 dark:border-brand-500/10 space-y-5">
            <div>
              <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">
                AUTO REPLICATE
              </h4>
              <p className="text-xs text-brand-900/60 dark:text-brand-100/60 mb-4 font-medium leading-relaxed">
                Copy Payee Name, NIC/BR No., Instructions, Bank, Branch, and Account No. from the first row to all other rows.
              </p>
              <button
                onClick={replicateFirstRow}
                disabled={!formData.cheques || formData.cheques.length < 2}
                className="w-full py-2 bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Replicate Details
              </button>
            </div>

            <div className="border-t border-brand-100 dark:border-brand-500/10 pt-4">
              <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">
                GENERATE SERIES
              </h4>
              <p className="text-xs text-brand-900/60 dark:text-brand-100/60 mb-4 font-medium leading-relaxed">
                Generate consecutive cheque numbers and monthly dates based on the first entry.
              </p>
              <button
                onClick={generateSeries}
                disabled={!formData.cheques || formData.cheques.length < 2}
                className="w-full py-2 bg-white dark:bg-gray-800 border border-brand-500 text-brand-500 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Generate Series
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepChequeDefine;
