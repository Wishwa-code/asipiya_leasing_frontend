import React, { useState, useEffect } from "react";
import { GroupIcon, PlusIcon, TrashBinIcon } from "../../../icons";
import apiClient from "../../../api/apiClient";

interface StepIntroducerProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepIntroducer: React.FC<StepIntroducerProps> = ({ formData, updateFormData }) => {
  const [availableIntroducers, setAvailableIntroducers] = useState<any[]>([]);

  useEffect(() => {
    apiClient.get("/introducers")
      .then((res) => {
        setAvailableIntroducers(res.data || []);
      })
      .catch((err) => {
        console.error("Failed to fetch introducers", err);
      });
  }, []);

  const addIntroducer = () => {
    const newIntroducer = {
      introducer_id: "",
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

  const handleSelectIntroducer = (index: number, introducerId: string) => {
    const selected = availableIntroducers.find(i => (i.ID || i.id || "").toString() === introducerId);
    if (selected) {
      updateIntroducer(index, {
        introducer_id: introducerId,
        name: selected.name,
        mobile: selected.primary_contact,
        nic: selected.registration_no,
        address: selected.address,
      });
    } else {
      updateIntroducer(index, {
        introducer_id: "",
        name: "",
        mobile: "",
        nic: "",
        address: "",
      });
    }
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
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Select Introducer</label>
                    <select 
                      value={intro.introducer_id || ""}
                      onChange={(e) => handleSelectIntroducer(idx, e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
                    >
                      <option value="" disabled>Select an Introducer</option>
                      {availableIntroducers.map(opt => (
                        <option key={opt.ID || opt.id} value={(opt.ID || opt.id).toString()}>
                          {opt.name} {opt.registration_no ? `- ${opt.registration_no}` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {intro.introducer_id && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Name</label>
                        <div className="w-full p-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                          {intro.name || "-"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">NIC</label>
                        <div className="w-full p-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                          {intro.nic || "-"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Mobile</label>
                        <div className="w-full p-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                          {intro.mobile || "-"}
                        </div>
                      </div>
                      <div className="md:col-span-3">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Address</label>
                        <div className="w-full p-2.5 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-300">
                          {intro.address || "-"}
                        </div>
                      </div>
                    </>
                  )}
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepIntroducer;
