import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link, useNavigate } from "react-router";
import { PlusIcon, PencilIcon, InfoIcon, UserCircleIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";

type DraftLeaseItem = {
  ID: number;
  customer_id: number;
  draft_code: string;
  current_progress_data: any;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
};

export default function DraftLeasesList() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState<DraftLeaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    code: "",
    nic: "",
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
    fetchDrafts();
  };

  const clearFilters = () => {
    setFilters({ code: "", nic: "" });
    setTimeout(fetchDrafts, 0);
  };

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

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 w-12 text-center">#</th>
                <th className="px-6 py-4">Draft Identity</th>
                <th className="px-6 py-4">Customer Details</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <span className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></span>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-500">Retrieving Drafts...</p>
                  </td>
                </tr>
              ) : drafts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-400">
                    <p className="font-semibold text-base">No drafts found</p>
                    <p className="text-sm">Try adjusting your search filters</p>
                  </td>
                </tr>
              ) : (
                drafts.map((draft, idx) => {
                  let parsedData: any = {};
                  try {
                    parsedData = typeof draft.current_progress_data === "string" 
                      ? JSON.parse(draft.current_progress_data) 
                      : draft.current_progress_data;
                  } catch (e) {}

                  return (
                    <tr key={`${draft.ID}-${idx}`} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                      <td className="px-6 py-5 text-center font-bold text-gray-400">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-lg border border-brand-100 dark:border-brand-500/20">
                            D
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 dark:text-white mb-0.5">ID: {draft.ID}</h4>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Status: Draft</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                            {parsedData?.customer_name || "Unknown Customer"}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                            Code: {parsedData?.customer_code || "-"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 text-xs text-gray-500">
                          <div>{new Date(draft.UpdatedAt).toLocaleDateString()}</div>
                          <div>{new Date(draft.UpdatedAt).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => navigate(`${ROUTES.CREATE_LEASE}?draftId=${draft.ID}`)}
                            className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2"
                            title="Resume Application"
                          >
                            <PencilIcon className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline-block">Resume</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {drafts.length > 0 ? 1 : 0} to {drafts.length} of {drafts.length} entries
          </p>
          <div className="flex gap-2">
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-400 cursor-not-allowed uppercase tracking-widest">Previous</button>
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-white flex items-center justify-center text-xs font-bold">1</div>
            <button className="px-4 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-xs font-bold text-gray-400 cursor-not-allowed uppercase tracking-widest">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
