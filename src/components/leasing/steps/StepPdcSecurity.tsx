import React from "react";
import { BANKS, PDC_STATUSES } from "../../../constants/leasingConstants";
import { DollarLineIcon, PlusIcon, TrashBinIcon } from "../../../icons";

interface StepPdcSecurityProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepPdcSecurity: React.FC<StepPdcSecurityProps> = ({ formData, updateFormData }) => {
  const addSecurity = () => {
    const newSecurity = {
      identification: "Cheque",
      status: "In Hand",
      bank: "Sampath",
      date: "",
      no: "",
      ownership: "Primary",
      reference: ""
    };
    updateFormData({ pdc_securities: [...formData.pdc_securities, newSecurity] });
  };

  const removeSecurity = (index: number) => {
    const newList = [...formData.pdc_securities];
    newList.splice(index, 1);
    updateFormData({ pdc_securities: newList });
  };

  const updateSecurity = (index: number, fields: any) => {
    const newList = [...formData.pdc_securities];
    newList[index] = { ...newList[index], ...fields };
    updateFormData({ pdc_securities: newList });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">PDC Securities</h3>
          <p className="text-sm text-gray-500 font-medium">Post-dated cheques and other security documents held</p>
        </div>
        <button 
          onClick={addSecurity}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <PlusIcon className="w-5 h-5" /> Add Security Item
        </button>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[2px]">
              <th className="px-6 py-4">Identification</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Bank</th>
              <th className="px-6 py-4">Security No / Ref</th>
              <th className="px-6 py-4">Ownership</th>
              <th className="px-6 py-4 text-right">Delete</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {formData.pdc_securities.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center text-gray-400 font-bold italic">
                   No security items defined.
                </td>
              </tr>
            ) : (
              formData.pdc_securities.map((sec: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                  <td className="px-4 py-3">
                    <select 
                      value={sec.identification}
                      onChange={(e) => updateSecurity(idx, { identification: e.target.value })}
                      className="w-full p-2 bg-transparent border-0 font-bold text-sm text-gray-900 dark:text-gray-100 outline-none"
                      >
                         <option value="Cheque">Cheque</option>
                         <option value="CR Book">CR Book</option>
                         <option value="Deed">Deed</option>
                         <option value="Utility Bill">Utility Bill</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={sec.status}
                      onChange={(e) => updateSecurity(idx, { status: e.target.value })}
                      className={`w-full p-2 bg-transparent border-0 font-bold text-xs uppercase tracking-wider outline-none ${
                        sec.status === 'In Hand' ? 'text-success-600' : 'text-orange-500'
                      }`}
                      >
                         {PDC_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select 
                      value={sec.bank}
                      onChange={(e) => updateSecurity(idx, { bank: e.target.value })}
                      className="w-full p-2 bg-transparent border-0 text-sm font-semibold outline-none"
                      >
                         {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input 
                      type="text" 
                      value={sec.no}
                      onChange={(e) => updateSecurity(idx, { no: e.target.value })}
                      placeholder="No / Ref"
                      className="w-full p-2 bg-transparent border-0 text-sm font-bold placeholder:font-normal outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                     <select 
                      value={sec.ownership}
                      onChange={(e) => updateSecurity(idx, { ownership: e.target.value })}
                      className="w-full p-2 bg-transparent border-0 text-sm font-semibold outline-none"
                      >
                         <option value="Primary">Primary</option>
                         <option value="Joint">Joint</option>
                         <option value="Guarantor">Guarantor</option>
                    </select>
                  </td>
                  <td className="px-6 py-3 text-right">
                    <button 
                      onClick={() => removeSecurity(idx)}
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
  );
};

export default StepPdcSecurity;
