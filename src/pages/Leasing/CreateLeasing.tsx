import React, { useState } from "react";
import { Link } from "react-router";
import apiClient from "../../api/apiClient";
import PageMeta from "../../components/common/PageMeta";
import { notification } from "../../services/notification";
import { ROUTES } from "../../routes/paths";
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
  AngleRightIcon,
  AlertIcon,
  InfoIcon
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

// ─────────────────────────────────────────────────────────────────────────────
// 🛠️ DEV MODE — Set to `false` before going to production!
//    When true: bypasses all step validation so you can submit with just
//    Step 1 filled, making it easy to test the approval flow end-to-end.
// ─────────────────────────────────────────────────────────────────────────────
const DEV_MODE = true;

const CreateLeasing: React.FC = () => {
  const { formData, activeStep, draftId, stepStatuses, errors, isReadOnly, nextStep, prevStep, goToStep, updateFormData, saveDraft, resetForm } = useLeaseForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGoToStep = (step: number) => {
    goToStep(step);
  };

  const handleNextStep = () => {
    nextStep();
  };

  const submitApplication = async (devBypass = false) => {
    if (!draftId) {
      notification.warning("No draft found to submit. Please fill the customer details first.");
      return;
    }

    // ── DEV MODE: skip all validation when bypassing ──────────────────────
    if (!DEV_MODE || !devBypass) {
      // Validate all wizard steps before submission
      const requiredSteps = [1, 3, 4, 5, 7, 8, 9];
      const invalidSteps: string[] = [];

      requiredSteps.forEach(stepId => {
        if (stepStatuses[stepId] !== "complete") {
          const stepLabel = STEPS.find(s => s.id === stepId)?.label || `Step ${stepId}`;
          invalidSteps.push(stepLabel);
        }
      });

      // Check optional step 2 (Introducers)
      if (stepStatuses[2] === "error") {
        invalidSteps.push("Introducers");
      }

      // Check optional step 6 (Guarantors)
      const reqGuarCount = parseInt(String(formData.required_guarantor_count || "0")) || 0;
      if (reqGuarCount > 0) {
        if (stepStatuses[6] !== "complete") {
          invalidSteps.push("Guarantors");
        }
      } else if (stepStatuses[6] === "error") {
        invalidSteps.push("Guarantors");
      }

      if (invalidSteps.length > 0) {
        notification.error(`Cannot submit application. The following steps are incomplete or contain validation errors:`, {
          description: invalidSteps.join(", ")
        });
        return;
      }
    }
    
    setIsSubmitting(true);
    try {
      // Ensure draft is saved
      await saveDraft();

      // Transform frontend data to match backend expected 'fullData' struct
      const payload = {
        Vehicle: {
          vehicle_type_id: formData.vehicle_type_id ? parseInt(formData.vehicle_type_id) : null,
          vehicle_make_id: formData.vehicle_make_id ? parseInt(formData.vehicle_make_id) : null,
          vehicle_model_id: formData.vehicle_model_id ? parseInt(formData.vehicle_model_id) : null,
          vehicle_status: formData.vehicle_status,
          engine_cc: formData.engine_cc,
          chasis_no: formData.chassis_no,
          manufacturing_year: formData.manu_year,
          color_id: formData.color_id ? parseInt(formData.color_id) : null,
          usage: formData.usage_type,
          country_of_origin: formData.manu_country,
          type_of_body: formData.body_type,
          equipment: formData.equipment,
          registered_year: formData.reg_year,
          registration_no: formData.reg_no,
          market_value: parseFloat(formData.market_value || "0"),
          forced_sale_value: parseFloat(formData.forced_value || "0"),
          invoice_value: parseFloat(formData.invoice_value || "0"),
          supplier_id: formData.supplier_id ? parseInt(formData.supplier_id) : null,
          supplier_rno: formData.supplier_rno,
        },
        Loan: {
          product_id: parseInt(formData.product_id) || 0,
          product_item_id: formData.product_item_id ? parseInt(formData.product_item_id) : null,
          loan_amount: parseFloat(formData.loan_amount || "0"),
          loan_period: parseInt(formData.period) || 0,
          interest_rate: parseFloat(formData.interest_rate || "0"),
          interest_amount: parseFloat(formData.total_interest || "0"),
          total_loan_amount: parseFloat(formData.total_payable || "0"),
          installment_amount: parseFloat(formData.installments_total || "0"),
          disburse_amount: parseFloat(formData.disburse_amount || "0"),
          first_collection_date: formData.tcc_collection_date || "",
          inspection_date: formData.inspection_date || "",
          lending_officer_id: formData.marketing_executive_id ? parseInt(formData.marketing_executive_id) : null,
          bank_account_id: formData.bank_account_id ? parseInt(formData.bank_account_id) : null,
          branch_id: formData.branch_id ? parseInt(formData.branch_id) : 1,
          other_charges_total: parseFloat(formData.other_charges_total || "0"),
          other_charges_on_disburse: parseFloat(formData.other_charges_on_disburse || "0"),
          other_charges_on_first_installment: parseFloat(formData.other_charges_on_first_installment || "0"),
          other_charges_on_every_installments: parseFloat(formData.other_charges_on_every_installments || "0"),
        },
        Guarantors: formData.guarantors,
        PdcSecurity: {
          pdc_security_type: formData.pdc_security_type,
          cheque_details: formData.pdc_security_type === "Cheque" ? [
            {
              cheque_status: formData.pdc_cheque_status,
              bank_id: formData.pdc_bank_id ? parseInt(formData.pdc_bank_id) : null,
              cheque_date: formData.pdc_cheque_date,
              cheque_no: formData.pdc_cheque_no,
              ownership: formData.pdc_ownership,
              reference_details: formData.pdc_reference_details,
            }
          ] : [],
          cr_book_details: (formData.pdc_security_type === "CR Book" || formData.pdc_security_type === "CR Book (Certificate of Registration)") ? [
            {
              book_date: formData.pdc_book_date,
              reference_details: formData.pdc_reference_details,
            }
          ] : [],
          deed_details: (formData.pdc_security_type === "Deed" || formData.pdc_security_type === "Deed (Signed Contract)") ? [
            {
              reference_details: formData.pdc_reference_details,
            }
          ] : [],
        },
        ChequeDefine: {
          items: (formData.cheques || []).map((chq: any) => ({
            cheque_no: chq.cheque_no || "",
            cheque_date: chq.cheque_date || "",
            payee_name: chq.payee_name,
            nic_br_no: chq.nic_br_no,
            instructions: chq.instructions,
            payment_amount: parseFloat(chq.payment_amount || "0"),
            bank_name: chq.bank_name,
            branch_name: chq.branch_name,
            account_number: chq.account_number,
          }))
        }
      };

      const res = await apiClient.post(`/leasing-applications/${draftId}/submit`, payload);
      notification.success(res.data.message || "Application submitted successfully!");
      resetForm();
    } catch (err: any) {
      console.error(err);
      notification.error("Failed to submit application: " + (err.response?.data?.error || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 1: return <StepCustomer formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 2: return <StepIntroducer formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 3: return <StepVehicleAsset formData={formData} updateFormData={updateFormData} draftId={draftId} saveDraft={saveDraft} errors={errors} />;
      case 4: return <StepInsurance formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 5: return <StepLeaseDetails formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 6: return <StepGuarantors formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 7: return <StepPdcSecurity formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 8: return <StepChequeDefine formData={formData} updateFormData={updateFormData} errors={errors} />;
      case 9: return <StepCrDocs formData={formData} updateFormData={updateFormData} draftId={draftId} saveDraft={saveDraft} errors={errors} />;
      default: return <StepCustomer formData={formData} updateFormData={updateFormData} errors={errors} />;
    }
  };

  return (
    <div className="pb-20 relative antialiased text-gray-900 dark:text-white">
      <PageMeta
        title="New Leasing Application | Asipiya Leasing"
        description="Create a new finance lease application"
      />

      {/* ── DEV MODE BANNER ─────────────────────────────────────────────── */}
      {DEV_MODE && (
        <div className="max-w-[1600px] mx-auto mb-4 px-4 py-3 bg-yellow-400/20 border border-yellow-400/50 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-lg">🛠️</span>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-widest text-yellow-700 dark:text-yellow-300">Dev Mode Active</p>
              <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80 font-medium">
                Step validation is bypassed. Fill Step 1 (Customer) then use <strong>Quick Submit ↓</strong> to test the approval flow.
              </p>
            </div>
          </div>
          {!isReadOnly && draftId && (
            <button
              onClick={() => submitApplication(true)}
              disabled={isSubmitting}
              className="shrink-0 px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold rounded-xl text-sm transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "⚡ Quick Submit (Dev)"}
            </button>
          )}
        </div>
      )}

      {/* Page Header (No Card) */}
      <div className="max-w-[1600px] mx-auto mb-6 pt-2">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              {isReadOnly ? "Review Leasing Application" : "New Leasing Application"}
            </h1>
            <div className="flex items-center gap-4 mt-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Draft ID: <span className="text-brand-500 font-bold">{draftId ? `LSE-2026-${String(draftId).padStart(4, '0')}` : 'Unsaved'}</span>
                </p>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status: <span className={isReadOnly ? "text-amber-500 font-bold" : "text-orange-500 font-bold"}>{isReadOnly ? "Pending Approval" : "Draft"}</span>
                </p>
            </div>
          </div>

          {!isReadOnly ? (
            <div className="flex items-center gap-3 w-full xl:w-auto">
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to reset this draft? All entered data and local storage will be permanently cleared.")) {
                    resetForm();
                  }
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 font-semibold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all shadow-theme-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Reset Draft
              </button>
              <button 
                onClick={() => saveDraft()}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-theme-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                 Save Draft
              </button>
              <button 
                onClick={() => submitApplication()}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-all shadow-theme-sm border border-brand-600 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                 {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 w-full xl:w-auto">
              <Link
                to={ROUTES.PENDING_LEASES}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition-all shadow-theme-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                Back to Queue
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Stepper Card */}
      <div className="sticky top-[78px] lg:top-[78px] max-md:top-[70px] z-30 max-w-[1600px] mx-auto mb-6">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-250 dark:border-gray-700 rounded-2xl p-4 shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-4 min-w-[1000px]">
            {STEPS.map((step) => {
              const status = stepStatuses[step.id] || "";
              
              let stepIconBgClass = "bg-gray-100 dark:bg-gray-700 text-gray-500"; // default pristine
              if (activeStep === step.id) {
                 stepIconBgClass = "bg-brand-500 text-white shadow-md shadow-brand-500/20";
              } else if (status === "complete") {
                 stepIconBgClass = "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500";
              } else if (status === "error") {
                 stepIconBgClass = "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-500";
              }

              return (
              <button
                key={step.id}
                onClick={() => handleGoToStep(step.id)}
                className={`flex items-center gap-3 p-2.5 rounded-xl transition-all grow group cursor-pointer ${
                  activeStep === step.id 
                  ? "bg-brand-50/70 dark:bg-brand-500/10 shadow-theme-sm ring-1 ring-brand-500/20 border border-brand-100 dark:border-brand-500/20" 
                  : "opacity-60 hover:opacity-100"
                }`}
              >
                <div className={`p-2 rounded-lg ${stepIconBgClass}`}>
                  {React.cloneElement(step.icon as React.ReactElement<any>, { className: "w-5 h-5" })}
                </div>
                <div className="text-left">
                  <p className={`text-[10px] font-bold uppercase tracking-wider ${
                    activeStep === step.id ? "text-brand-600 dark:text-brand-400" : "text-gray-400"
                  }`}>
                    Step 0{step.id}
                  </p>
                  <p className={`text-sm font-bold truncate ${
                    activeStep === step.id ? "text-brand-900 dark:text-white" : "text-gray-500"
                  }`}>
                    {step.label}
                  </p>
                </div>
              </button>
            )})}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-[1600px] mx-auto min-h-[60vh]">
          {/* Read-Only Mode Banner */}
          {isReadOnly && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl text-amber-850 dark:text-amber-300 shadow-theme-xs flex items-start gap-3.5 animate-fadeIn">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 shrink-0">
                <InfoIcon className="w-5 h-5" />
              </div>
              <div className="grow">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1">
                  View-Only Mode
                </h4>
                <p className="text-xs text-amber-600/80 dark:text-amber-400/80 font-medium">
                  This leasing application has been submitted and is currently in the **Pending Approval** queue. Modifications are disabled.
                </p>
              </div>
            </div>
          )}

          {/* Active Step Validation Errors Card */}
          {Object.keys(errors).length > 0 && (
            <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-2xl text-orange-850 dark:text-orange-300 shadow-theme-xs flex items-start gap-3.5 animate-fadeIn">
              <div className="p-2.5 bg-orange-100 dark:bg-orange-500/20 rounded-xl text-orange-600 dark:text-orange-400 shrink-0">
                <AlertIcon className="w-5 h-5" />
              </div>
              <div className="grow">
                <h4 className="text-sm font-bold uppercase tracking-wider mb-1">
                  Step 0{activeStep} Incomplete or Contains Validation Errors
                </h4>
                <p className="text-xs text-orange-600/80 dark:text-orange-400/80 font-medium">
                  Please correct the following fields before proceeding:
                </p>
                <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-disc list-inside text-xs font-semibold">
                  {Object.entries(errors).map(([field, errMsg]) => {
                    const cleanField = field === "_general" ? "General" : field
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase());
                    return (
                      <li key={field} className="text-orange-700 dark:text-orange-300">
                        <span className="font-extrabold">{cleanField}:</span> {errMsg}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

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

              {activeStep === 9 ? (
                !isReadOnly ? (
                  <button
                    onClick={() => submitApplication()}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-theme-sm disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Application <CheckCircleIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={ROUTES.PENDING_LEASES}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-theme-sm"
                  >
                    Back to Queue <CheckCircleIcon className="w-5 h-5" />
                  </Link>
                )
              ) : (
                <button 
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-theme-sm"
                >
                  Next Step <AngleRightIcon className="w-5 h-5" />
                </button>
              )}
          </div>
      </div>
    </div>
  );
};

export default CreateLeasing;
