import React from "react";
import { DocsIcon, DownloadIcon, CheckCircleIcon, AngleRightIcon } from "../../../icons";

interface StepCrDocsProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepCrDocs: React.FC<StepCrDocsProps> = ({ formData, updateFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-8">
              {/* Registration Info */}
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
                       REGISTRATION DOCUMENTS
                  </h3>
                  <div className="space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">Original CR No / Ref</label>
                          <input 
                            type="text" 
                            name="original_cr_no"
                            value={formData.original_cr_no}
                            onChange={handleChange}
                            placeholder="e.g. CR-889021"
                            className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl text-lg font-black text-brand-600 dark:text-brand-400 outline-none focus:border-brand-500"
                          />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                          <div>
                              <p className="text-sm font-bold">Duplicate Key Status</p>
                              <p className="text-xs text-gray-500">Is a duplicate key held by the company?</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                              <input 
                                type="checkbox" 
                                name="duplicate_key"
                                checked={formData.duplicate_key}
                                onChange={handleChange}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                          </label>
                      </div>
                  </div>
              </div>

              {/* Final Checklist */}
              <div className="bg-success-50/30 dark:bg-success-500/5 p-8 rounded-3xl border border-success-100 dark:border-success-500/10">
                  <h3 className="text-sm font-bold text-success-700 dark:text-success-400 uppercase tracking-wider mb-4">FINAL CHECKLIST</h3>
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm font-semibold text-success-600">
                          <CheckCircleIcon className="w-4 h-4" /> Customer KYC Verified
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-success-600">
                          <CheckCircleIcon className="w-4 h-4" /> Valuation Uploaded
                      </div>
                      <div className="flex items-center gap-3 text-sm font-semibold text-success-600">
                          <CheckCircleIcon className="w-4 h-4" /> Guarantors Linked
                      </div>
                  </div>
              </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">DOCUMENT REPOSITORY</h3>
              <div className="space-y-4 grow">
                  {[
                      "Customer NIC Copy",
                      "Proof of Billing",
                      "Bank Statements (3 Months)",
                      "Income Tax Records",
                      "Lease Agreement (Signed)"
                  ].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl group hover:bg-brand-50 hover:dark:bg-brand-500/10 transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-brand-500 shadow-sm transition-colors">
                                  <DocsIcon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-brand-600">{doc}</span>
                          </div>
                          <DownloadIcon className="w-5 h-5 text-gray-300 group-hover:text-brand-500" />
                      </div>
                  ))}
              </div>
              
              <div className="mt-8 p-4 bg-brand-500 rounded-2xl text-white flex justify-between items-center shadow-lg shadow-brand-500/30">
                  <div>
                      <p className="text-xs font-bold opacity-70 italic tracking-wider">Ready for Submission</p>
                      <h4 className="font-black">Complete Draft</h4>
                  </div>
                  <AngleRightIcon className="w-8 h-8" />
              </div>
          </div>
      </div>
    </div>
  );
};

export default StepCrDocs;
