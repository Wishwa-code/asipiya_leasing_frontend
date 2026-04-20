import React from "react";
import { GroupIcon, PlusIcon, TrashBinIcon } from "../../../icons";

interface StepGuarantorsProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepGuarantors: React.FC<StepGuarantorsProps> = ({ formData, updateFormData }) => {
  const addGuarantor = () => {
    const newGuarantor = {
      name: "",
      mobile: "",
      nic: "",
      address: "",
      relationship: "Friend"
    };
    updateFormData({ guarantors: [...formData.guarantors, newGuarantor] });
  };

  const removeGuarantor = (index: number) => {
    const newList = [...formData.guarantors];
    newList.splice(index, 1);
    updateFormData({ guarantors: newList });
  };

  const updateGuarantor = (index: number, fields: any) => {
    const newList = [...formData.guarantors];
    newList[index] = { ...newList[index], ...fields };
    updateFormData({ guarantors: newList });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Guarantors</h3>
          <p className="text-sm text-gray-500 font-medium">Add individuals who will guarantee this lease agreement</p>
        </div>
        <button 
          onClick={addGuarantor}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <PlusIcon className="w-5 h-5" /> Add Guarantor
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {formData.guarantors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-60">
             <GroupIcon className="w-12 h-12 mb-4 text-gray-400" />
             <p className="font-bold text-gray-500">No guarantors added yet</p>
             <p className="text-sm text-gray-400">At least one guarantor is usually required</p>
          </div>
        ) : (
          formData.guarantors.map((guar: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm group hover:border-brand-500/50 transition-all">
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <span className="w-10 h-10 flex items-center justify-center bg-brand-500 text-white font-black rounded-full shadow-md shadow-brand-500/20">
                        {idx + 1}
                     </span>
                     <div>
                        <h4 className="font-bold text-lg uppercase tracking-tight">Guarantor {idx + 1}</h4>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Verification Phase</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => removeGuarantor(idx)}
                    className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-all"
                    >
                    <TrashBinIcon className="w-6 h-6" />
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Full Name</label>
                    <input 
                      type="text" 
                      value={guar.name}
                      onChange={(e) => updateGuarantor(idx, { name: e.target.value })}
                      placeholder="e.g. Sunil Gunawardena"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">NIC No</label>
                    <input 
                      type="text" 
                      value={guar.nic}
                      onChange={(e) => updateGuarantor(idx, { nic: e.target.value })}
                      placeholder="e.g. 198012345678"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Mobile No</label>
                    <input 
                      type="text" 
                      value={guar.mobile}
                      onChange={(e) => updateGuarantor(idx, { mobile: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Home Address</label>
                    <input 
                      type="text" 
                      value={guar.address}
                      onChange={(e) => updateGuarantor(idx, { address: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Relationship</label>
                    <select 
                      value={guar.relationship}
                      onChange={(e) => updateGuarantor(idx, { relationship: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500"
                      >
                         <option value="Friend">Friend</option>
                         <option value="Relative">Relative</option>
                         <option value="Colleague">Colleague</option>
                    </select>
                  </div>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-50 dark:border-gray-700/50 flex gap-4">
                  <button className="text-[11px] font-bold text-brand-500 hover:bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 transition-all uppercase tracking-wider">Verify NIC Copy</button>
                  <button className="text-[11px] font-bold text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 transition-all uppercase tracking-wider">Upload Utility Bill</button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepGuarantors;
