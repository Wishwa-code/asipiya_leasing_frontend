import React, { useEffect } from "react";
import { PRODUCT_ITEMS } from "../../../constants/leasingConstants";
import { PlugInIcon, DollarLineIcon } from "../../../icons";
import { calculateInstallments } from "../../../utils/leasingUtils";

interface StepLeaseDetailsProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepLeaseDetails: React.FC<StepLeaseDetailsProps> = ({ formData, updateFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  // Recalculate totals whenever loan amount, rate or period changes
  useEffect(() => {
    const amount = parseFloat(formData.loan_amount) || 0;
    const rate = parseFloat(formData.interest_rate) || 0;
    const months = parseInt(formData.period) || 0;

    const { monthlyInstallment, totalInterest, totalPayable } = calculateInstallments(amount, rate, months);

    updateFormData({
        installments_total: monthlyInstallment.toString(),
        total_interest: totalInterest.toString(),
        total_payable: totalPayable.toString()
    });
  }, [formData.loan_amount, formData.interest_rate, formData.period]);

  const syncInvoiceValue = () => {
    updateFormData({ loan_amount: formData.invoice_value });
  };

  const syncMarketValue = () => {
    updateFormData({ loan_amount: formData.market_value });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Product Selection */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><PlugInIcon className="w-4 h-4" /></div> PRODUCT SELECTION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Marketing Executive</label>
                        <select name="marketing_executive_id" value={formData.marketing_executive_id} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none font-semibold">
                            <option value="">Select Executive</option>
                            <option value="1">Admin - Jayantha</option>
                            <option value="2">Executive - Perera</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Product Item</label>
                        <select name="product_item" value={formData.product_item} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none font-semibold">
                            <option value="">Select Item</option>
                            {PRODUCT_ITEMS.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><DollarLineIcon className="w-4 h-4" /></div> FINANCIAL CONFIGURATION
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <div className="flex justify-between items-center mb-1.5 mr-1">
                             <label className="block text-xs font-bold text-gray-500 uppercase ml-1">Loan Amount</label>
                             <div className="flex gap-2">
                                <button onClick={syncInvoiceValue} className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-100 font-bold uppercase tracking-tight">Inv</button>
                                <button onClick={syncMarketValue} className="text-[10px] bg-brand-50 text-brand-600 px-1.5 py-0.5 rounded border border-brand-100 font-bold uppercase tracking-tight">Mkt</button>
                             </div>
                        </div>
                        <input type="text" name="loan_amount" value={formData.loan_amount} onChange={handleChange} className="w-full p-2.5 bg-brand-50/30 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 rounded-xl text-lg font-bold text-brand-600 dark:text-brand-400 focus:border-brand-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Period (Months)</label>
                        <input type="number" name="period" value={formData.period} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold outline-none focus:border-brand-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Interest Rate (%)</label>
                        <input type="text" name="interest_rate" value={formData.interest_rate} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-lg font-bold outline-none focus:border-brand-500" />
                    </div>
                </div>
            </div>
        </div>

        {/* Right Column: Calculations Summary */}
        <div className="space-y-6">
            <div className="bg-brand-600 dark:bg-brand-500 p-8 rounded-3xl text-white shadow-brand-500/30 shadow-xl border border-brand-700/50">
                 <p className="text-[10px] font-bold uppercase tracking-[2px] opacity-70 mb-1 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> ESTIMATED INSTALLMENT
                 </p>
                 <h2 className="text-4xl font-black mb-6">LKR {parseFloat(formData.installments_total).toLocaleString()}</h2>
                 
                 <div className="space-y-4 pt-6 border-t border-white/20">
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold opacity-70 italic">Total Interest</span>
                        <span className="font-black text-lg">LKR {parseFloat(formData.total_interest).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold opacity-70 italic">Total Payable</span>
                        <span className="font-black text-lg">LKR {parseFloat(formData.total_payable).toLocaleString()}</span>
                    </div>
                 </div>
            </div>

            <button className="w-full py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-brand-600 dark:text-brand-400 shadow-theme-sm hover:shadow-theme-md transition-all flex items-center justify-center gap-3 active:scale-95">
                GENERATE REPAYMENT SCHEDULE
            </button>
        </div>

      </div>
    </div>
  );
};

export default StepLeaseDetails;
