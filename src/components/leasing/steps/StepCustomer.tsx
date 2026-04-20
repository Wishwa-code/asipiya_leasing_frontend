import React, { useState } from "react";
import InputField from "../../form/input/InputField";
import { UserCircleIcon } from "../../../icons";

interface StepCustomerProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepCustomer: React.FC<StepCustomerProps> = ({ formData, updateFormData }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!searchTerm) return;
    setIsSearching(true);
    // Mocking search logic
    setTimeout(() => {
      updateFormData({
        customer_id: "CUST-001",
        customer_name: "Jayantha Perera",
        bank_account_id: "BANK-001"
      });
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Search Header */}
      <div className="bg-brand-50/50 dark:bg-brand-500/5 p-6 rounded-2xl border border-brand-100 dark:border-brand-500/10">
        <h3 className="text-sm font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            SELECT CUSTOMER
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by NIC, Business Reg No or Name..."
              className="w-full pl-4 pr-12 py-3.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 transition-all"
            />
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-2 bottom-2 px-4 bg-brand-500 text-white rounded-lg font-semibold text-xs hover:bg-brand-600 transition-colors flex items-center gap-2"
              >
              {isSearching ? (
                 <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : "Search"}
            </button>
          </div>
          <button className="px-6 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-brand-500 font-bold rounded-xl text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            + New Customer
          </button>
        </div>
      </div>

      {formData.customer_id && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customer Basic Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 bg-brand-50 dark:bg-brand-500/10 rounded-full flex items-center justify-center text-brand-500">
                    <UserCircleIcon className="w-10 h-10" />
                 </div>
                 <div>
                    <h4 className="text-xl font-bold">{formData.customer_name}</h4>
                    <p className="text-sm text-gray-500 font-medium">{formData.customer_id}</p>
                 </div>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">NIC / REG NO</span>
                    <span className="text-sm font-semibold">198512345678</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">MOBILE</span>
                    <span className="text-sm font-semibold">071 234 5678</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700/50">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">ADDRESS</span>
                    <span className="text-sm font-semibold text-right">No 123, Galle Road, Colombo</span>
                </div>
            </div>
          </div>

          {/* KYC & Bank Info */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
            <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">KYC STATUS</h4>
                <div className="flex items-center gap-3 p-4 bg-success-50 dark:bg-success-500/10 rounded-xl border border-success-100 dark:border-success-500/20 mb-6">
                    <div className="p-2 bg-success-500 text-white rounded-full">
                        <UserCircleIcon className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-success-700">KYC VERIFIED</p>
                        <p className="text-xs text-success-600 font-medium">Last updated 2 days ago</p>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">SELECT BANK ACCOUNT</label>
                <select 
                   value={formData.bank_account_id}
                   onChange={(e) => updateFormData({ bank_account_id: e.target.value })}
                   className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                   >
                    <option value="BANK-001">Sampath Bank - 1009 **** 1234</option>
                    <option value="BANK-002">Commercial Bank - 8002 **** 5678</option>
                </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StepCustomer;
