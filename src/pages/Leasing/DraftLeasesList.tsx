import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link, useNavigate } from "react-router";
import { PlusIcon, PencilIcon, InfoIcon, UserCircleIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";
import { DataTable } from "../../components/ui/table";

type DraftLeaseItem = {
  ID: number;
  customer_id: number;
  draft_code: string;
  internal_identification_name: string;
  current_progress_data: any;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
};

const STEP_LABELS = [
  "Customer details",
  "Introducers",
  "Vehicle & asset details",
  "Insurance info",
  "Product & loan configuration",
  "Guarantors",
  "PDC security",
  "Cheque configuration",
  "CR & compliance documents"
];

function getStepStatuses(parsedData: any) {
  const statuses = Array(9).fill("pristine");
  if (!parsedData) return statuses;

  // Step 1: Customer
  const step1Touched = !!parsedData.customer_db_id || !!parsedData.customer_name;
  if (step1Touched) {
    const step1Complete = !!parsedData.customer_db_id;
    statuses[0] = step1Complete ? "complete" : "error";
  }

  // Step 2: Introducers (Optional)
  const step2Touched = parsedData.introducers && parsedData.introducers.length > 0;
  if (step2Touched) {
    statuses[1] = "complete";
  }

  // Step 3: Vehicle Asset
  const step3Fields = [
    parsedData.vehicle_type_id,
    parsedData.vehicle_make_id,
    parsedData.vehicle_model_id,
    parsedData.vehicle_status,
    parsedData.engine_cc,
    parsedData.chassis_no || parsedData.chasis_no,
    parsedData.manu_year,
    parsedData.color_id,
    parsedData.usage_type,
    parsedData.manu_country,
    parsedData.reg_year,
    parsedData.reg_no,
    parsedData.supplier_id,
    parsedData.market_value,
    parsedData.forced_value,
    parsedData.invoice_value
  ];
  const step3Touched = step3Fields.some(f => !!f);
  if (step3Touched) {
    const step3Complete = step3Fields.every(f => !!f && f !== "0.00" && f !== "0");
    statuses[2] = step3Complete ? "complete" : "error";
  }

  // Step 4: Insurance
  const step4Fields = [
    parsedData.insurance_company,
    parsedData.insurance_amount,
    parsedData.insurance_premium,
    parsedData.insurance_start_date,
    parsedData.insurance_expiry_date
  ];
  const step4Touched = step4Fields.some(f => !!f);
  if (step4Touched) {
    const step4Complete = step4Fields.every(f => !!f);
    statuses[3] = step4Complete ? "complete" : "error";
  }

  // Step 5: Lease Details
  const step5Fields = [
    parsedData.product_id,
    parsedData.loan_amount,
    parsedData.interest_rate,
    parsedData.period,
    parsedData.tcc_collection_date
  ];
  const step5Touched = step5Fields.some(f => !!f);
  if (step5Touched) {
    const step5Complete = step5Fields.every(f => !!f);
    statuses[4] = step5Complete ? "complete" : "error";
  }

  // Step 6: Guarantors
  const reqGuarCount = parseInt(parsedData.required_guarantor_count || "0") || 0;
  const guarantorsCount = parsedData.guarantors ? parsedData.guarantors.length : 0;
  if (reqGuarCount > 0 || guarantorsCount > 0) {
    statuses[5] = (guarantorsCount >= reqGuarCount) ? "complete" : "error";
  }

  // Step 7: PDC Security
  const step7Touched = !!parsedData.pdc_security_type || !!parsedData.pdc_reference_details;
  if (step7Touched) {
    let step7Complete = !!parsedData.pdc_reference_details;
    if (parsedData.pdc_security_type === "Cheque") {
      step7Complete = step7Complete && !!parsedData.pdc_bank_id && !!parsedData.pdc_cheque_date && !!parsedData.pdc_cheque_no && !!parsedData.pdc_ownership;
    } else if (parsedData.pdc_security_type === "CR Book") {
      step7Complete = step7Complete && !!parsedData.pdc_book_date;
    }
    statuses[6] = step7Complete ? "complete" : "error";
  }

  // Step 8: Cheque Define
  const step8Touched = parsedData.cheques && parsedData.cheques.length > 0;
  if (step8Touched) {
    const allChequesValid = parsedData.cheques.every((chq: any) => 
      !!chq.payee_name && !!chq.nic_br_no && !!chq.instructions && 
      !!chq.bank_name && !!chq.branch_name && !!chq.account_number && 
      parseFloat(chq.payment_amount) > 0
    );
    statuses[7] = allChequesValid ? "complete" : "error";
  }

  // Step 9: CR & Docs
  const step9Fields = [
    parsedData.cr_serial_no,
    parsedData.url_cr_front,
    parsedData.url_cr_back,
    parsedData.url_invoice
  ];
  const step9Touched = step9Fields.some(f => !!f);
  if (step9Touched) {
    const step9Complete = step9Fields.every(f => !!f);
    statuses[8] = step9Complete ? "complete" : "error";
  }

  return statuses;
}

export default function DraftLeasesList() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftLeaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filters
  const [filters, setFilters] = useState({
    code: "",
    nic: "",
    name: "",
  });

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      // NOTE: Backend needs an endpoint like GET /leasing-applications/drafts
      const res = await apiClient.get('/leasing-applications/drafts', { params: filters });
      setDrafts(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch drafts", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchDrafts();
  };

  const clearFilters = () => {
    setFilters({ code: "", nic: "", name: "" });
    setCurrentPage(1);
    setTimeout(fetchDrafts, 0);
  };

  const totalItems = drafts.length;
  const pagedDrafts = useMemo(() => {
    return drafts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [drafts, currentPage, pageSize]);

  const columns = useMemo(() => [
    {
      key: "idx",
      label: "#",
      toggleable: false,
      render: (_: any, idx: number) => <span className="text-gray-400 font-semibold">{(currentPage - 1) * pageSize + idx + 1}</span>,
    },
    {
      key: "identity",
      label: "Draft Identity",
      toggleable: false,
      render: (draft: DraftLeaseItem) => {
        return (
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-xs border border-brand-100 dark:border-brand-500/20 shrink-0">
              D
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="px-1.5 py-0.25 bg-brand-500/10 text-brand-500 text-[9px] font-black rounded uppercase tracking-wider">
                  {draft.draft_code || `LSE-DRAFT-${draft.ID}`}
                </span>
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-xs">
                {draft.internal_identification_name || "Unnamed Draft"}
              </h4>
            </div>
          </div>
        );
      }
    },
    {
      key: "customer",
      label: "Customer Details",
      toggleable: true,
      render: (draft: DraftLeaseItem) => {
        let parsedData: any = {};
        try {
          parsedData = typeof draft.current_progress_data === "string" 
            ? JSON.parse(draft.current_progress_data) 
            : draft.current_progress_data;
        } catch (e) {}
        return (
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {parsedData?.customer_name || "Unknown Customer"}
            </div>
            <div className="text-gray-500 text-[10px]">
              Code: {parsedData?.customer_code || "-"}
            </div>
          </div>
        );
      }
    },
    {
      key: "progress",
      label: "Application Progress",
      toggleable: true,
      render: (draft: DraftLeaseItem) => {
        let parsedData: any = {};
        try {
          parsedData = typeof draft.current_progress_data === "string" 
            ? JSON.parse(draft.current_progress_data) 
            : draft.current_progress_data;
        } catch (e) {}
        const statuses = getStepStatuses(parsedData);
        const completedCount = statuses.filter(s => s === "complete").length;
        return (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 whitespace-nowrap">
              {completedCount} / 9
            </span>
            <div className="flex items-center gap-0.5">
              {statuses.map((status, i) => {
                let bgClass = "bg-gray-150 dark:bg-gray-800 border-gray-200 dark:border-gray-750 text-gray-400";
                if (status === "complete") {
                  bgClass = "bg-emerald-500 border-emerald-600 text-white";
                } else if (status === "error") {
                  bgClass = "bg-orange-500 border-orange-600 text-white";
                }
                
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded flex items-center justify-center text-[8px] font-black border select-none transition-transform hover:scale-110 cursor-help ${bgClass}`}
                    title={`Step ${i + 1}: ${STEP_LABELS[i]} (${status === "complete" ? "Complete" : status === "error" ? "Incomplete / Error" : "Pristine"})`}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }
    },
    {
      key: "updated_at",
      label: "Last Updated",
      toggleable: true,
      render: (draft: DraftLeaseItem) => {
        return (
          <div className="text-xs text-gray-500">
            {new Date(draft.UpdatedAt).toLocaleDateString()} {new Date(draft.UpdatedAt).toLocaleTimeString()}
          </div>
        );
      }
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (draft: DraftLeaseItem) => (
        <div className="flex justify-end">
          <button 
            onClick={() => navigate(`${ROUTES.CREATE_LEASE}?draftId=${draft.ID}`)}
            className="p-1 px-2.5 bg-gray-50 hover:bg-brand-50 text-gray-500 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-lg transition-all border border-gray-100 dark:border-gray-700 flex items-center gap-1.5"
            title="Resume Application"
          >
            <PencilIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Resume</span>
          </button>
        </div>
      ),
    },
  ], [currentPage, pageSize]);

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Draft Leasing Applications | Asipiya Leasing"
        description="Manage your draft leasing applications"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Draft Applications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Resume or manage incomplete leasing applications</p>
        </div>
        <Link
          to={ROUTES.CREATE_LEASE}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          New Application
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Context */}
          <div className="lg:border-r border-gray-100 dark:border-gray-700 pr-0 lg:pr-8">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <InfoIcon className="w-3.5 h-3.5" /> Reference
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4 shadow-sm">
              <label className="block text-[11px] font-bold text-brand-500 uppercase mb-1">Draft Code</label>
              <input 
                type="text" 
                placeholder="Enter Draft Ref"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                value={filters.code}
                onChange={(e) => setFilters({...filters, code: e.target.value})}
              />
            </div>
          </div>

          {/* Search Criteria */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <PlusIcon className="w-3.5 h-3.5 rotate-45" /> Search Criteria
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Customer NIC</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><UserCircleIcon className="w-4 h-4" /></span>
                  <input 
                    type="text" 
                    placeholder="Search by NIC"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-brand-500"
                    value={filters.nic}
                    onChange={(e) => setFilters({...filters, nic: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Draft Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><PencilIcon className="w-4 h-4" /></span>
                  <input 
                    type="text" 
                    placeholder="Search by Draft Name"
                    className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-brand-500"
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                type="button" 
                onClick={clearFilters}
                className="px-6 py-2 rounded-full border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
              <button 
                type="submit"
                className="px-8 py-2 rounded-full bg-brand-500 text-white text-sm font-bold shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition-colors"
              >
                Search Drafts
              </button>
            </div>
          </div>
        </form>
      </div>

      <DataTable<DraftLeaseItem>
        data={pagedDrafts}
        columns={columns}
        loading={loading}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>

  );
}
