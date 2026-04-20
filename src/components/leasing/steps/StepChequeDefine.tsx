import React, { useMemo } from "react";
import { ListIcon, PlusIcon, TrashBinIcon, DollarLineIcon } from "../../../icons";

interface StepChequeDefineProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepChequeDefine: React.FC<StepChequeDefineProps> = ({ formData, updateFormData }) => {
  const addCheque = () => {
    const newCheque = {
      bank: "",
      cheque_no: "",
      amount: "0.00",
      date: "",
    };
    updateFormData({ cheques: [...formData.cheques, newCheque] });
  };

  const removeCheque = (index: number) => {
    const newList = [...formData.cheques];
    newList.splice(index, 1);
    updateFormData({ cheques: newList });
  };

  const updateCheque = (index: number, fields: any) => {
    const newList = [...formData.cheques];
    newList[index] = { ...newList[index], ...fields };
    updateFormData({ cheques: newList });
  };

  const totalAmount = useMemo(() => {
    return formData.cheques.reduce((acc: number, curr: any) => acc + (parseFloat(curr.amount) || 0), 0);
  }, [formData.cheques]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div>
                        <h3 className="text-lg font-bold">Cheque Definitions</h3>
                        <p className="text-sm text-gray-500 font-medium">Define installment cheques provided by the customer</p>
                    </div>
                    <button 
                        onClick={addCheque}
                        className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
                    >
                        <PlusIcon className="w-5 h-5" /> Add Cheque
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                             <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-4">No.</th>
                                <th className="px-6 py-4">Cheque No</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                             </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                            {formData.cheques.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 italic font-bold opacity-60">
                                       No cheques defined yet.
                                    </td>
                                </tr>
                            ) : (
                                formData.cheques.map((chq: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="w-6 h-6 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-black text-gray-500">
                                                {idx + 1}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text" 
                                                value={chq.cheque_no}
                                                onChange={(e) => updateCheque(idx, { cheque_no: e.target.value })}
                                                placeholder="Cheque No"
                                                className="bg-transparent border-0 font-bold text-sm outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <input 
                                                type="text" 
                                                value={chq.amount}
                                                onChange={(e) => updateCheque(idx, { amount: e.target.value })}
                                                className="bg-transparent border-0 font-bold text-sm text-brand-600 dark:text-brand-400 outline-none"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 px-2 py-1 rounded-full font-black uppercase">Valid</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
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

          <div className="space-y-6">
              <div className="bg-gray-900 dark:bg-brand-950 p-8 rounded-3xl text-white shadow-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[2px] opacity-60 mb-2">CHEQUE TOTALS</p>
                    <h2 className="text-3xl font-black mb-6">LKR {totalAmount.toLocaleString()}</h2>
                    
                    <div className="space-y-4 pt-6 border-t border-white/10">
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-60">Total Installments</span>
                            <span className="font-bold">LKR {parseFloat(formData.total_payable).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="opacity-60">Remaining Balance</span>
                            <span className={`font-bold ${totalAmount === parseFloat(formData.total_payable) ? 'text-success-400' : 'text-orange-400'}`}>
                                LKR {(parseFloat(formData.total_payable) - totalAmount).toLocaleString()}
                            </span>
                        </div>
                    </div>
              </div>

              <div className="bg-brand-50/50 dark:bg-brand-500/5 p-6 rounded-2xl border border-brand-100 dark:border-brand-500/10">
                 <h4 className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest mb-2">AUTO REPLICATE</h4>
                 <p className="text-xs text-brand-900/60 dark:text-brand-100/60 mb-4 font-medium leading-relaxed">System can automatically generate consecutive cheque numbers based on the first entry.</p>
                 <button className="w-full py-2 bg-brand-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-brand-600 transition-all">Generate Series</button>
              </div>
          </div>
      </div>
    </div>
  );
};

export default StepChequeDefine;
