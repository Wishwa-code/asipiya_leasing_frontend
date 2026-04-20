import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import apiClient from "../../api/apiClient";

type VehicleYard = {
  id: number;
  yard_name: string;
  address: string | null;
  province: string | null;
  district: string | null;
  dsd: string | null;
  yard_contact_no: string | null;
  contact_person: string | null;
  mobile_no: string | null;
  status: number | null;
  created_at: string;
};

export default function VehicleYardsManagement() {
  const [yards, setYards] = useState<VehicleYard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    yard_name: "",
    address: "",
    province: "",
    district: "",
    dsd: "",
    yard_contact_no: "",
    contact_person: "",
    mobile_no: "",
    status: 1
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchYards();
  }, []);

  const fetchYards = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/vehicle-yards');
      setYards(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch vehicle yards", err);
      // Fallback
      setYards([
        { id: 1, yard_name: "Central Yard", address: "123 Main St", province: "Central", district: "Kandy", dsd: "Kandy Kadawath", yard_contact_no: "0812345678", contact_person: "Kamal Perera", mobile_no: "0771122334", status: 1, created_at: "2026-04-10 10:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked ? 1 : 0;
    }

    setFormData(prev => ({ ...prev, [name]: finalValue }));
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
      yard_name: "", address: "", province: "", district: "", dsd: "",
      yard_contact_no: "", contact_person: "", mobile_no: "", status: 1
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (y: VehicleYard) => {
    setEditId(y.id);
    setFormData({
      yard_name: y.yard_name || "",
      address: y.address || "",
      province: y.province || "",
      district: y.district || "",
      dsd: y.dsd || "",
      yard_contact_no: y.yard_contact_no || "",
      contact_person: y.contact_person || "",
      mobile_no: y.mobile_no || "",
      status: y.status !== undefined && y.status !== null ? y.status : 1
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
        await apiClient.put(`/vehicle-yards/${editId}`, formData);
      } else {
        await apiClient.post('/vehicle-yards', formData);
      }
      setIsModalOpen(false);
      fetchYards();
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
    if (!window.confirm("Are you sure you want to delete this yard?")) return;
    try {
      await apiClient.delete(`/vehicle-yards/${id}`);
      fetchYards();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredData = yards.filter(y =>
    (y.yard_name && y.yard_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (y.contact_person && y.contact_person.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (y.district && y.district.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative pb-20">
      <PageMeta title="Vehicle Yards | Asipiya Leasing" description="Create and manage vehicle yards." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Vehicle Yards</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage Vehicle Yards.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-4">
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Existing Yards
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Add Vehicle Yard
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
            placeholder="Search Yard Name or District..."
            className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading yards...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Yard Name</th>
                  <th className="px-5 py-4">Contact Person</th>
                  <th className="px-5 py-4">Location</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">No yards found.</td>
                  </tr>
                ) : (
                  filteredData.map((y, idx) => (
                    <tr key={y.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">
                        {y.yard_name}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {y.contact_person || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {y.mobile_no} {y.yard_contact_no ? ` / ${y.yard_contact_no}` : ''}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-300">
                          {y.district || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {y.dsd || ''}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${y.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {y.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(y)} className="p-1.5 text-blue-600 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(y.id)} className="p-1.5 text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg transition-colors" title="Delete">
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
                {editId ? "Edit Vehicle Yard" : "Add Vehicle Yard"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Yard Name <span className="text-red-500">*</span></label>
                <input type="text" name="yard_name" value={formData.yard_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Enter Yard Name" required/>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Contact Information</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                  <input type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Manager Name" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Yard Contact Number</label>
                  <input type="text" name="yard_contact_no" value={formData.yard_contact_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Yard Phone" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Mobile Phone" />
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Location Details</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Province</label>
                  <input type="text" name="province" value={formData.province} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Province" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">District</label>
                  <input type="text" name="district" value={formData.district} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="District" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">DSD</label>
                  <input type="text" name="dsd" value={formData.dsd} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Divisional Secretariat" />
                </div>
              </div>

              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Full Address</label>
                <textarea rows={2} name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Full address" />
              </div>

              <div className="flex items-center mt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" checked={formData.status === 1} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Yard is Active</span>
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="rounded-xl border border-transparent bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2">
                  {isSaving ? "Saving..." : (editId ? "Update Yard" : "Save Yard")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
