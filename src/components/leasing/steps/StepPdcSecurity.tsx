import React, { useEffect, useState } from "react";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../form/date-picker";

interface StepPdcSecurityProps {
  formData: any;
  updateFormData: (fields: any) => void;
  errors?: Record<string, string>;
}

const StepPdcSecurity: React.FC<StepPdcSecurityProps> = ({ formData, updateFormData, errors }) => {
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  // Fetch active banks for Cheque configuration
  useEffect(() => {
    setLoadingBanks(true);
    apiClient.get("/lookup/banks")
      .then(res => {
        if (res.data && res.data.data) {
          setBanks(res.data.data);
        }
      })
      .catch(err => console.error("Failed to load banks", err))
      .finally(() => setLoadingBanks(false));
  }, []);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    updateFormData({
      pdc_security_type: selectedType,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="border-b border-gray-100 dark:border-gray-700 pb-4 mb-6">
        <h3 className="text-lg font-bold text-gray-850 dark:text-white uppercase tracking-wider flex items-center gap-2">
          💳 Create New PDC Security
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Leasing ID (Auto-populated & Disabled) */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
            Customer Leasing ID *
          </label>
          <input 
            type="text" 
            value="Auto-populated" 
            disabled 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed font-medium outline-none"
          />
        </div>

        {/* Identification Selector */}
        <div>
          <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
            Identification *
          </label>
          <select 
            value={formData.pdc_security_type}
            onChange={handleTypeChange}
            className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl font-medium outline-none transition-all ${
              errors?.pdc_security_type 
                ? 'border-red-500 focus:border-red-500' 
                : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
            }`}
          >
            <option value="Deed">Deed (Signed Contract)</option>
            <option value="CR Book">CR Book (Certificate of Registration)</option>
            <option value="Cheque">Cheque</option>
          </select>
          {errors?.pdc_security_type && (
            <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_security_type}</p>
          )}
        </div>
      </div>

      {/* DYNAMIC FORM FIELDS */}
      
      {/* 1. CR BOOK TYPE FIELDS */}
      {(formData.pdc_security_type === "CR Book") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
              Book Date *
            </label>
            <DatePicker
              id="pdc_book_date"
              placeholder="Select Date"
              defaultDate={formData.pdc_book_date}
              onChange={(_dates, dateStr) => updateFormData({ pdc_book_date: dateStr })}
              error={!!errors?.pdc_book_date}
            />
            {errors?.pdc_book_date && (
              <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_book_date}</p>
            )}
          </div>
        </div>
      )}

      {/* 2. CHEQUE TYPE FIELDS */}
      {(formData.pdc_security_type === "Cheque") && (
        <div className="space-y-6 pt-4 border-t border-gray-50 dark:border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Cheque Status Radios */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Cheque Status
              </label>
              <div className="flex items-center gap-6 mt-3">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cheque_status"
                    checked={formData.pdc_cheque_status === "Blank"}
                    onChange={() => updateFormData({ pdc_cheque_status: "Blank" })}
                    className="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-400"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Blank</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="cheque_status"
                    checked={formData.pdc_cheque_status === "Dated"}
                    onChange={() => updateFormData({ pdc_cheque_status: "Dated" })}
                    className="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-400"
                  />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Dated</span>
                </label>
              </div>
            </div>

            {/* Bank Select */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Bank *
              </label>
              <select
                value={formData.pdc_bank_id}
                onChange={(e) => updateFormData({ pdc_bank_id: e.target.value })}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl font-medium outline-none transition-all ${
                  errors?.pdc_bank_id 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
                }`}
              >
                <option value="">{loadingBanks ? "Loading banks..." : "Choose"}</option>
                {banks.map(b => (
                  <option key={b.ID || b.id} value={(b.ID || b.id).toString()}>{b.name}</option>
                ))}
              </select>
              {errors?.pdc_bank_id && (
                <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_bank_id}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cheque Date */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Cheque Date *
              </label>
              <DatePicker
                id="pdc_cheque_date"
                placeholder="Select Date"
                defaultDate={formData.pdc_cheque_date}
                onChange={(_dates, dateStr) => updateFormData({ pdc_cheque_date: dateStr })}
                error={!!errors?.pdc_cheque_date}
              />
              {errors?.pdc_cheque_date && (
                <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_cheque_date}</p>
              )}
            </div>

            {/* Cheque No */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Cheque No. *
              </label>
              <input
                type="text"
                placeholder="Cheque No"
                value={formData.pdc_cheque_no}
                onChange={(e) => updateFormData({ pdc_cheque_no: e.target.value })}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl font-medium outline-none transition-all ${
                  errors?.pdc_cheque_no 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
                }`}
              />
              {errors?.pdc_cheque_no && (
                <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_cheque_no}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ownership */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
                Ownership *
              </label>
              <select
                value={formData.pdc_ownership}
                onChange={(e) => updateFormData({ pdc_ownership: e.target.value })}
                className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl font-medium outline-none transition-all ${
                  errors?.pdc_ownership 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
                }`}
              >
                <option value="Primary">Primary</option>
                <option value="Joint">Joint</option>
                <option value="Guarantor">Guarantor</option>
              </select>
              {errors?.pdc_ownership && (
                <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_ownership}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* COMMON REFERENCE DETAILS FIELD */}
      <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
        <label className="block text-xs font-black text-gray-400 uppercase tracking-wider mb-2">
          Reference Details *
        </label>
        <textarea
          rows={4}
          placeholder="Enter any additional reference information or special instructions..."
          value={formData.pdc_reference_details}
          onChange={(e) => updateFormData({ pdc_reference_details: e.target.value })}
          className={`w-full px-4 py-3 bg-white dark:bg-gray-900 border rounded-xl font-medium outline-none transition-all resize-none ${
            errors?.pdc_reference_details 
              ? 'border-red-500 focus:border-red-500' 
              : 'border-gray-200 dark:border-gray-700 focus:border-brand-500'
          }`}
        />
        {errors?.pdc_reference_details && (
          <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.pdc_reference_details}</p>
        )}
      </div>
    </div>
  );
};

export default StepPdcSecurity;
