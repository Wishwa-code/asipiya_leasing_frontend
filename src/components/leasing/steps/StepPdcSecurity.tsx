import React, { useState, useEffect } from "react";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../form/date-picker";
import { DollarLineIcon } from "../../../icons";

interface StepPdcSecurityProps {
  formData: any;
  updateFormData: (fields: any) => void;
  draftId?: number | null;
}

const StepPdcSecurity: React.FC<StepPdcSecurityProps> = ({ formData, updateFormData, draftId }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <DollarLineIcon className="w-4 h-4" />
          </div>{" "}
          PDC SECURITY CONFIGURATION
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Customer Leasing ID
            </label>
            <input
              type="text"
              value={draftId ? `LSE-2026-${String(draftId).padStart(4, '0')}` : "Auto-populated"}
              disabled
              className="w-full p-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 cursor-not-allowed outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Identification
            </label>
            <select
              name="pdc_security_type"
              value={formData.pdc_security_type}
              onChange={handleChange}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            >
              <option value="Deed">Deed (Signed Contract)</option>
              <option value="CR Book">CR Book (Certificate of Registration)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-gray-200 dark:border-gray-700 my-6" />

        {/* Conditional Layouts based on identification type */}
        {formData.pdc_security_type === "Deed" && (
          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                Reference Details
              </label>
              <textarea
                name="pdc_reference_details"
                value={formData.pdc_reference_details || ""}
                onChange={handleChange}
                placeholder="Enter deed reference details..."
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none min-h-[120px] font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {formData.pdc_security_type === "CR Book" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                  Book Date
                </label>
                <DatePicker
                  id="pdc_book_date"
                  placeholder="Select book date"
                  defaultDate={formData.pdc_book_date || ""}
                  static={false}
                  onChange={(_dates, dateStr) => updateFormData({ pdc_book_date: dateStr })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                Reference Details
              </label>
              <textarea
                name="pdc_reference_details"
                value={formData.pdc_reference_details || ""}
                onChange={handleChange}
                placeholder="Enter registration details or notes..."
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none min-h-[120px] font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {formData.pdc_security_type === "Cheque" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-2 ml-1">
                  Cheque Status
                </label>
                <div className="flex gap-4">
                  <label
                    className={`flex-1 flex items-center justify-center p-2.5 border rounded-xl cursor-pointer text-sm font-bold transition-all ${
                      formData.pdc_cheque_status === "Blank"
                        ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400"
                        : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pdc_cheque_status"
                      value="Blank"
                      checked={formData.pdc_cheque_status === "Blank"}
                      onChange={() => updateFormData({ pdc_cheque_status: "Blank" })}
                      className="sr-only"
                    />
                    Blank
                  </label>
                  <label
                    className={`flex-1 flex items-center justify-center p-2.5 border rounded-xl cursor-pointer text-sm font-bold transition-all ${
                      formData.pdc_cheque_status === "Dated"
                        ? "bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400"
                        : "bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="pdc_cheque_status"
                      value="Dated"
                      checked={formData.pdc_cheque_status === "Dated"}
                      onChange={() => updateFormData({ pdc_cheque_status: "Dated" })}
                      className="sr-only"
                    />
                    Dated
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                  Bank
                </label>
                <select
                  name="pdc_bank_id"
                  value={formData.pdc_bank_id || ""}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
                >
                  <option value="">
                    {loadingBanks ? "Loading banks..." : "Choose Bank..."}
                  </option>
                  {banks.map((b) => (
                    <option key={b.id || b.ID} value={b.id || b.ID}>
                      {b.name || b.Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                  Cheque Date
                </label>
                <DatePicker
                  id="pdc_cheque_date"
                  placeholder="Select cheque date"
                  defaultDate={formData.pdc_cheque_date || ""}
                  static={false}
                  onChange={(_dates, dateStr) => updateFormData({ pdc_cheque_date: dateStr })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                  Cheque No.
                </label>
                <input
                  type="text"
                  name="pdc_cheque_no"
                  value={formData.pdc_cheque_no || ""}
                  onChange={handleChange}
                  placeholder="Enter cheque number"
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                  Ownership
                </label>
                <select
                  name="pdc_ownership"
                  value={formData.pdc_ownership || "Primary"}
                  onChange={handleChange}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
                >
                  <option value="Primary">Primary</option>
                  <option value="Joint">Joint</option>
                  <option value="Guarantor">Guarantor</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
                Reference Details
              </label>
              <textarea
                name="pdc_reference_details"
                value={formData.pdc_reference_details || ""}
                onChange={handleChange}
                placeholder="Enter cheque reference details..."
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none min-h-[120px] font-semibold text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepPdcSecurity;
