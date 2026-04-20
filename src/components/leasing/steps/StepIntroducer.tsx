import React from "react";
import { GroupIcon, PlusIcon, TrashBinIcon } from "../../../icons";

interface StepIntroducerProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepIntroducer: React.FC<StepIntroducerProps> = ({ formData, updateFormData }) => {
  const addIntroducer = () => {
    const newIntroducer = {
      name: "",
      mobile: "",
      nic: "",
      address: "",
    };
    updateFormData({ introducers: [...formData.introducers, newIntroducer] });
  };

  const removeIntroducer = (index: number) => {
    const newList = [...formData.introducers];
    newList.splice(index, 1);
    updateFormData({ introducers: newList });
  };

  const updateIntroducer = (index: number, fields: any) => {
    const newList = [...formData.introducers];
    newList[index] = { ...newList[index], ...fields };
    updateFormData({ introducers: newList });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div>
          <h3 className="text-lg font-bold">Introducers</h3>
          <p className="text-sm text-gray-500">Add details of people who introduced this customer</p>
        </div>
        <button 
          onClick={addIntroducer}
          className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all"
        >
          <PlusIcon className="w-5 h-5" /> Add Introducer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {formData.introducers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 opacity-60">
             <GroupIcon className="w-12 h-12 mb-4 text-gray-400" />
             <p className="font-bold text-gray-500">No introducers added yet</p>
             <p className="text-sm text-gray-400">Click the button above to add one</p>
          </div>
        ) : (
          formData.introducers.map((intro: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm group hover:border-brand-500/50 transition-all">
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                     <span className="w-8 h-8 flex items-center justify-center bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold rounded-lg text-sm">
                        {idx + 1}
                     </span>
                     <h4 className="font-bold uppercase tracking-wider text-xs text-gray-400">Introducer Details</h4>
                  </div>
                  <button 
                    onClick={() => removeIntroducer(idx)}
                    className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 rounded-lg transition-all"
                    >
                    <TrashBinIcon className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Name</label>
                    <input 
                      type="text" 
                      value={intro.name}
                      onChange={(e) => updateIntroducer(idx, { name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">NIC</label>
                    <input 
                      type="text" 
                      value={intro.nic}
                      onChange={(e) => updateIntroducer(idx, { nic: e.target.value })}
                      placeholder="National ID"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Mobile</label>
                    <input 
                      type="text" 
                      value={intro.mobile}
                      onChange={(e) => updateIntroducer(idx, { mobile: e.target.value })}
                      placeholder="Contact Number"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Address</label>
                    <input 
                      type="text" 
                      value={intro.address}
                      onChange={(e) => updateIntroducer(idx, { address: e.target.value })}
                      placeholder="Home Address"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
                    />
                  </div>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepIntroducer;
