import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router";
import {
  CheckCircleIcon,
  CloseLineIcon,
  BoxIcon,
  PlugInIcon,
  ListIcon,
  HorizontaLDots,
  PlusIcon
} from "../../icons";
import apiClient from "../../api/apiClient";

// Types for our internal lists
type SubProduct = {
  label: string;
  minLoan: string; maxLoan: string;
  minInt: string; maxInt: string;
  minPeriod: string; maxPeriod: string;
  minColl?: string; maxColl?: string;
  guarantors: string;
  penaltyType: string;
  penaltyRate: string;
  savingsAmount?: string;
};

type Charge = {
  description: string;
  amount: string;
  type: string; // 'fixed' | 'percentage'
  deduction: string;
};

type DocumentItem = {
  name: string;
  status: string; // 'Required' | 'Optional'
};

export default function CreateProduct() {
  const [activeTab, setActiveTab] = useState("general");
  const [isScrolled, setIsScrolled] = useState(false);

  const sectionRefs = {
    general: useRef<HTMLDivElement>(null),
    config: useRef<HTMLDivElement>(null),
    charges: useRef<HTMLDivElement>(null),
    documents: useRef<HTMLDivElement>(null),
  };

  const steps = [
    { id: "general", label: "General", step: "Step 1", icon: <BoxIcon className="w-5 h-5" /> },
    { id: "config", label: "Config", step: "Step 2", icon: <PlugInIcon className="w-5 h-5" /> },
    { id: "charges", label: "Charges", step: "Step 3", icon: <ListIcon className="w-5 h-5" /> },
    { id: "documents", label: "Documents", step: "Step 4", icon: <HorizontaLDots className="w-5 h-5" /> },
  ];

  // Forms State
  const [generalForm, setGeneralForm] = useState({
    name: "", code: "", interestMethod: "flat_rate", loanPeriodType: "months",
    interestPeriodType: "per_month", collectionPeriodType: "daily",
    collectionDateStrategy: "same_as_installment", globalGuarantors: ""
  });
  const [diffCollection, setDiffCollection] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Lists State
  const [subProducts, setSubProducts] = useState<SubProduct[]>([]);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Sub Product Form
  const [spForm, setSpForm] = useState({
    label: "", minLoan: "", maxLoan: "", minInt: "", maxInt: "",
    minPeriod: "", maxPeriod: "", minColl: "", maxColl: "",
    guarantors: "", penaltyType: "every_installment", penaltyRate: "", savingsAmount: ""
  });

  // Charge Form
  const [chargeForm, setChargeForm] = useState({
    description: "", amount: "", type: "fixed", deduction: "on_loan_disbursement"
  });

  // Document Form
  const [docForm, setDocForm] = useState({
    name: "", status: "Required"
  });

  // Scroll spy logic
  useEffect(() => {
    const isClickScrolling = false;
    const handleScroll = () => {
      if (isClickScrolling) return;
      setIsScrolled(window.scrollY > 50);

      let current = "general";
      const scrollPosition = window.scrollY + 220; // offset

      Object.entries(sectionRefs).forEach(([id, ref]) => {
        if (ref.current && ref.current.offsetTop <= scrollPosition) {
          current = id;
        }
      });
      setActiveTab(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: keyof typeof sectionRefs) => {
    setActiveTab(id);
    const element = sectionRefs[id].current;
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - 180;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handleAddSubProduct = () => {
    if (!spForm.label || !spForm.minLoan) return; // naive validation
    setSubProducts([...subProducts, { ...spForm }]);
    setSpForm({
      label: "", minLoan: "", maxLoan: "", minInt: "", maxInt: "",
      minPeriod: "", maxPeriod: "", minColl: "", maxColl: "",
      guarantors: "", penaltyType: "every_installment", penaltyRate: "", savingsAmount: ""
    });
  };

  const handleAddCharge = () => {
    if (!chargeForm.description || !chargeForm.amount) return;
    setCharges([...charges, { ...chargeForm }]);
    setChargeForm({ description: "", amount: "", type: "fixed", deduction: "on_loan_disbursement" });
  };

  const handleAddDoc = () => {
    if (!docForm.name) return;
    setDocuments([...documents, { ...docForm }]);
    setDocForm({ name: "", status: "Required" });
  };

  const handleSaveProduct = async () => {
    setSubmitError(null);
    setSubmitSuccess(null);

    if (!generalForm.name || !generalForm.code) {
      setSubmitError("Product Name and Code are required.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: generalForm.name,
        code: generalForm.code,
        interest_method: generalForm.interestMethod,
        loan_period_type: generalForm.loanPeriodType,
        interest_period_type: generalForm.interestPeriodType,
        collection_period_type: generalForm.collectionPeriodType,
        collection_date_strategy: generalForm.collectionDateStrategy,
        guarantors_required: generalForm.globalGuarantors ? parseInt(generalForm.globalGuarantors) : 0,
        configurations: subProducts.map(sp => ({
          ...sp,
          minLoan: parseFloat(sp.minLoan) || 0,
          maxLoan: parseFloat(sp.maxLoan) || 0,
          minInt: parseFloat(sp.minInt) || 0,
          maxInt: parseFloat(sp.maxInt) || 0,
          penaltyRate: parseFloat(sp.penaltyRate) || 0,
          minPeriod: parseInt(sp.minPeriod, 10) || 0,
          maxPeriod: parseInt(sp.maxPeriod, 10) || 0,
          guarantors: parseInt(sp.guarantors, 10) || 0,
        })),
        charges: charges.map(c => ({
          ...c,
          amount: parseFloat(c.amount) || 0,
        })),
        documents: documents
      };

      // Assuming apiClient is configured with standard baseUrl interceptors
      await apiClient.post("/api/leasing/products", payload);
      setSubmitSuccess("Product successfully created!");

      // Optionally reset form if needed...
    } catch (err) {
      console.error("Submission error", err);
      // Support axios error type resolution
      const errorMessage = (err as Record<string, any>)?.response?.data?.message || "An error occurred while saving the product.";
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Create Product | Asipiya Leasing"
        description="Define financial rules and collection cycles"
      />

      {/* Sticky Header Container */}
      <div className={`sticky top-0 z-40 bg-gray-50/90 dark:bg-gray-900/90 backdrop-blur-md pt-5 pb-4 px-4 sm:px-6 -mx-4 sm:-mx-6 transition-shadow ${isScrolled ? 'shadow-sm border-b border-gray-200 dark:border-gray-800' : ''}`}>

        {/* Action Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Create Product</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Define financial rules and collection cycles</p>
          </div>
          <div className="flex flex-col w-full sm:w-auto items-end gap-3">
            <div className="flex w-full sm:w-auto items-center gap-3">
              <button
                type="button"
                onClick={handleSaveProduct}
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <CheckCircleIcon className="w-5 h-5" />
                )}
                {isSubmitting ? 'Saving...' : 'Save Product'}
              </button>
              <Link to="/" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-colors shadow-sm">
                <CloseLineIcon className="w-5 h-5" />
                Cancel
              </Link>
            </div>

            {(submitSuccess || submitError) && (
              <div className={`text-sm font-semibold w-full sm:text-right px-2 ${submitSuccess ? 'text-success-600' : 'text-error-600'}`}>
                {submitSuccess || submitError}
              </div>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 sm:gap-4 pb-2">
          {steps.map((step) => (
            <button
              type="button"
              key={step.id}
              onClick={() => scrollToSection(step.id as keyof typeof sectionRefs)}
              className={`flex min-w-[150px] items-center gap-3 p-3 rounded-xl border transition-all ${activeTab === step.id
                ? "bg-white dark:bg-gray-800 border-brand-500 dark:border-brand-500 shadow-sm"
                : "bg-transparent border-transparent hover:bg-gray-100 hover:dark:bg-gray-800 opacity-70"
                }`}
            >
              <div className={`p-2.5 rounded-lg ${activeTab === step.id ? 'bg-brand-500 text-white shadow-brand-500/20 shadow-md' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                {step.icon}
              </div>
              <div className="text-left">
                <span className={`block font-bold text-[13px] uppercase tracking-wide ${activeTab === step.id ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                  {step.label}
                </span>
                <span className="block text-[11px] font-medium text-gray-400">{step.step}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="space-y-6 mt-6">

        {/* General Section */}
        <div ref={sectionRefs.general} className={`p-5 sm:p-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all ${activeTab === 'general' ? 'ring-2 ring-brand-500/10' : ''}`}>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500"><BoxIcon className="w-4 h-4" /></div> GENERAL INFORMATION
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Product Name <span className="text-error-500">*</span></label>
              <input value={generalForm.name} onChange={(e) => setGeneralForm({ ...generalForm, name: e.target.value })} type="text" placeholder="e.g. Personal Loan" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Product Code <span className="text-error-500">*</span></label>
              <input value={generalForm.code} onChange={(e) => setGeneralForm({ ...generalForm, code: e.target.value })} type="text" placeholder="PL-001" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Interest Method <span className="text-error-500">*</span></label>
              <select value={generalForm.interestMethod} onChange={(e) => setGeneralForm({ ...generalForm, interestMethod: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="flat_rate">Flat Rate</option>
                <option value="reducing_balance">Reducing Balance</option>
                <option value="draft">Draft</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Loan Period Type</label>
              <select value={generalForm.loanPeriodType} onChange={(e) => setGeneralForm({ ...generalForm, loanPeriodType: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="months">Months</option>
                <option value="weeks">Weeks</option>
                <option value="days">Days</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Interest Period Type</label>
              <select value={generalForm.interestPeriodType} onChange={(e) => setGeneralForm({ ...generalForm, interestPeriodType: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="per_month">Per Month</option>
                <option value="per_week">Per Week</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Collection Period Type</label>
              <select value={generalForm.collectionPeriodType} onChange={(e) => setGeneralForm({ ...generalForm, collectionPeriodType: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="first_of_month">First of Month</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Collection Date Strategy</label>
              <select value={generalForm.collectionDateStrategy} onChange={(e) => setGeneralForm({ ...generalForm, collectionDateStrategy: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="same_as_installment">Same as Installment</option>
                <option value="according_to_route">According to Route</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Global Guarantors</label>
              <input value={generalForm.globalGuarantors} onChange={(e) => setGeneralForm({ ...generalForm, globalGuarantors: e.target.value })} type="number" placeholder="0" className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
            </div>
          </div>
        </div>

        <div>

          {/* Configuration Section */}
          <div ref={sectionRefs.config} className={`p-5 sm:p-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all ${activeTab === 'config' ? 'ring-2 ring-brand-500/10' : ''}`}>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500"><PlugInIcon className="w-4 h-4" /></div> CONFIGURATION SUB PRODUCTS
            </h2>

            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-5 gap-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Sub Product Label</label>
                  <input value={spForm.label} onChange={(e) => setSpForm({ ...spForm, label: e.target.value })} type="text" placeholder="e.g. Gold Tier" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Loan Amount Range</label>
                  <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:border-brand-500">
                    <input value={spForm.minLoan} onChange={(e) => setSpForm({ ...spForm, minLoan: e.target.value })} type="number" placeholder="Min" className="w-1/2 px-3 py-2 text-sm outline-none bg-transparent border-r border-gray-200 dark:border-gray-700" />
                    <input value={spForm.maxLoan} onChange={(e) => setSpForm({ ...spForm, maxLoan: e.target.value })} type="number" placeholder="Max" className="w-1/2 px-3 py-2 text-sm outline-none bg-transparent" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Interest % Range</label>
                  <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:border-brand-500">
                    <input value={spForm.minInt} onChange={(e) => setSpForm({ ...spForm, minInt: e.target.value })} type="number" placeholder="Min" className="w-[40%] px-3 py-2 text-sm outline-none bg-transparent border-r border-gray-200 dark:border-gray-700" />
                    <input value={spForm.maxInt} onChange={(e) => setSpForm({ ...spForm, maxInt: e.target.value })} type="number" placeholder="Max" className="w-[40%] px-3 py-2 text-sm outline-none bg-transparent border-r border-gray-200 dark:border-gray-700" />
                    <div className="w-[20%] flex items-center justify-center bg-gray-50 dark:bg-gray-800 relative z-0">
                      <span className="text-[10px] text-gray-500 font-bold uppercase py-1 px-1 text-center leading-tight">Per<br />Mth</span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Loan Period</label>
                  <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden focus-within:border-brand-500">
                    <input value={spForm.minPeriod} onChange={(e) => setSpForm({ ...spForm, minPeriod: e.target.value })} type="number" placeholder="Min" className="w-1/4 px-3 py-2 text-sm outline-none bg-transparent border-r border-gray-200 dark:border-gray-700" />
                    <input value={spForm.maxPeriod} onChange={(e) => setSpForm({ ...spForm, maxPeriod: e.target.value })} type="number" placeholder="Max" className="w-1/4 px-3 py-2 text-sm outline-none bg-transparent border-r border-gray-200 dark:border-gray-700" />
                    <div className="w-1/4 flex items-center justify-center bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                      <span className="text-[12px] text-gray-500 font-bold">Months</span>
                    </div>
                    <div className="w-1/4 flex items-center justify-center bg-gray-50 dark:bg-gray-800 px-2">
                      <label className="flex items-center cursor-pointer gap-2">
                        <input type="checkbox" checked={diffCollection} onChange={(e) => setDiffCollection(e.target.checked)} className="rounded border-gray-300 text-brand-500 focus:ring-brand-500" />
                        <span className="text-[10px] font-bold uppercase text-gray-500">Diff Coll</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-wider">Guarantor and Penalty Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-x-5 gap-y-4">
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Req. Guarantors</label>
                    <input value={spForm.guarantors} onChange={(e) => setSpForm({ ...spForm, guarantors: e.target.value })} type="number" placeholder="Count" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Penalty Method</label>
                    <select value={spForm.penaltyType} onChange={(e) => setSpForm({ ...spForm, penaltyType: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800">
                      <option value="every_installment">Apply Penalty For Every Installment</option>
                      <option value="loan_after_maturity">Apply Penalty For Loan After Maturity</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Penalty %</label>
                    <input value={spForm.penaltyRate} onChange={(e) => setSpForm({ ...spForm, penaltyRate: e.target.value })} type="number" placeholder="0.00" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button onClick={handleAddSubProduct} type="button" className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  <PlusIcon className="w-4 h-4" /> Add to List
                </button>
              </div>
            </div>

            {/* Sub products table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-[10px] uppercase font-bold text-gray-400">
                  <tr>
                    <th className="px-4 py-3">Label</th>
                    <th className="px-4 py-3">Loan Amount</th>
                    <th className="px-4 py-3">Period</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Penalty</th>
                    <th className="px-4 py-3">Guarantors</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                  {subProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-400 font-medium">No configurations added yet.</td>
                    </tr>
                  ) : (
                    subProducts.map((sp, idx) => (
                      <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white uppercase">{sp.label}</td>
                        <td className="px-4 py-3">{sp.minLoan} - {sp.maxLoan}</td>
                        <td className="px-4 py-3">{sp.minPeriod} - {sp.maxPeriod} Mth</td>
                        <td className="px-4 py-3">{sp.minInt} - {sp.maxInt}%</td>
                        <td className="px-4 py-3">{sp.penaltyRate}%</td>
                        <td className="px-4 py-3">{sp.guarantors}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setSubProducts(subProducts.filter((_, i) => i !== idx))} type="button" className="text-error-500 hover:bg-error-50 p-1.5 rounded-lg transition-colors"><CloseLineIcon className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Charges Section */}
          <div ref={sectionRefs.charges} className={`p-5 sm:p-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all ${activeTab === 'charges' ? 'ring-2 ring-brand-500/10' : ''}`}>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-500"><ListIcon className="w-4 h-4" /></div> ADDITIONAL CHARGES
            </h2>

            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Description</label>
                  <input value={chargeForm.description} onChange={(e) => setChargeForm({ ...chargeForm, description: e.target.value })} type="text" placeholder="e.g. Document Fee" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Amount</label>
                    <input value={chargeForm.amount} onChange={(e) => setChargeForm({ ...chargeForm, amount: e.target.value })} type="number" placeholder="0.00" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div className="flex-1">
                    <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Type</label>
                    <select value={chargeForm.type} onChange={(e) => setChargeForm({ ...chargeForm, type: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800">
                      <option value="fixed">Fixed</option>
                      <option value="percentage">% Percentage</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold text-gray-700 dark:text-gray-400 uppercase tracking-wide">Deduction Method</label>
                  <select value={chargeForm.deduction} onChange={(e) => setChargeForm({ ...chargeForm, deduction: e.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800">
                    <option value="on_loan_disbursement">On Loan Disbursement</option>
                    <option value="as_first_installment">As First Installment</option>
                  </select>
                </div>
                <button onClick={handleAddCharge} type="button" className="w-full bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                  Add Charge
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {charges.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No charges added.</p>}
              {charges.map((charge, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200">{charge.description}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{charge.amount} {charge.type === 'percentage' ? '%' : ''}</p>
                  </div>
                  <button onClick={() => setCharges(charges.filter((_, i) => i !== idx))} type="button" className="text-error-500 p-1.5 hover:bg-error-50 rounded-lg"><CloseLineIcon className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Section */}
          <div ref={sectionRefs.documents} className={`p-5 sm:p-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm transition-all ${activeTab === 'documents' ? 'ring-2 ring-brand-500/10' : ''}`}>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
              <div className="p-2 bg-brand-50 dark:bg-brand-900/20 text-brand-500 rounded-lg"><HorizontaLDots className="w-4 h-4" /></div> REQUIRED DOCUMENTS
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <input value={docForm.name} onChange={(e) => setDocForm({ ...docForm, name: e.target.value })} type="text" placeholder="e.g. NIC Copy" className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900" />
              <select value={docForm.status} onChange={(e) => setDocForm({ ...docForm, status: e.target.value })} className="sm:w-32 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900">
                <option value="Required">Required</option>
                <option value="Optional">Optional</option>
              </select>
              <button onClick={handleAddDoc} type="button" className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                Add
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div className="flex text-[10px] uppercase font-bold text-gray-400 p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50">
                <div className="flex-[2]">Document Name</div>
                <div className="flex-1">Status</div>
                <div className="w-10"></div>
              </div>
              <div>
                {documents.length === 0 && <p className="text-center text-sm text-gray-400 py-6 bg-white dark:bg-gray-800">No documents added.</p>}
                {documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center p-3 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    <div className="flex-[2] font-semibold text-sm text-gray-900 dark:text-gray-200">{doc.name}</div>
                    <div className="flex-1">
                      <span className={`${doc.status === 'Required' ? 'text-error-500' : 'text-gray-500'} text-xs font-semibold`}>{doc.status}</span>
                    </div>
                    <div className="w-10 text-right">
                      <button onClick={() => setDocuments(documents.filter((_, i) => i !== idx))} type="button" className="text-error-500 hover:text-error-600"><CloseLineIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
