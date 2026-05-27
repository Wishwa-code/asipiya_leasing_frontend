import { useState, useEffect, useRef } from "react";
import apiClient from "../api/apiClient";

export interface LeaseFormData {
  // Step 1: Customer
  customer_db_id: number | null;
  customer_code: string;
  customer_name: string;
  bank_account_id: string;
  
  // Step 2: Introducers
  introducers: any[];

  // Step 3: Vehicle Asset
  vehicle_type: string;
  vehicle_type_id: string;
  vehicle_make: string;
  vehicle_make_id: string;
  vehicle_model: string;
  vehicle_model_id: string;
  vehicle_status: string;
  engine_cc: string;
  chassis_no: string;
  manu_year: string;
  color: string;
  usage_type: string;
  manu_country: string;
  body_type: string;
  equipment: string;
  reg_year: string;
  reg_no: string;
  valuation_no: string;
  market_value: string;
  forced_value: string;
  invoice_value: string;
  supplier_name: string;
  supplier_address: string;
  supplier_mobile: string;
  supplier_id: string;
  supplier_rno: string;
  vehicle_photos: string[];
  front_side_photo: string;
  back_side_photo: string;
  left_side_photo: string;
  right_side_photo: string;
  upper_photo: string;
  inside_photo: string;
  chasis_no_file: string;
  meter_reading_file: string;
  valuation_report: string;
  cr_copy: string;
  deletion_copy: string;
  revenue_license: string;
  supplier_invoice: string;

  // Step 4: Insurance
  insurance_company: string;
  insurance_amount: string;
  insurance_premium: string;
  insurance_start_date: string;
  insurance_expiry_date: string;

  // Step 5: Lease Details
  marketing_executive_id: string;
  inspection_date: string;
  product_id: string;
  product_item: string;
  product_item_id: string;
  loan_amount: string;
  period: string;
  interest_rate: string;
  installments_total: string;
  total_interest: string;
  total_payable: string;
  tcc_collection_date: string;
  bank_id: string;
  branch_id: string;
  account_number: string;
  ltv: string;
  disburse_amount: string;
  installment_amount: string;
  other_charges_total: string;
  other_charges_on_disburse: string;
  other_charges_on_first_installment: string;
  other_charges_on_every_installments: string;
  
  // Step 6: Guarantors
  guarantors: any[];
  required_guarantor_count: number;

  // Step 7: PDC Security
  pdc_securities: any[];

  // Step 8: Cheque Define
  cheques: any[];

  // Step 9: CR & Docs
  original_cr_no: string;
  duplicate_key: boolean;
  documents: any[];
}

const INITIAL_DATA: LeaseFormData = {
  customer_db_id: null,
  customer_code: "",
  customer_name: "",
  bank_account_id: "",
  introducers: [],
  vehicle_type: "",
  vehicle_type_id: "",
  vehicle_make: "",
  vehicle_make_id: "",
  vehicle_model: "",
  vehicle_model_id: "",
  vehicle_status: "REGISTERED",
  engine_cc: "",
  chassis_no: "",
  manu_year: "",
  color: "",
  usage_type: "PRIVATE",
  manu_country: "JAPAN",
  body_type: "SEDAN",
  equipment: "",
  reg_year: "",
  reg_no: "",
  valuation_no: "",
  market_value: "0.00",
  forced_value: "0.00",
  invoice_value: "0.00",
  supplier_name: "",
  supplier_address: "",
  supplier_mobile: "",
  supplier_id: "",
  supplier_rno: "",
  vehicle_photos: [],
  front_side_photo: "",
  back_side_photo: "",
  left_side_photo: "",
  right_side_photo: "",
  upper_photo: "",
  inside_photo: "",
  chasis_no_file: "",
  meter_reading_file: "",
  valuation_report: "",
  cr_copy: "",
  deletion_copy: "",
  revenue_license: "",
  supplier_invoice: "",
  insurance_company: "",
  insurance_amount: "0.00",
  insurance_premium: "0.00",
  insurance_start_date: "",
  insurance_expiry_date: "",
  marketing_executive_id: "",
  inspection_date: new Date().toISOString().split('T')[0],
  product_id: "",
  product_item: "",
  product_item_id: "",
  loan_amount: "0.00",
  period: "12",
  interest_rate: "0.00",
  installments_total: "0.00",
  total_interest: "0.00",
  total_payable: "0.00",
  tcc_collection_date: "",
  bank_id: "",
  branch_id: "",
  account_number: "",
  ltv: "0.00",
  disburse_amount: "0.00",
  installment_amount: "0.00",
  other_charges_total: "0.00",
  other_charges_on_disburse: "0.00",
  other_charges_on_first_installment: "0.00",
  other_charges_on_every_installments: "0.00",
  guarantors: [],
  required_guarantor_count: 0,
  pdc_securities: [],
  cheques: [],
  original_cr_no: "",
  duplicate_key: false,
  documents: []
};

/** Maps wizard step number to the backend step_name path param */
export const STEP_NAMES: Record<number, string> = {
  1: "customer",
  2: "introducers",
  3: "vehicle",
  4: "insurance",
  5: "lease-details",
  6: "guarantors",
  7: "pdc-security",
  8: "cheque-define",
  9: "documents",
};

