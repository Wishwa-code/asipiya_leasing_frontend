import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link, useNavigate } from "react-router";
import { PlusIcon, EyeIcon, PencilIcon, UserCircleIcon, HorizontaLDots, InfoIcon, CalenderIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { ROUTES } from "../../routes/paths";

type CustomerListItem = {
  id: number;
  customer_code: string;
  full_name: string;
  first_name: string;
  last_name: string;
  title: string;
  new_nic: string;
  old_nic: string;
  contact_no: string;
  email: string;
  status: string;
  city: string;
  latitude: number;
  longitude: number;
};

export default function CustomerList() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState({
    code: "",
    nic: "",
    status: "",
    query: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Note: Backend endpoint will need to support these query params
      const res = await apiClient.get('/customers', { params: filters });
      setCustomers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
  };

  const clearFilters = () => {
    setFilters({ code: "", nic: "", status: "", query: "" });
    // We'll need to refetch after clearing
    setTimeout(fetchCustomers, 0);
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    setCustomers(customers.map(c => c.id === id ? { ...c, status: newStatus } : c));
    try {
      await apiClient.post(`/customers/${id}/status`, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
      setCustomers(customers.map(c => c.id === id ? { ...c, status: currentStatus } : c));
    }
  };

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Customer List | Asipiya Leasing"
        description="Manage your customers and their details"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Customer List</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your customers and their details</p>
        </div>
        <Link
          to={ROUTES.CREATE_CUSTOMER}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Create Customer
        </Link>
      </div>

      {/* Filter Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* System Context */}
          <div className="lg:border-r border-gray-100 dark:border-gray-700 pr-0 lg:pr-8">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <InfoIcon className="w-3.5 h-3.5" /> System Context
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 mb-4 shadow-sm">
              <label className="block text-[11px] font-bold text-brand-500 uppercase mb-1">Customer Code</label>
              <input 
                type="text" 
                placeholder="Enter Number"
                className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg font-bold text-gray-900 dark:text-white placeholder:text-gray-300 dark:placeholder:text-gray-600"
                value={filters.code}
                onChange={(e) => setFilters({...filters, code: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Collection Day *</label>
              <select className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500">
                <option value="">Select Day</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>

          {/* Search Criteria */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <PlusIcon className="w-3.5 h-3.5 rotate-45" /> Search Criteria
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">NIC / Identity Number</label>
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
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Registration Status</label>
                <select 
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm outline-none focus:border-brand-500"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">Any Status</option>
                  <option value="active">Active Records</option>
                  <option value="inactive">Deleted / Inactive</option>
                </select>
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
                Search Records
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
                <th className="px-6 py-4">Customer Identity</th>
                <th className="px-6 py-4">Status Details</th>
                <th className="px-6 py-4">Contact Points</th>
                <th className="px-6 py-4">Location Context</th>
                <th className="px-6 py-4 text-right">Record Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="inline-block w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></span>
                    <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-500">Retrieving Records...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <p className="font-semibold text-base">No customers found</p>
                    <p className="text-sm">Try adjusting your search filters</p>
                  </td>
                </tr>
              ) : (
                customers.map((customer, idx) => (
                  <tr key={customer.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-5 text-center font-bold text-gray-400">{idx + 1}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center font-bold text-lg border border-brand-100 dark:border-brand-500/20">
                          {customer.first_name?.[0]}{customer.last_name?.[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-0.5">{customer.title} {customer.full_name}</h4>
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">Code: {customer.customer_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${customer.status === 'active' ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 'bg-error-50 text-error-600 dark:bg-error-500/10'}`}>
                          {customer.status}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer scale-90 -ml-1">
                          <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={customer.status === 'active'} 
                            onChange={() => toggleStatus(customer.id, customer.status)}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                        </label>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                          <span className="text-gray-400"><InfoIcon className="w-3.5 h-3.5" /></span>
                          {customer.contact_no}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                          <span className="text-gray-300"><HorizontaLDots className="w-3.5 h-3.5" /></span>
                          {customer.email || 'No Email'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-gray-100 dark:bg-gray-700 rounded text-brand-500"><CalenderIcon className="w-3 h-3" /></span>
                          <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-tighter">No Assigned Route</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="p-1 bg-gray-100 dark:bg-gray-700 rounded text-brand-500"><UserCircleIcon className="w-3 h-3" /></span>
                          <span className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-tighter">{customer.new_nic || customer.old_nic}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700">
                          <HorizontaLDots className="w-4 h-4" />
                        </button>
                        <button className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700">
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => navigate(ROUTES.EDIT_CUSTOMER.replace(':id', customer.id.toString()))}
                          className="p-2.5 bg-gray-50 hover:bg-brand-50 text-gray-400 hover:text-brand-500 dark:bg-gray-900 dark:hover:bg-brand-500/10 rounded-xl transition-all shadow-sm border border-gray-100 dark:border-gray-700"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            Showing {customers.length > 0 ? 1 : 0} to {customers.length} of {customers.length} entries
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
