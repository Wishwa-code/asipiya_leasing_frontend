import React, { useEffect, useState } from "react";
import { PlugInIcon, DollarLineIcon } from "../../../icons";
import { generateRepaymentSchedule } from "../../../utils/leasingUtils";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../form/date-picker";

interface StepLeaseDetailsProps {
  formData: any;
  updateFormData: (fields: any) => void;
  errors?: Record<string, string>;
}

const StepLeaseDetails: React.FC<StepLeaseDetailsProps> = ({ formData, updateFormData, errors }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [executives, setExecutives] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [customerAccounts, setCustomerAccounts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [generatingSchedule, setGeneratingSchedule] = useState(false);
  
  const [schedule, setSchedule] = useState<any[]>([]);
  const [scheduleSearch, setScheduleSearch] = useState("");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const getTomorrowDateString = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  // Fetch product, marketing executive, and bank lists on mount
  useEffect(() => {
    const fetchLookups = async () => {
      setLoading(true);
      try {
        const [productsRes, executivesRes, banksRes] = await Promise.all([
          apiClient.get("/leasing/products?full=true"),
          apiClient.get("/lookup/marketing-executives"),
          apiClient.get("/lookup/banks")
        ]);
        setProducts(productsRes.data?.data || productsRes.data || []);
        setExecutives(executivesRes.data?.data || executivesRes.data || []);
        setBanks(banksRes.data?.data || banksRes.data || []);
      } catch (err) {
        console.error("Failed to fetch lookups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLookups();
  }, []);

  // Fetch bank accounts for the active customer
  useEffect(() => {
    if (!formData.customer_db_id) {
      setCustomerAccounts([]);
      return;
    }
    const fetchCustomerBanks = async () => {
      try {
        const res = await apiClient.get(`/customers/${formData.customer_db_id}/bank-accounts`);
        setCustomerAccounts(res.data?.data || res.data || []);
      } catch (err) {
        console.error("Failed to fetch customer bank accounts:", err);
      }
    };
    fetchCustomerBanks();
  }, [formData.customer_db_id]);

  const handleBankChange = async (bankName: string) => {
    updateFormData({
      bank_id: bankName,
      branch_id: "" // clear branch on bank change
    });

    if (!bankName) {
      setBranches([]);
      return;
    }

    const matchedBank = banks.find(b => (b.name || b.Name) === bankName);
    if (!matchedBank) {
      setBranches([]);
      return;
    }

    const bankId = matchedBank.id || matchedBank.ID;
    setLoadingBranches(true);
    try {
      const res = await apiClient.get(`/lookup/banks/${bankId}/branches`);
      setBranches(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch branches:", err);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch branches on load if formData.bank_id is pre-filled
  useEffect(() => {
    if (banks.length === 0 || !formData.bank_id) return;
    
    const fetchInitialBranches = async () => {
      const matchedBank = banks.find(b => (b.name || b.Name) === formData.bank_id);
      if (matchedBank) {
        const bankId = matchedBank.id || matchedBank.ID;
        try {
          const res = await apiClient.get(`/lookup/banks/${bankId}/branches`);
          setBranches(res.data?.data || res.data || []);
        } catch (err) {
          console.error("Failed to fetch initial branches:", err);
        }
      }
    };
    fetchInitialBranches();
  }, [banks, formData.bank_id]);

  // Selected product and item configuration
  const selectedProduct = products.find(p => String(p.id || p.ID) === String(formData.product_id)) || null;
  const selectedItem = selectedProduct?.product_has_items?.find(
    (i: any) => String(i.id || i.ID) === String(formData.product_item_id)
  ) || null;

  // Auto-populate period options based on selected item bounds
  const [periodOptions, setPeriodOptions] = useState<number[]>([]);
  useEffect(() => {
    if (!selectedItem) {
      setPeriodOptions([]);
      return;
    }
    const minP = selectedItem.minimum_loan_period || 1;
    const maxP = selectedItem.maximum_loan_period || 12;
    const options = [];
    for (let i = minP; i <= maxP; i++) {
      options.push(i);
    }
    setPeriodOptions(options);

    // Default period to min period if current period is out of range
    const currentP = parseInt(formData.period) || 0;
    if (currentP < minP || currentP > maxP) {
      updateFormData({ period: String(minP) });
    }
  }, [selectedItem]);

  // Sync calculation fields using backend API
  useEffect(() => {
    const marketValue = parseFloat(formData.market_value) || 0;
    const ltv = parseFloat(formData.ltv) || 0;
    const interestRate = parseFloat(formData.interest_rate) || 0;
    const period = parseInt(formData.period) || 0;
    const productId = parseInt(formData.product_id) || 0;
    const productItemId = formData.product_item_id ? parseInt(formData.product_item_id) : null;

    if (!marketValue || !ltv || !interestRate || !period || !productId) {
      return;
    }

    const runBackendCalculation = async () => {
      setCalculating(true);
      try {
        const payload = {
          market_value: marketValue,
          ltv: ltv,
          interest_rate: interestRate,
          period: period,
          product_id: productId,
          product_item_id: productItemId
        };
        const res = await apiClient.post("/leasing/calculate", payload);
        if (res.data && res.data.success) {
          updateFormData({
            loan_amount: res.data.facility_amount,
            total_interest: res.data.interest,
            total_payable: res.data.total_payable,
            installments_total: res.data.installment,
            disburse_amount: res.data.net_disbursement,
            other_charges_total: (
              parseFloat(res.data.disbursement_charges || "0") +
              parseFloat(res.data.first_inst_charges || "0") +
              parseFloat(res.data.per_inst_charges || "0")
            ).toFixed(2),
            other_charges_on_disburse: res.data.disbursement_charges,
            other_charges_on_first_installment: res.data.first_inst_charges,
            other_charges_on_every_installments: res.data.per_inst_charges,
          });
        }
      } catch (err) {
        console.error("Calculate API failed:", err);
      } finally {
        setCalculating(false);
      }
    };

    const delay = setTimeout(() => {
      runBackendCalculation();
    }, 450);

    return () => clearTimeout(delay);
  }, [
    formData.market_value,
    formData.ltv,
    formData.interest_rate,
    formData.period,
    formData.product_id,
    formData.product_item_id
  ]);

  // Basic change handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  const handleProductChange = (productId: string) => {
    updateFormData({
      product_id: productId,
      product_item: "",
      product_item_id: "",
      period: "12",
      interest_rate: "0.00",
      required_guarantor_count: 0
    });
  };

  const handleItemChange = (itemId: string) => {
    if (!selectedProduct) return;
    const item = selectedProduct.product_has_items?.find((i: any) => String(i.id || i.ID) === itemId);
    if (item) {
      updateFormData({
        product_item_id: itemId,
        product_item: item.product_item_name,
        required_guarantor_count: item.required_guarantee_count || selectedProduct.guarantee_count || 1,
        interest_rate: String(item.minimum_interest || "0.00"),
        loan_amount: String(item.minimum_loan_amount || "0.00"),
        period: String(item.minimum_loan_period || "12")
      });
    } else {
      updateFormData({
        product_item_id: "",
        product_item: "",
        required_guarantor_count: 0
      });
    }
  };

  // Sync calculations for manual changes to Market Value
  const handleMarketValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const mkt = parseFloat(val) || 0;
    const ltv = parseFloat(formData.ltv) || 0;
    const computedLoan = ((mkt * ltv) / 100).toFixed(2);
    updateFormData({
      market_value: val,
      loan_amount: computedLoan
    });
  };

  // Sync calculations for manual changes to LTV
  const handleLtvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const ltv = parseFloat(val) || 0;
    const mkt = parseFloat(formData.market_value) || 0;
    const computedLoan = ((mkt * ltv) / 100).toFixed(2);
    updateFormData({
      ltv: val,
      loan_amount: computedLoan
    });
  };

  // Sync calculations for manual changes to Facility Amount (loan_amount)
  const handleFacilityAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const loan = parseFloat(val) || 0;
    const mkt = parseFloat(formData.market_value) || 0;
    
    if (mkt > 0) {
      const computedLtv = ((loan / mkt) * 100).toFixed(2);
      updateFormData({
        loan_amount: val,
        ltv: computedLtv
      });
    } else {
      updateFormData({
        loan_amount: val
      });
    }
  };

  // Populate dynamic charges list
  const chargesList: any[] = [];
  let totalEstimatedCharges = 0;
  if (selectedProduct && selectedProduct.additional_charges) {
    const facilityAmount = parseFloat(formData.loan_amount) || 0;
    selectedProduct.additional_charges.forEach((charge: any) => {
      const isPercent = (charge.value_type || "").toLowerCase() === "percentage";
      const amount = isPercent
        ? facilityAmount * (parseFloat(charge.value) / 100)
        : parseFloat(charge.value) || 0;
      
      totalEstimatedCharges += amount;
      
      let deductionLabel = "Other";
      const dtype = (charge.deduction_type || "").toLowerCase();
      if (dtype.includes("disbursement")) {
        deductionLabel = "Disbursement";
      } else if (dtype.includes("first") && dtype.includes("installment")) {
        deductionLabel = "1st Installment";
      } else if (dtype.includes("installment")) {
        deductionLabel = "Each Installment";
      }

      chargesList.push({
        id: charge.id,
        description: charge.description,
        deductionType: deductionLabel,
        amount: amount,
        isPercent: isPercent,
        percentVal: charge.value
      });
    });
  }

  // Handle selected bank account autofill
  const handleBankAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accId = e.target.value;
    const acc = customerAccounts.find(a => String(a.ID || a.id) === accId);
    if (acc) {
      updateFormData({
        bank_account_id: accId,
        bank_id: acc.bank || acc.bank_name || "",
        branch_id: acc.branch || "",
        account_number: acc.account_number || acc.accountNumber || ""
      });
    } else {
      updateFormData({
        bank_account_id: "",
        bank_id: "",
        branch_id: "",
        account_number: ""
      });
    }
  };

  // Generate repayment schedule
  const handleGenerateSchedule = () => {
    const loanAmt = parseFloat(formData.loan_amount) || 0;
    const rate = parseFloat(formData.interest_rate) || 0;
    const period = parseInt(formData.period) || 0;
    const startDate = formData.tcc_collection_date;

    if (!loanAmt || !rate || !period) {
      alert("Please complete the Facility Amount, Interest Rate, and Period before generating the schedule.");
      return;
    }

    if (!startDate) {
      alert("Please select a TCC Collection Date before generating the schedule.");
      return;
    }

    setGeneratingSchedule(true);
    setTimeout(() => {
      try {
        const generated = generateRepaymentSchedule(
          loanAmt,
          rate,
          period,
          period,
          startDate,
          selectedProduct,
          selectedItem ? (selectedItem.id || selectedItem.ID) : null
        );
        setSchedule(generated);
      } catch (err) {
        console.error("Failed to generate schedule:", err);
      } finally {
        setGeneratingSchedule(false);
      }
    }, 300);
  };

  // Schedule filtering & pagination
  const filteredSchedule = schedule.filter(row => {
    const term = scheduleSearch.toLowerCase();
    return (
      row.no.toString().includes(term) ||
      row.collection_date.includes(term) ||
      row.capital.includes(term) ||
      row.interest.includes(term) ||
      row.charges.includes(term) ||
      row.total_due.includes(term)
    );
  });

  const totalPages = Math.ceil(filteredSchedule.length / pageSize) || 1;
  const paginatedSchedule = filteredSchedule.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-8 animate-fadeIn text-sm">
      
      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></div>
          <span className="ml-3 font-semibold text-gray-500">Loading configurations...</span>
        </div>
      )}

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${loading ? 'opacity-30 pointer-events-none' : ''}`}>
        
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            
            {/* Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-full bg-brand-500/10 p-2.5 text-brand-500">
                <PlugInIcon className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wider">
                  Product Management Section
                </h5>
                <p className="text-xs text-gray-400">Configure lease terms, product rules, and disbursement accounts</p>
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-6">
              
              <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <DollarLineIcon className="w-3.5 h-3.5" /> PRODUCT & LOAN DETAILS
              </h6>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Marketing Executive */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                    Marketing Executive <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="marketing_executive_id"
                    value={formData.marketing_executive_id}
                    onChange={handleChange}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none font-semibold"
                    required
                  >
                    <option value="">Choose Executive...</option>
                    {executives.map(e => (
                      <option key={e.id} value={e.id}>{e.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* Inspection Date */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                    Inspection Date <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    id="inspection_date"
                    placeholder="Select date"
                    defaultDate={formData.inspection_date || ""}
                    onChange={(_dates, dateStr) => updateFormData({ inspection_date: dateStr })}
                  />
                </div>

                {/* Product */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                    Product <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="product_id"
                    value={formData.product_id}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className={`w-full p-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm outline-none font-bold transition-all ${
                      errors?.product_id
                        ? "border-red-500 text-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-700 text-brand-500 focus:border-brand-500"
                    }`}
                    required
                  >
                    <option value="">Choose Product...</option>
                    {products.map(p => (
                      <option key={p.id || p.ID} value={p.id || p.ID}>
                        {p.product_name}
                      </option>
                    ))}
                  </select>
                  {errors?.product_id && (
                    <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.product_id}</p>
                  )}
                </div>

                {/* Product Item */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                    Product Item
                  </label>
                  <select
                    name="product_item_id"
                    value={formData.product_item_id}
                    onChange={(e) => handleItemChange(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none font-semibold disabled:opacity-50"
                    disabled={!formData.product_id}
                  >
                    <option value="">Choose Sub Product...</option>
                    {selectedProduct?.product_has_items?.map((item: any) => (
                      <option key={item.id || item.ID} value={item.id || item.ID}>
                        {item.product_item_name}
                      </option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Asset Values row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Market Value</label>
                  <input
                    type="number"
                    step="0.01"
                    name="market_value"
                    value={formData.market_value}
                    onChange={handleMarketValueChange}
                    placeholder="Market Value"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Forced Sale Value</label>
                  <input
                    type="number"
                    step="0.01"
                    name="forced_value"
                    value={formData.forced_value}
                    onChange={handleChange}
                    placeholder="Forced Sale Value"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Invoice Value</label>
                  <input
                    type="number"
                    step="0.01"
                    name="invoice_value"
                    value={formData.invoice_value}
                    onChange={handleChange}
                    placeholder="Invoice Value"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Financial controls row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                
                {/* LTV */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">LTV (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="ltv"
                    value={formData.ltv}
                    onChange={handleLtvChange}
                    placeholder="LTV %"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:border-brand-500"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                    Interest Rate (%) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      name="interest_rate"
                      value={formData.interest_rate}
                      onChange={handleChange}
                      placeholder="Rate"
                      className={`w-full p-2.5 pr-20 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm font-bold outline-none transition-all ${
                        errors?.interest_rate
                          ? "border-red-500 focus:border-red-500"
                          : "border-gray-200 dark:border-gray-700 focus:border-brand-500"
                      }`}
                      required
                    />
                    <span className="absolute right-3 top-3 text-[10px] uppercase font-bold text-gray-400">
                      / {selectedProduct?.interest_period_type ? selectedProduct.interest_period_type.replace("per_", "") : "Month"}
                    </span>
                  </div>
                  {errors?.interest_rate && (
                    <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.interest_rate}</p>
                  )}
                  {selectedItem && (
                    <small className="block mt-1 text-brand-500 font-bold ml-1" style={{ fontSize: "10px" }}>
                      Min: {selectedItem.minimum_interest}% | Max: {selectedItem.maximum_interest}%
                    </small>
                  )}
                </div>

                {/* Period */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                    Period ({selectedProduct?.loan_period_type || "Months"}) <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className={`w-full p-2.5 bg-gray-50 dark:bg-gray-900 border rounded-xl text-sm font-bold outline-none transition-all ${
                      errors?.period
                        ? "border-red-500 focus:border-red-500"
                        : "border-gray-200 dark:border-gray-700 focus:border-brand-500"
                    }`}
                    required
                  >
                    <option value="">Choose Period...</option>
                    {periodOptions.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors?.period && (
                    <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.period}</p>
                  )}
                  {selectedItem && (
                    <small className="block mt-1 text-brand-500 font-bold ml-1" style={{ fontSize: "10px" }}>
                      Min: {selectedItem.minimum_loan_period} | Max: {selectedItem.maximum_loan_period}
                    </small>
                  )}
                </div>

              </div>

              {/* Facility Amount */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Facility Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    name="loan_amount"
                    value={formData.loan_amount}
                    onChange={handleFacilityAmountChange}
                    placeholder="0.00"
                    className={`w-full p-3 bg-brand-50/50 dark:bg-brand-500/5 border rounded-xl text-md font-bold outline-none transition-all ${
                      errors?.loan_amount
                        ? "border-red-500 text-red-500 focus:border-red-500"
                        : "border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 focus:border-brand-500"
                    }`}
                  />
                  {errors?.loan_amount && (
                    <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.loan_amount}</p>
                  )}
                  {selectedItem && (
                    <small className="block mt-1 text-brand-500 font-bold ml-1" style={{ fontSize: "10px" }}>
                      Min: {selectedItem.minimum_loan_amount?.toLocaleString()} LKR | Max: {selectedItem.maximum_loan_amount?.toLocaleString()} LKR
                    </small>
                  )}
                </div>
              </div>

              {/* Charges Section */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <span className="bg-brand-500/10 text-brand-500 p-1.5 rounded-lg">
                    <PlugInIcon className="w-4 h-4" />
                  </span> 
                  PRODUCT OTHER CHARGES
                </div>

                <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/70 dark:bg-gray-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                        <th className="p-3.5 pl-4">Description</th>
                        <th className="p-3.5">Deduction Type</th>
                        <th className="p-3.5 text-right pr-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 text-xs">
                      {chargesList.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center text-gray-400 italic py-6">
                            No additional charges configured for this product.
                          </td>
                        </tr>
                      ) : (
                        chargesList.map(charge => (
                          <tr key={charge.id} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10">
                            <td className="p-3 pl-4 font-semibold text-gray-700 dark:text-gray-300">{charge.description}</td>
                            <td className="p-3 text-gray-500 font-medium">{charge.deductionType}</td>
                            <td className="p-3 text-right font-bold text-gray-700 dark:text-gray-200 pr-4">
                              {charge.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR
                              {charge.isPercent && (
                                <span className="text-[10px] text-gray-400 font-bold ml-1.5">({charge.percentVal}%)</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end items-center gap-3 border-t border-gray-100 dark:border-gray-700 pt-3 pr-2">
                  <span className="text-xs font-bold text-gray-400">Estimated Total Surcharges:</span>
                  <span className="font-extrabold text-brand-600 dark:text-brand-400 text-sm">
                    {totalEstimatedCharges.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} LKR
                  </span>
                </div>
              </div>

              {/* Real-time Result Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-100 dark:border-gray-700 pt-6 bg-brand-50/20 dark:bg-brand-500/5 p-4 rounded-xl">
                <div>
                  <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 uppercase mb-1.5 ml-1">
                    Customer Amount
                  </label>
                  <input
                    type="text"
                    value={formData.loan_amount ? parseFloat(formData.loan_amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
                    className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 uppercase mb-1.5 ml-1">
                    Total Interest Amount
                  </label>
                  <input
                    type="text"
                    value={formData.total_interest ? parseFloat(formData.total_interest).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
                    className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 uppercase mb-1.5 ml-1">
                    Installment
                  </label>
                  <input
                    type="text"
                    value={formData.installments_total ? parseFloat(formData.installments_total).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
                    className="w-full p-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-200 outline-none"
                    readOnly
                  />
                </div>
              </div>

              {/* Bank Details */}
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6 space-y-4">
                <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider">BANK DETAILS</h6>
                
                {customerAccounts.length > 0 && (
                  <div className="max-w-md">
                    <label className="block text-xs font-bold text-brand-600 dark:text-brand-400 uppercase mb-1.5 ml-1">
                      Customer Bank Account
                    </label>
                    <select
                      value={formData.bank_account_id}
                      onChange={handleBankAccountChange}
                      className="w-full p-2.5 bg-brand-50/50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 rounded-xl text-sm font-bold text-brand-600 dark:text-brand-400 focus:border-brand-500 outline-none"
                    >
                      <option value="">Select Customer Account...</option>
                      {customerAccounts.map(acc => (
                        <option key={acc.ID || acc.id} value={acc.ID || acc.id}>
                          {acc.bank || acc.bank_name} - {acc.branch} ({acc.account_number || acc.accountNumber})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">
                      Bank Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bank_id"
                      value={formData.bank_id}
                      onChange={(e) => handleBankChange(e.target.value)}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                      required
                    >
                      <option value="">Choose Bank...</option>
                      {banks.map(b => (
                        <option key={b.id || b.ID} value={b.name || b.Name}>
                          {b.name || b.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Branch Name</label>
                    <select
                      name="branch_id"
                      value={formData.branch_id}
                      onChange={handleChange}
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                      disabled={!formData.bank_id || loadingBranches}
                    >
                      <option value="">
                        {loadingBranches ? "Loading branches..." : !formData.bank_id ? "Select Bank First" : "Choose Branch..."}
                      </option>
                      {branches.map(br => (
                        <option key={br.id || br.ID} value={br.name || br.Name}>
                          {br.name || br.Name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5 ml-1">Account Number</label>
                    <input
                      type="text"
                      name="account_number"
                      value={formData.account_number}
                      onChange={handleChange}
                      placeholder="Account Number"
                      className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                {/* Additional static summary info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-gray-400 bg-gray-50/50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-700/50">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Penalty Method:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">Every Installment exact</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penalty Rate:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">1% per Day after 11 days</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Saving Collection:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">Deduct from installment</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saving Interest:</span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">0%</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Repayment Schedule Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            
            <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <PlugInIcon className="w-3.5 h-3.5" /> TCC COLLECTION DATE
            </h6>

            <div className="flex flex-col md:flex-row gap-4 items-end max-w-xl">
              <div className="flex-1 w-full">
                <DatePicker
                  id="tcc_collection_date"
                  label="First Collection Date"
                  placeholder="Select Date"
                  defaultDate={formData.tcc_collection_date || ""}
                  minDate={getTomorrowDateString()}
                  onChange={(_selectedDates, dateStr) => {
                    updateFormData({ tcc_collection_date: dateStr });
                  }}
                  error={!!errors?.tcc_collection_date}
                />
                {errors?.tcc_collection_date && (
                  <p className="text-xs text-red-500 font-bold mt-2 ml-1">{errors.tcc_collection_date}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleGenerateSchedule}
                disabled={generatingSchedule}
                className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-sm shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 w-full md:w-auto"
              >
                {generatingSchedule ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <PlugInIcon className="w-4 h-4" />
                    Generate Schedule
                  </>
                )}
              </button>
            </div>

            {schedule.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                
                {/* Search & Page Size */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="p-1.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-semibold outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span className="text-xs text-gray-400 font-semibold">per page</span>
                  </div>

                  <input
                    type="text"
                    value={scheduleSearch}
                    onChange={(e) => {
                      setScheduleSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search schedule..."
                    className="w-full sm:w-48 p-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-xs outline-none focus:border-brand-500"
                  />
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-gray-100 dark:border-gray-700 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                        <th className="p-3 pl-4">#</th>
                        <th className="p-3">Collection Date</th>
                        <th className="p-3 text-right">Capital</th>
                        <th className="p-3 text-right">Interest</th>
                        <th className="p-3 text-right">Charges</th>
                        <th className="p-3 text-right pr-4">Total Due</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50 font-semibold text-gray-600 dark:text-gray-300">
                      {paginatedSchedule.map(row => (
                        <tr key={row.no} className="hover:bg-gray-50/30 dark:hover:bg-gray-800/10">
                          <td className="p-3 pl-4 text-gray-400 font-bold">{row.no}</td>
                          <td className="p-3">{row.collection_date}</td>
                          <td className="p-3 text-right text-gray-700 dark:text-gray-200">
                            {parseFloat(row.capital).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right text-gray-700 dark:text-gray-200">
                            {parseFloat(row.interest).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right text-red-500">
                            {parseFloat(row.charges).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3 text-right font-extrabold text-gray-900 dark:text-white pr-4">
                            {parseFloat(row.total_due).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[11px] text-gray-400 font-semibold">
                      Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredSchedule.length)} of {filteredSchedule.length} rows
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold disabled:opacity-40"
                      >
                        Prev
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

        {/* Right Column: Widgets */}
        <div className="space-y-6">
          
          {/* Selected Item Details */}
          <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/70 shadow-sm space-y-4">
            <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <PlugInIcon className="w-3.5 h-3.5" /> SELECTED ITEM DETAILS
            </h6>

            <div className="space-y-3 font-bold text-xs">
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-400">Method:</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedProduct?.interest_method || "Flat Rate"}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-400">Min Amount:</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedItem ? (selectedItem.minimum_loan_amount || 0).toLocaleString() : "-"} LKR
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-400">Max Amount:</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedItem ? (selectedItem.maximum_loan_amount || 0).toLocaleString() : "-"} LKR
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-400">Interest Rate:</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedItem ? `${selectedItem.minimum_interest}% - ${selectedItem.maximum_interest}%` : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Term:</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {selectedItem ? `${selectedItem.maximum_loan_period} ${selectedProduct?.loan_period_type || "Months"}` : "-"}
                </span>
              </div>
            </div>

          </div>

          {/* Calculation Assistant */}
          <div className="bg-brand-500/10 border border-brand-500/20 p-6 rounded-2xl shadow-sm text-center space-y-3">
            <div className="mx-auto bg-white dark:bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
              <PlugInIcon className="w-6 h-6 text-brand-500" />
            </div>
            <h6 className="font-extrabold text-brand-600 dark:text-brand-400 text-xs tracking-wider uppercase">
              CALCULATION ASSISTANT
            </h6>
            <p className="text-[11px] text-gray-400 font-semibold leading-relaxed">
              Adjust inputs like LTV, Interest, and Period to see real-time updates calculated via the backend.
            </p>
          </div>

          {/* Loan Summary */}
          <div className="bg-gray-50 dark:bg-gray-800/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800/70 shadow-sm space-y-4">
            <h6 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2"><DollarLineIcon className="w-3.5 h-3.5" /> LOAN SUMMARY</span>
              {calculating && (
                <span className="text-[10px] text-brand-500 font-extrabold animate-pulse">
                  Calculating...
                </span>
              )}
            </h6>

            <div className="space-y-4 font-bold text-xs pt-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Loan Capital Amount</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {formData.loan_amount ? parseFloat(formData.loan_amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"} LKR
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Loan Interest Amount</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {formData.total_interest ? parseFloat(formData.total_interest).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"} LKR
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-400">Sub Total</span>
                <span className="text-gray-700 dark:text-gray-200">
                  {formData.total_payable ? parseFloat(formData.total_payable).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"} LKR
                </span>
              </div>

              <div className="flex justify-between items-center text-brand-500 border-t border-brand-500/20 pt-3">
                <span className="text-xs">Installment / Month</span>
                <span className="text-sm font-extrabold">
                  {formData.installments_total ? parseFloat(formData.installments_total).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"} LKR
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
                <span className="text-gray-400">Disbursement Deductions</span>
                <span className="text-red-500">
                  {formData.other_charges_on_disburse ? parseFloat(formData.other_charges_on_disburse).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"} LKR
                </span>
              </div>

              <div className="flex justify-between items-center text-emerald-500 border-t border-emerald-500/20 pt-3">
                <span className="text-xs">Net Disbursement Amount</span>
                <span className="text-sm font-extrabold">
                  {formData.disburse_amount ? parseFloat(formData.disburse_amount).toLocaleString("en-US", { minimumFractionDigits: 2 }) : "-"} LKR
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default StepLeaseDetails;
