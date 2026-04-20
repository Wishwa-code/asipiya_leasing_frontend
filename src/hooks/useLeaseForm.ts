import { useState, useEffect } from "react";

export interface LeaseFormData {
  // Step 1: Customer
  customer_id: string;
  customer_name: string;
  bank_account_id: string;
  
  // Step 2: Introducers
  introducers: any[];

  // Step 3: Vehicle Asset
  vehicle_type: string;
  vehicle_make: string;
  vehicle_model: string;
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
  vehicle_photos: string[];

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
  loan_amount: string;
  period: string;
  interest_rate: string;
  installments_total: string;
  total_interest: string;
  total_payable: string;
  tcc_collection_date: string;
  
  // Step 6: Guarantors
  guarantors: any[];

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
  customer_id: "",
  customer_name: "",
  bank_account_id: "",
  introducers: [],
  vehicle_type: "Cars",
  vehicle_make: "",
  vehicle_model: "",
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
  vehicle_photos: [],
  insurance_company: "",
  insurance_amount: "0.00",
  insurance_premium: "0.00",
  insurance_start_date: "",
  insurance_expiry_date: "",
  marketing_executive_id: "",
  inspection_date: new Date().toISOString().split('T')[0],
  product_id: "",
  product_item: "",
  loan_amount: "0.00",
  period: "12",
  interest_rate: "0.00",
  installments_total: "0.00",
  total_interest: "0.00",
  total_payable: "0.00",
  tcc_collection_date: "",
  guarantors: [],
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

  useEffect(() => {
    localStorage.setItem("leasing_draft", JSON.stringify(formData));
  }, [formData]);

  const updateFormData = (fields: Partial<LeaseFormData>) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  const nextStep = () => setActiveStep(prev => Math.min(prev + 1, 9));
  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));
  const goToStep = (step: number) => setActiveStep(step);

  const resetForm = () => {
    setFormData(INITIAL_DATA);
    localStorage.removeItem("leasing_draft");
    setActiveStep(1);
  };

  return {
    formData,
    activeStep,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    resetForm
  };
};
