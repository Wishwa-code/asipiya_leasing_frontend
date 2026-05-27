import React, { useState, useEffect } from "react";
import { CheckCircleIcon } from "../../../icons";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../form/date-picker";

interface StepInsuranceProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepInsurance: React.FC<StepInsuranceProps> = ({ formData, updateFormData }) => {
  const [insuranceCompanies, setInsuranceCompanies] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/insuarance-companies")
      .then((res) => {
        setInsuranceCompanies(res.data?.data || res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch insurance companies", err);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><CheckCircleIcon className="w-4 h-4" /></div> INSURANCE COVERAGE
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Insurance Company</label>
            <select name="insurance_company" value={formData.insurance_company} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none">
              <option value="">Select Company</option>
              {insuranceCompanies.map(c => <option key={c.ID || c.id} value={c.company_name}>{c.company_name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Sum Insured (Amount)</label>
            <input type="text" name="insurance_amount" value={formData.insurance_amount} onChange={handleChange} placeholder="0.00" className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Annual Premium</label>
            <input type="text" name="insurance_premium" value={formData.insurance_premium} onChange={handleChange} placeholder="0.00" className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Cover Start Date</label>
            <DatePicker
              id="insurance_start_date"
              placeholder="Select start date"
              defaultDate={formData.insurance_start_date || ""}
              onChange={(_dates, dateStr) => updateFormData({ insurance_start_date: dateStr })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Cover Expiry Date</label>
            <DatePicker
              id="insurance_expiry_date"
              placeholder="Select expiry date"
              defaultDate={formData.insurance_expiry_date || ""}
              onChange={(_dates, dateStr) => updateFormData({ insurance_expiry_date: dateStr })}
            />
          </div>
        </div>
      </div>
      
      <div className="bg-brand-50/50 dark:bg-brand-500/5 p-6 rounded-2xl border border-dashed border-brand-200 dark:border-brand-500/20 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-brand-500 border border-brand-100 dark:border-brand-500/20 shadow-sm">
                  <CheckCircleIcon className="w-6 h-6" />
              </div>
              <div>
                  <h4 className="text-sm font-bold uppercase tracking-wider">Policy Document</h4>
                  <p className="text-xs text-gray-500">Upload a scan or photo of the current insurance policy</p>
              </div>
          </div>
          <button className="px-6 py-2 bg-brand-500 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-brand-600 transition-colors">
              Upload Policy
          </button>
      </div>
    </div>
  );
};

export default StepInsurance;
