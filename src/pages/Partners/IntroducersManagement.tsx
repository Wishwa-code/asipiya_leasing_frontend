import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import apiClient from "../../api/apiClient";

type Introducer = {
  id: number;
  introducer_type: string;
  name: string;
  registration_no: string | null;
  contact_person: string | null;
  primary_contact: string | null;
  secondary_contact: string | null;
  email: string | null;
  address: string | null;
  commission_rate: string | null;
  bank_details: string | null;
  remarks: string | null;
  status: number;
  created_at: string;
};

export default function IntroducersManagement() {
  const [introducers, setIntroducers] = useState<Introducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editIntroducerId, setEditIntroducerId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    introducer_type: "",
    name: "",
    registration_no: "",
    contact_person: "",
    primary_contact: "",
    secondary_contact: "",
    email: "",
    address: "",
    commission_rate: "",
    bank_details: "",
    remarks: "",
    status: 1
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchIntroducers();
  }, []);

  const fetchIntroducers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/introducers'); 
      setIntroducers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch introducers", err);
      // Fallback frontend testing data
      setIntroducers([
        { id: 1, introducer_type: "Individual", name: "John Doe Broker", registration_no: "123456789V", contact_person: null, primary_contact: "0771122334", secondary_contact: null, email: "john@example.com", address: "Colombo", commission_rate: "5%", bank_details: "HNB - 112233", remarks: "Good broker", status: 1, created_at: "2026-04-10 10:00" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    setEditIntroducerId(null);
    setFormData({
      introducer_type: "", name: "", registration_no: "", contact_person: "",
      primary_contact: "", secondary_contact: "", email: "", address: "", commission_rate: "", bank_details: "", remarks: "", status: 1
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (introducer: Introducer) => {
    setEditIntroducerId(introducer.id);
    setFormData({
      introducer_type: introducer.introducer_type || "",
      name: introducer.name || "",
      registration_no: introducer.registration_no || "",
      contact_person: introducer.contact_person || "",
      primary_contact: introducer.primary_contact || "",
      secondary_contact: introducer.secondary_contact || "",
      email: introducer.email || "",
      address: introducer.address || "",
      commission_rate: introducer.commission_rate || "",
      bank_details: introducer.bank_details || "",
      remarks: introducer.remarks || "",
      status: introducer.status !== undefined ? introducer.status : 1
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editIntroducerId) {
        await apiClient.put(`/introducers/${editIntroducerId}`, formData);
      } else {
        await apiClient.post('/introducers', formData);
      }
      setIsModalOpen(false);
      fetchIntroducers();
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
    if (!window.confirm("Are you sure you want to delete this introducer?")) return;
    try {
      await apiClient.delete(`/introducers/${id}`);
      fetchIntroducers();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredIntroducers = introducers.filter(s =>
    (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.registration_no && s.registration_no.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.primary_contact && s.primary_contact.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="relative pb-20">
      <PageMeta title="Introducers Management | Asipiya Leasing" description="Quickly create and manage introducers." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Introducers Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quickly create and manage Introducers.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Table Header area */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-4">
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Existing Introducers
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Create Introducer
          </button>
        </div>

        {/* Table Filters area */}
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
            placeholder="Search Name or Reg No..."
            className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table area */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading introducers...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                  <th className="px-5 py-4">#</th>
                  <th className="px-5 py-4">Introducer Name</th>
                  <th className="px-5 py-4">Contact Info</th>
                  <th className="px-5 py-4">Commission</th>
                  <th className="px-5 py-4 text-center">Status</th>
                  <th className="px-5 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
                {filteredIntroducers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">No introducers found.</td>
                  </tr>
                ) : (
                  filteredIntroducers.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 font-medium">{idx + 1}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {s.name} <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md ml-2">{s.introducer_type}</span>
                        </div>
                        <div className="text-gray-500 text-xs mt-1">
                          Reg: {s.registration_no || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {s.primary_contact}
                        </div>
                        {s.email && <div className="text-gray-500 text-xs mt-1">{s.email}</div>}
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-gray-700 dark:text-gray-300">
                          {s.commission_rate || 'N/A'}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${s.status === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {s.status === 1 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEditModal(s)} className="p-1.5 text-blue-600 hover:bg-blue-50 focus:bg-blue-50 rounded-lg transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                          <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 focus:bg-red-50 rounded-lg transition-colors" title="Delete">
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

      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-brand-500" />
                {editIntroducerId ? "Edit Introducer" : "Add New Introducer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Introducer Type <span className="text-red-500">*</span></label>
                  <select
                    name="introducer_type"
                    value={formData.introducer_type}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800"
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="Individual">Individual</option>
                    <option value="Agency">Agency</option>
                  </select>
                  {errors.introducer_type && <p className="mt-1 text-xs text-red-500">{errors.introducer_type[0]}</p>}
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Basic Information</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Name <span className="text-red-500">*</span></label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Introducer Name" required/>
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Registration / NIC</label>
                  <input type="text" name="registration_no" value={formData.registration_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="NIC or Reg. No" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                  <input type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Contact Person" />
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Contact & Other Details</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Primary Contact</label>
                  <input type="text" name="primary_contact" value={formData.primary_contact} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Phone No" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Secondary Contact</label>
                  <input type="text" name="secondary_contact" value={formData.secondary_contact} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Alternative Phone" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Email Address" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Commission Rate</label>
                  <input type="text" name="commission_rate" value={formData.commission_rate} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="% or Fixed Amount" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Bank Details</label>
                  <input type="text" name="bank_details" value={formData.bank_details} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Bank Information" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <textarea rows={2} name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Enter Full Address" />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                  <textarea rows={2} name="remarks" value={formData.remarks} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Any additional information..." />
                </div>
              </div>

              <div className="flex items-center mt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" checked={formData.status === 1} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Introducer is Active</span>
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="rounded-xl border border-transparent bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2">
                  {isSaving ? "Saving..." : (editIntroducerId ? "Update Introducer" : "Save Introducer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
