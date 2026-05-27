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

          setFormData(prev => ({
            ...prev,
            ...parsed,
            ...mappedDocs
          }));
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
          setDraftId(res.data.data.ID);
        }
        if (res.data.step_statuses) {
          setStepStatuses(res.data.step_statuses);
        }
      } else {
        const payload = {
          current_progress_data: dataToSave
        };
        const res = await apiClient.put(`/leasing-applications/${draftId}/draft`, payload);
        if (res.data.step_statuses) {
          setStepStatuses(res.data.step_statuses);
        }
      }
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  // Debounced auto-save effect
  useEffect(() => {
    if (!draftId && !formData.customer_db_id) return; // Don't auto-create until we have customer
    
    const timeoutId = setTimeout(() => {
      saveDraft();
    }, 1500);
    
    return () => clearTimeout(timeoutId);
  }, [formData]);

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
