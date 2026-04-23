import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import apiClient from "../../api/apiClient";

type ValuationCompany = {
  ID: number;
  company_name: string;
  contact_person_1_name: string | null;
  contact_person_2_name: string | null;
  contact_person_1_mobile: string | null;
  contact_person_2_mobile: string | null;
  address: string | null;
  note: string | null;
  CreatedAt?: string;
};

export default function ValuationCompaniesManagement() {
  const [valuationCompanies, setValuationCompanies] = useState<ValuationCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    company_name: "",
    contact_person_1_name: "",
    contact_person_2_name: "",
    contact_person_1_mobile: "",
    contact_person_2_mobile: "",
    address: "",
    note: ""
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchValuationCompanies();
  }, []);

  const fetchValuationCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/valuation-companies');
      setValuationCompanies(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch valuation companies", err);
      // Fallback
      setValuationCompanies([
        { ID: 1, company_name: "ABC Valuators", contact_person_1_name: "John Doe", contact_person_2_name: "Jane Smith", contact_person_1_mobile: "0771234567", contact_person_2_mobile: "0711234567", address: "Colombo", note: "Reliable", CreatedAt: "2026-04-10 10:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const openCreateModal = () => {
    setEditId(null);
    setFormData({
      company_name: "", contact_person_1_name: "", contact_person_2_name: "",
      contact_person_1_mobile: "", contact_person_2_mobile: "", address: "", note: ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (vc: ValuationCompany) => {
    setEditId(vc.ID);
    setFormData({
      company_name: vc.company_name || "",
      contact_person_1_name: vc.contact_person_1_name || "",
      contact_person_2_name: vc.contact_person_2_name || "",
      contact_person_1_mobile: vc.contact_person_1_mobile || "",
      contact_person_2_mobile: vc.contact_person_2_mobile || "",
      address: vc.address || "",
      note: vc.note || ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editId) {
        await apiClient.put(`/valuation-companies/${editId}`, formData);
      } else {
        await apiClient.post('/valuation-companies', formData);
      }
      setIsModalOpen(false);
      fetchValuationCompanies();
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this company?")) return;
    try {
      await apiClient.delete(`/valuation-companies/${id}`);
      fetchValuationCompanies();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredData = valuationCompanies.filter(c =>
    (c.company_name && c.company_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.contact_person_1_mobile && c.contact_person_1_mobile.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative pb-20">
      <PageMeta title="Valuation Companies | Asipiya Leasing" description="Create and manage valuation companies." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Valuation Companies</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage Valuation Companies.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-4">
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Existing Companies
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Valuation Company
          </button>
        </div>

        <div className="px-5 py-4 flex flex-col sm:flex-row justify-between gap-4 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <select className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-900 transition-colors cursor-pointer">
              <option value="10">10 entries</option>
              <option value="25">25 entries</option>
              <option value="50">50 entries</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Search Companies..."
            className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading companies...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Company Name</th>
                  <th className="px-5 py-4">Primary Contact</th>
                  <th className="px-5 py-4">Created At</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">No companies found.</td>
                  </tr>
                ) : (
                  filteredData.map((c, idx) => (
                    <tr key={c.ID} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                        {c.company_name}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {c.contact_person_1_name || 'N/A'} {c.contact_person_1_mobile ? `(${c.contact_person_1_mobile})` : ''}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400">
                        {c.CreatedAt ? new Date(c.CreatedAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(c.ID)} className="p-1.5 text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-brand-500" />
                {editId ? "Edit Valuation Company" : "Add Valuation Company"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Name <span className="text-red-500">*</span></label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Enter Company Name" required/>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Primary Contact Person</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input type="text" name="contact_person_1_name" value={formData.contact_person_1_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <input type="text" name="contact_person_1_mobile" value={formData.contact_person_1_mobile} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. 0771234567" />
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Secondary Contact Person</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input type="text" name="contact_person_2_name" value={formData.contact_person_2_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <input type="text" name="contact_person_2_mobile" value={formData.contact_person_2_mobile} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. 0711234567" />
                </div>
              </div>

              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Address</label>
                <textarea rows={2} name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Full address" />
              </div>

              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Note</label>
                <textarea rows={2} name="note" value={formData.note} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Any remarks..." />
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="rounded-xl border border-transparent bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2">
                  {isSaving ? "Saving..." : (editId ? "Update Company" : "Save Company")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