/** Extracts only the fields relevant to each step for partial-payload autosave */
export function getStepFields(step: number, data: LeaseFormData): Record<string, any> {
  switch (step) {
    case 1:
      return {
        customer_id: data.customer_db_id,
        customer_code: data.customer_code,
        customer_name: data.customer_name,
        bank_account_id: data.bank_account_id,
      };
    case 2:
      return {
        introducers: data.introducers,
      };
    case 3:
      return {
        vehicle_type: data.vehicle_type,
        vehicle_type_id: data.vehicle_type_id,
        vehicle_make: data.vehicle_make,
        vehicle_make_id: data.vehicle_make_id,
        vehicle_model: data.vehicle_model,
        vehicle_model_id: data.vehicle_model_id,
        vehicle_status: data.vehicle_status,
        engine_cc: data.engine_cc,
        chassis_no: data.chassis_no,
        manu_year: data.manu_year,
        color: data.color,
        usage_type: data.usage_type,
        manu_country: data.manu_country,
        body_type: data.body_type,
        equipment: data.equipment,
        reg_year: data.reg_year,
        reg_no: data.reg_no,
        valuation_no: data.valuation_no,
        market_value: data.market_value,
        forced_value: data.forced_value,
        invoice_value: data.invoice_value,
        supplier_name: data.supplier_name,
        supplier_address: data.supplier_address,
        supplier_mobile: data.supplier_mobile,
        supplier_id: data.supplier_id,
        supplier_rno: data.supplier_rno,
        front_side_photo: data.front_side_photo,
        back_side_photo: data.back_side_photo,
        left_side_photo: data.left_side_photo,
        right_side_photo: data.right_side_photo,
        upper_photo: data.upper_photo,
        inside_photo: data.inside_photo,
        chasis_no_file: data.chasis_no_file,
        meter_reading_file: data.meter_reading_file,
        valuation_report: data.valuation_report,
        cr_copy: data.cr_copy,
        deletion_copy: data.deletion_copy,
        revenue_license: data.revenue_license,
        supplier_invoice: data.supplier_invoice,
      };
    case 4:
      return {
        insurance_company: data.insurance_company,
        insurance_amount: data.insurance_amount,
        insurance_premium: data.insurance_premium,
        insurance_start_date: data.insurance_start_date,
        insurance_expiry_date: data.insurance_expiry_date,
      };
    case 5:
      return {
        product_id: data.product_id,
        product_item: data.product_item,
        product_item_id: data.product_item_id,
        marketing_executive_id: data.marketing_executive_id,
        inspection_date: data.inspection_date,
        loan_amount: data.loan_amount,
        period: data.period,
        interest_rate: data.interest_rate,
        installments_total: data.installments_total,
        total_interest: data.total_interest,
        total_payable: data.total_payable,
        tcc_collection_date: data.tcc_collection_date,
        bank_id: data.bank_id,
        branch_id: data.branch_id,
        account_number: data.account_number,
        bank_account_id: data.bank_account_id,
        ltv: data.ltv,
        disburse_amount: data.disburse_amount,
        installment_amount: data.installment_amount,
        other_charges_total: data.other_charges_total,
        other_charges_on_disburse: data.other_charges_on_disburse,
        other_charges_on_first_installment: data.other_charges_on_first_installment,
        other_charges_on_every_installments: data.other_charges_on_every_installments,
        required_guarantor_count: data.required_guarantor_count,
      };
    case 6:
      return {
        guarantors: data.guarantors,
        required_guarantor_count: data.required_guarantor_count,
      };
    case 7:
      return {
        pdc_securities: data.pdc_securities,
      };
    case 8:
      return {
        cheques: data.cheques,
      };
    case 9:
      return {
        original_cr_no: data.original_cr_no,
        duplicate_key: data.duplicate_key,
        documents: data.documents,
      };
    default:
      return {};
  }
}

