import React, { useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import "./Leasing.css";

import { useLeaseForm } from "../../hooks/useLeaseForm";
import {
  UserCircleIcon,
  GroupIcon,
  BoxIcon,
  CheckCircleIcon,
  PlugInIcon,
  DollarLineIcon,
  ListIcon,
  DocsIcon,
  AngleLeftIcon,
  AngleRightIcon
} from "../../icons";

const STEPS = [
  { id: 1, label: "Customer", icon: <UserCircleIcon /> },
  { id: 2, label: "Introducers", icon: <GroupIcon /> },
  { id: 3, label: "Vehicle", icon: <BoxIcon /> },
  { id: 4, label: "Insurance", icon: <CheckCircleIcon /> },
  { id: 5, label: "Product", icon: <PlugInIcon /> },
  { id: 6, label: "Guarantors", icon: <GroupIcon /> },
  { id: 7, label: "PDC Security", icon: <DollarLineIcon /> },
  { id: 8, label: "Cheque Define", icon: <ListIcon /> },
  { id: 9, label: "CR & Docs", icon: <DocsIcon /> },
];

import StepCustomer from "../../components/leasing/steps/StepCustomer";
import StepIntroducer from "../../components/leasing/steps/StepIntroducer";
import StepVehicleAsset from "../../components/leasing/steps/StepVehicleAsset";
import StepInsurance from "../../components/leasing/steps/StepInsurance";
import StepLeaseDetails from "../../components/leasing/steps/StepLeaseDetails";
import StepGuarantors from "../../components/leasing/steps/StepGuarantors";
import StepPdcSecurity from "../../components/leasing/steps/StepPdcSecurity";
import StepChequeDefine from "../../components/leasing/steps/StepChequeDefine";
import StepCrDocs from "../../components/leasing/steps/StepCrDocs";

const CreateLeasing: React.FC = () => {
  const { formData, activeStep, nextStep, prevStep, goToStep, updateFormData } = useLeaseForm();

  const renderStep = () => {
    switch (activeStep) {
      case 1: return <StepCustomer formData={formData} updateFormData={updateFormData} />;
      case 2: return <StepIntroducer formData={formData} updateFormData={updateFormData} />;
      case 3: return <StepVehicleAsset formData={formData} updateFormData={updateFormData} />;
      case 4: return <StepInsurance formData={formData} updateFormData={updateFormData} />;
      case 5: return <StepLeaseDetails formData={formData} updateFormData={updateFormData} />;
      case 6: return <StepGuarantors formData={formData} updateFormData={updateFormData} />;
      case 7: return <StepPdcSecurity formData={formData} updateFormData={updateFormData} />;
      case 8: return <StepChequeDefine formData={formData} updateFormData={updateFormData} />;
      case 9: return <StepCrDocs formData={formData} updateFormData={updateFormData} />;
      default: return <StepCustomer formData={formData} updateFormData={updateFormData} />;
    }
  };

  return (
    <div className="pb-20 relative antialiased text-gray-900 dark:text-white">
      <PageMeta
        title="New Leasing Application | Asipiya Leasing"
        description="Create a new finance lease application"
      />

      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md pt-5 pb-4 px-4 sm:px-6 -mx-4 sm:-mx-6 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 max-w-[1600px] mx-auto">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              New Leasing Application
            </h1>
            <div className="flex items-center gap-4 mt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Draft ID: <span className="text-brand-500 font-bold">LSE-2026-0001</span>
                </p>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status: <span className="text-orange-500 font-bold">Draft</span>
                </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-theme-xs flex items-center justify-center gap-2">
               Save Draft
            </button>
            <button className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-theme-sm border border-brand-600 flex items-center justify-center gap-2">
               Submit Application
            </button>
          </div>
        </div>

        {/* Stepper Inside Header for better visibility */}
        <div className="mt-6 max-w-[1600px] mx-auto overflow-x-auto no-scrollbar pb-1">
          <div className="flex items-center gap-4 min-w-[1000px]">
            {STEPS.map((step) => (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all grow group ${
                  activeStep === step.id 
                  ? "bg-white dark:bg-gray-800 shadow-theme-sm ring-1 ring-brand-500/10" 
                  : "opacity-60 hover:opacity-100"
                }`}
              >
                <div className={`p-2 rounded-lg ${
                  activeStep === step.id 
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/20" 
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500"
                }`}>
                  {React.cloneElement(step.icon as React.ReactElement, { className: "w-5 h-5" })}
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    activeStep === step.id ? "text-brand-500" : "text-gray-400"
                  }`}>
                    Step 0{step.id}
                  </p>
                  <p className={`text-sm font-bold truncate ${
                    activeStep === step.id ? "text-gray-900 dark:text-white" : "text-gray-500"
                  }`}>
                    {step.label}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="mt-8 max-w-[1600px] mx-auto min-h-[60vh]">
          {/* Main Content Render based on step */}
          <div className="min-h-[400px]">
             {renderStep()}
          </div>

          {/* Sticky Navigation Footer */}
          <div className="mt-8 flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-theme-lg sticky bottom-4 z-30">
              <button 
                onClick={prevStep}
                disabled={activeStep === 1}
                className="flex items-center gap-2 px-5 py-2.5 font-bold text-gray-600 disabled:opacity-30 hover:text-brand-500 transition-colors"
                >
                <AngleLeftIcon className="w-5 h-5" /> Previous Step
              </button>
              
              <div className="flex items-center gap-2">
                 {STEPS.map(s => (
                   <div key={s.id} className={`w-2 h-2 rounded-full ${s.id === activeStep ? 'bg-brand-500 w-6' : 'bg-gray-200'} transition-all`}></div>
                 ))}
              </div>

              <button 
                onClick={nextStep}
                disabled={activeStep === 9}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-theme-sm disabled:opacity-30"
                >
                Next Step <AngleRightIcon className="w-5 h-5" />
              </button>
          </div>
      </div>
    </div>
  );
};

export default CreateLeasing;
