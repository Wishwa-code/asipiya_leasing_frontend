import React, { useState, useEffect } from "react";
import { GroupIcon, PlusIcon, TrashBinIcon, CheckCircleIcon } from "../../../icons";
import apiClient from "../../../api/apiClient";

interface StepGuarantorsProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepGuarantors: React.FC<StepGuarantorsProps> = ({ formData, updateFormData }) => {
  const requiredCount = parseInt(formData.required_guarantor_count) || 0;
  const currentCount = formData.guarantors?.length || 0;
  const isProductSelected = !!formData.product_id;
  const isLimitReached = currentCount >= requiredCount;
  const isRequirementMet = currentCount >= requiredCount;

  const [customers, setCustomers] = useState<any[]>([]);
  const [loadingCus, setLoadingCus] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCus(true);
      try {
        const res = await apiClient.get("/customers");
        setCustomers(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      } finally {
        setLoadingCus(false);
      }
    };
    fetchCustomers();
  }, []);

  const addGuarantor = () => {
    if (isLimitReached && isProductSelected) return;

    const newGuarantor = {
      customer_id: null,
      name: "",
      mobile: "",
      nic: "",
      address: "",
      relationship: "Friend",
      type: "Friend",
      guarantor_index: currentCount + 1
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
    if (fields.relationship) {
      newList[index].type = fields.relationship;
    }
    updateFormData({ guarantors: newList });
  };

  const handleSelectCustomer = (idx: number, customerIdVal: string) => {
    const customerId = parseInt(customerIdVal) || null;
    const customer = customers.find((c: any) => (c.ID || c.id) === customerId);

    const newList = [...formData.guarantors];
    if (customer) {
      const parts = [
        customer.permanent_address_line1,
        customer.permanent_address_line2,
        customer.permanent_address_line3
      ].filter(Boolean);
      const fullAddress = parts.join(", ");

      newList[idx] = {
        ...newList[idx],
        customer_id: customer.ID || customer.id,
        name: customer.full_name,
        nic: customer.new_nic || customer.old_nic || "",
        mobile: customer.contact_no || "",
        address: fullAddress,
      };
    } else {
      newList[idx] = {
        ...newList[idx],
        customer_id: null,
        name: "",
        nic: "",
        mobile: "",
        address: "",
      };
    }
    updateFormData({ guarantors: newList });
  };

  const getAvailableCustomers = (currentIdx: number) => {
    const selectedIds = formData.guarantors
      .map((g: any, i: number) => i !== currentIdx ? g.customer_id : null)
      .filter(Boolean);

    return customers.filter((c: any) => {
      const cid = c.ID || c.id;
      // Exclude main applicant customer
      if (formData.customer_db_id && cid === formData.customer_db_id) return false;
      // Exclude already selected guarantors in other slots
      if (selectedIds.includes(cid)) return false;
      return true;
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dynamic Status Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold">Guarantors Verification</h3>
            {!isProductSelected ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                Product Not Selected
              </span>
            ) : isRequirementMet ? (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" /> Requirement Met
              </span>
            ) : (
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse">
                Verification Pending
              </span>
            )}
          </div>
          
          {isProductSelected ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              The selected product <strong className="text-brand-500 dark:text-brand-400">{formData.product_item || "Lease"}</strong> requires exactly <strong className="text-gray-800 dark:text-white">{requiredCount}</strong> guarantor(s).
            </p>
          ) : (
            <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
              Please go back to the Product details step to select a product and view its requirements.
            </p>
          )}

          {/* Progress Bar */}
          {isProductSelected && (
            <div className="space-y-1.5 max-w-md">
              <div className="flex justify-between text-xs font-bold text-gray-405 dark:text-gray-550 uppercase tracking-wide">
                <span>Add Progress</span>
                <span>{currentCount} of {requiredCount} Added</span>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 rounded-full ${
                    isRequirementMet ? "bg-green-500" : "bg-brand-500"
                  }`}
                  style={{ width: `${Math.min((currentCount / requiredCount) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={addGuarantor}
          disabled={!isProductSelected || isLimitReached || loadingCus}
          className={`px-6 py-3 font-bold rounded-xl shadow-sm flex items-center gap-2 transition-all text-sm select-none ${
            !isProductSelected 
              ? "bg-gray-100 dark:bg-gray-700 text-gray-405 dark:text-gray-550 cursor-not-allowed"
              : isLimitReached
              ? "bg-gray-100 dark:bg-gray-700 text-gray-450 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-750"
              : "bg-brand-500 hover:bg-brand-600 text-white hover:shadow-brand-500/20 hover:shadow-lg active:scale-[0.98]"
          }`}
        >
          <PlusIcon className="w-4 h-4" /> 
          {isLimitReached ? "Limit Reached" : "Add Guarantor"}
        </button>
      </div>

      {/* Guarantors Form Cards */}
      <div className="grid grid-cols-1 gap-6">
        {currentCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 opacity-80">
             <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl mb-4 text-gray-400">
               <GroupIcon className="w-12 h-12" />
             </div>
             <p className="font-bold text-gray-600 dark:text-gray-300">No guarantors added yet</p>
             <p className="text-sm text-gray-400 mt-1">
               {isProductSelected 
                 ? `At least ${requiredCount} guarantor(s) must be added for this lease loan.`
                 : "Select a product and add the required number of guarantors."}
             </p>
          </div>
        ) : (
          formData.guarantors.map((guar: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm group hover:border-brand-500/30 transition-all duration-300 relative overflow-hidden">
               {/* Left accent bar */}
               <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                     <span className="w-10 h-10 flex items-center justify-center bg-brand-500 text-white font-black rounded-xl shadow-md shadow-brand-500/10 uppercase text-sm tracking-wider">
                        G{idx + 1}
                     </span>
                     <div>
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white uppercase tracking-tight">Guarantor {idx + 1}</h4>
                        <p className="text-[10px] text-gray-450 font-bold uppercase tracking-wider">Verification Phase</p>
                     </div>
                  </div>
                  <button 
                    onClick={() => removeGuarantor(idx)}
                    className="p-2 text-gray-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-950/20 rounded-xl transition-all"
                    title="Remove Guarantor"
                  >
                    <TrashBinIcon className="w-5 h-5" />
                  </button>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-450 uppercase mb-1.5 ml-1">Select Customer as Guarantor</label>
                    <select 
                      value={guar.customer_id || ""}
                      onChange={(e) => handleSelectCustomer(idx, e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none transition-colors"
                    >
                      <option value="">Choose Customer...</option>
                      {getAvailableCustomers(idx).map((c: any) => (
                        <option key={c.ID || c.id} value={c.ID || c.id}>
                          {c.full_name} ({c.new_nic || c.old_nic || "No NIC"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-450 uppercase mb-1.5 ml-1">NIC No</label>
                    <input 
                      type="text" 
                      value={guar.nic}
                      disabled
                      placeholder="Select a customer"
                      className="w-full p-2.5 bg-gray-100 dark:bg-gray-900/40 border border-gray-250 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none transition-colors cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-455 uppercase mb-1.5 ml-1">Mobile No</label>
                    <input 
                      type="text" 
                      value={guar.mobile}
                      disabled
                      placeholder="Select a customer"
                      className="w-full p-2.5 bg-gray-100 dark:bg-gray-900/40 border border-gray-250 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none transition-colors cursor-not-allowed"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-xs font-bold text-gray-455 uppercase mb-1.5 ml-1">Home Address</label>
                    <input 
                      type="text" 
                      value={guar.address}
                      disabled
                      placeholder="Select a customer"
                      className="w-full p-2.5 bg-gray-100 dark:bg-gray-900/40 border border-gray-250 dark:border-gray-700 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 outline-none transition-colors cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-455 uppercase mb-1.5 ml-1">Relationship</label>
                    <select 
                      value={guar.relationship}
                      onChange={(e) => updateGuarantor(idx, { relationship: e.target.value })}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none transition-colors"
                    >
                         <option value="Friend">Friend</option>
                         <option value="Relative">Relative</option>
                         <option value="Colleague">Colleague</option>
                    </select>
                  </div>
               </div>

               <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700/50 flex flex-wrap gap-4">
                  <button className="text-[10px] font-extrabold text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/20 px-4.5 py-2 rounded-xl border border-brand-100 dark:border-brand-500/20 transition-all uppercase tracking-wider select-none active:scale-95">
                    Verify NIC Copy
                  </button>
                  <button className="text-[10px] font-extrabold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700/50 px-4.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 transition-all uppercase tracking-wider select-none active:scale-95">
                    Upload Utility Bill
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StepGuarantors;