export const useLeaseForm = () => {
  const [formData, setFormData] = useState<LeaseFormData>(() => {
    const saved = localStorage.getItem("leasing_draft");
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [activeStep, setActiveStep] = useState(1);
  const [draftId, setDraftId] = useState<number | null>(() => {
    // Check search params first
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get("draftId");
    if (paramId) {
      const parsed = parseInt(paramId);
      if (!isNaN(parsed)) return parsed;
    }
    const savedId = localStorage.getItem("leasing_draft_id");
    return savedId ? parseInt(savedId) : null;
  });
  const [stepStatuses, setStepStatuses] = useState<Record<number, string>>({});
  
  // Use a ref to keep track of the latest formData inside debounced functions
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Ref to always have the current activeStep value inside async/debounced closures
  const activeStepRef = useRef(activeStep);
  useEffect(() => {
    activeStepRef.current = activeStep;
  }, [activeStep]);

  // Track last-saved fields per step to skip redundant network calls
  const lastSavedFieldsRef = useRef<Record<number, any>>({});
  useEffect(() => {
    // Initialize per-step snapshot from the initial formData on first render
    if (Object.keys(lastSavedFieldsRef.current).length === 0) {
      for (let i = 1; i <= 9; i++) {
        lastSavedFieldsRef.current[i] = getStepFields(i, formDataRef.current);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load draftId from query params if changed in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramId = params.get("draftId");
    if (paramId) {
      const parsedId = parseInt(paramId);
      if (!isNaN(parsedId) && parsedId !== draftId) {
        setDraftId(parsedId);
      }
    }
  }, [draftId]);

  // Fetch draft from backend when draftId is set
  useEffect(() => {
    if (!draftId) return;

    const fetchDraftData = async () => {
      try {
        const res = await apiClient.get(`/leasing-applications/${draftId}`);
        const app = res.data?.data;
        if (app) {
          let parsed: Partial<LeaseFormData> = {};
          if (app.current_progress_data) {
            parsed = typeof app.current_progress_data === "string"
              ? JSON.parse(app.current_progress_data)
              : app.current_progress_data;
          }

          // Map associated document images
          const docImages = app.document_images || [];
          const mappedDocs: Record<string, string> = {};
          docImages.forEach((img: any) => {
            if (img.image_type && img.image_url) {
              mappedDocs[img.image_type] = img.image_url;
            }
          });

          const mergedData = {
            ...formDataRef.current,
            ...parsed,
            ...mappedDocs
          };

          setFormData(mergedData);

          // Update last saved fields with the fetched data
          for (let i = 1; i <= 9; i++) {
            lastSavedFieldsRef.current[i] = getStepFields(i, mergedData);
          }
        }
      } catch (err) {
        console.error("Failed to load draft from server:", err);
      }
    };

    fetchDraftData();
  }, [draftId]);

  useEffect(() => {
    localStorage.setItem("leasing_draft", JSON.stringify(formData));
    if (draftId) {
      localStorage.setItem("leasing_draft_id", draftId.toString());
    } else {
      localStorage.removeItem("leasing_draft_id");
    }
  }, [formData, draftId]);

  const saveDraft = async (forceData?: LeaseFormData) => {
    const dataToSave = forceData || formDataRef.current;
    
    // Minimal check to avoid creating draft if completely empty on step 1
    if (!draftId && !dataToSave.customer_db_id) {
       return;
    }

    try {
      if (!draftId) {
        const payload = {
          customer_id: dataToSave.customer_db_id || 0,
          current_progress_data: dataToSave
        };
        const res = await apiClient.post("/leasing-applications/draft", payload);
        if (res.data && res.data.data && res.data.data.ID) {
          const newId = res.data.data.ID;
          setDraftId(newId);
          localStorage.setItem("leasing_draft_id", newId.toString());
        }
        if (res.data.step_statuses) {
          setStepStatuses(res.data.step_statuses);
        }
        // Initialize all step refs upon initial creation
        for (let i = 1; i <= 9; i++) {
          lastSavedFieldsRef.current[i] = getStepFields(i, dataToSave);
        }
      } else {
        const currentStep = activeStepRef.current;
        const stepName = STEP_NAMES[currentStep];
        const stepPayload = getStepFields(currentStep, dataToSave);
        
        // Skip if no changes to active step
        const lastSavedFields = lastSavedFieldsRef.current[currentStep];
        if (JSON.stringify(stepPayload) === JSON.stringify(lastSavedFields)) {
          return;
        }

        const res = await apiClient.put(`/leasing-applications/${draftId}/draft/step/${stepName}`, stepPayload);
        if (res.data.step_statuses) {
          setStepStatuses(res.data.step_statuses);
        }
        
        // Update the ref to the newly saved fields
        lastSavedFieldsRef.current[currentStep] = stepPayload;
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!draftId && !formData.customer_db_id) return; // Don't auto-create until we have customer
    
    // Track changes to the specific step fields
    const currentFields = getStepFields(activeStep, formData);
    const lastSavedFields = lastSavedFieldsRef.current[activeStep];
    
    // Only trigger autosave if fields in active step actually changed
    if (JSON.stringify(currentFields) === JSON.stringify(lastSavedFields)) {
      return;
    }
    
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [formData, activeStep, draftId]);

  const updateFormData = (fields: Partial<LeaseFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    saveDraft();
    setActiveStep(prev => Math.min(prev + 1, 9));
  };
  
  const prevStep = () => {
    saveDraft();
    setActiveStep(prev => Math.max(prev - 1, 1));
  };
  
  const goToStep = (step: number) => {
    saveDraft();
    setActiveStep(step);
  };

  const resetForm = () => {
    setFormData(INITIAL_DATA);
    localStorage.removeItem("leasing_draft");
    localStorage.removeItem("leasing_draft_id");
    setDraftId(null);
    setStepStatuses({});
    setActiveStep(1);
    
    // Clear/reinitialize ref
    lastSavedFieldsRef.current = {};
    for (let i = 1; i <= 9; i++) {
      lastSavedFieldsRef.current[i] = getStepFields(i, INITIAL_DATA);
    }
  };

  return {
    formData,
    activeStep,
    draftId,
    stepStatuses,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    resetForm,
    saveDraft
  };
};

