import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { PlusIcon } from "../../icons";


type Seizer = {
  ID: number;
  seizer_type: string;
  company_name: string | null;
  company_registration: string | null;
  company_contact_no: string | null;
  nic: string | null;
  seizer_contact_no: string | null;
  mobile_no: string | null;
  address: string | null;
  remarks: string | null;
  status: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  DeletedAt?: string | null;
};

export default function SeizersManagement() {
  const [seizers, setSeizers] = useState<Seizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editSeizerId, setEditSeizerId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    seizer_type: "",
    company_name: "",
    company_registration: "",
    company_contact_no: "",
    nic: "",
    seizer_contact_no: "",
    mobile_no: "",
    address: "",
    remarks: "",
    status: "Active"
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSeizers();
  }, []);

  const fetchSeizers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/seizers'); 
      setSeizers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch seizers", err);
      // Fallback frontend testing data
      setSeizers([
        { ID: 1, seizer_type: "Company", company_name: "Recovery Pros", company_registration: "REG123", company_contact_no: "0112345678", nic: null, seizer_contact_no: null, mobile_no: null, address: "Colombo", remarks: "Good service", status: "Active", CreatedAt: "2026-04-10 10:00" },
        { ID: 2, seizer_type: "Personal", company_name: null, company_registration: null, company_contact_no: null, nic: "987654321V", seizer_contact_no: "0771234567", mobile_no: "0711234567", address: "Galle", remarks: null, status: "Active", CreatedAt: "2026-04-11 11:30" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | boolean = value;

    if (type === 'checkbox') {
      finalValue = (e.target as HTMLInputElement).checked ? "Active" : "Inactive";
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
    setEditSeizerId(null);
    setFormData({
      seizer_type: "", company_name: "", company_registration: "", company_contact_no: "",
      nic: "", seizer_contact_no: "", mobile_no: "", address: "", remarks: "", status: "Active"
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (seizer: Seizer) => {
    setEditSeizerId(seizer.ID);
    setFormData({
      seizer_type: seizer.seizer_type || "",
      company_name: seizer.company_name || "",
      company_registration: seizer.company_registration || "",
      company_contact_no: seizer.company_contact_no || "",
      nic: seizer.nic || "",
      seizer_contact_no: seizer.seizer_contact_no || "",
      mobile_no: seizer.mobile_no || "",
      address: seizer.address || "",
      remarks: seizer.remarks || "",
      status: seizer.status || "Inactive"
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editSeizerId) {
        await apiClient.put(`/seizers/${editSeizerId}`, formData);
      } else {
        await apiClient.post('/seizers', formData);
      }
      setIsModalOpen(false);
      fetchSeizers();
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
    if (!window.confirm("Are you sure you want to delete this seizer?")) return;
    try {
      await apiClient.delete(`/seizers/${id}`);
      fetchSeizers();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredSeizers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return seizers;
    return seizers.filter(
      (s) =>
        (s.company_name && s.company_name.toLowerCase().includes(q)) ||
        (s.nic && s.nic.toLowerCase().includes(q)) ||
        (s.company_registration && s.company_registration.toLowerCase().includes(q)) ||
        (s.seizer_contact_no && s.seizer_contact_no.toLowerCase().includes(q)) ||
        (s.mobile_no && s.mobile_no.toLowerCase().includes(q))
    );
  }, [seizers, searchQuery]);

  const totalItems = filteredSeizers.length;
  const pagedSeizers = filteredSeizers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const columns = useMemo(() => [
    {
      key: "idx",
      label: "#",
      toggleable: false,
      render: (_: any, idx: number) => <span className="text-gray-400 font-semibold">{ (currentPage - 1) * pageSize + idx + 1 }</span>,
    },
    {
      key: "name_nic",
      label: "Seizer Name/NIC",
      toggleable: false,
      render: (s: Seizer) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {s.company_name || s.nic || '—'}
        </span>
      ),
    },
    {
      key: "seizer_type",
      label: "Seizer Type",
      toggleable: true,
      render: (s: Seizer) => (
        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
          {s.seizer_type}
        </span>
      ),
    },
    {
      key: "registration",
      label: "Registration No / Mobile",
      toggleable: true,
      render: (s: Seizer) =>
        s.seizer_type === 'Company' ? s.company_registration || '—' : s.mobile_no || '—',
    },
    {
      key: "contact_no",
      label: "Contact No",
      toggleable: true,
      render: (s: Seizer) =>
        s.seizer_type === 'Company' ? s.company_contact_no || '—' : s.seizer_contact_no || '—',
    },
    {
      key: "status",
      label: "Status",
      toggleable: true,
      render: (s: Seizer) => (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${s.status === 'Active' ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {s.status}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (s: Seizer) => (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => openEditModal(s)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors" title="Edit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDelete(s.ID)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors" title="Delete">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ], [currentPage, pageSize]);

  return (
    <div className="relative pb-20">
      <PageMeta title="Seizers Management | Asipiya Leasing" description="Quickly create and manage seizers." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Seizers Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quickly create and manage Seizers.</p>
      </div>

      <DataTable<Seizer>
        data={pagedSeizers}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search NIC or Company Name..."
        createButton={{
          label: "Create Seizer",
          onClick: openCreateModal,
        }}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />


      {/* Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-brand-500" />
                {editSeizerId ? "Edit Seizer" : "Add New Seizer"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Seizer Type <span className="text-red-500">*</span></label>
                  <select
                    name="seizer_type"
                    value={formData.seizer_type}
                    onChange={handleInputChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800"
                    required
                  >
                    <option value="" disabled>Select</option>
                    <option value="Personal">Personal</option>
                    <option value="Company">Company</option>
                  </select>
                  {errors.seizer_type && <p className="mt-1 text-xs text-red-500">{errors.seizer_type[0]}</p>}
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Company Details</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Company Name" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Registration</label>
                  <input type="text" name="company_registration" value={formData.company_registration} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Reg. No" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Contact No</label>
                  <input type="text" name="company_contact_no" value={formData.company_contact_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Comp. Contact" />
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
			          <h6 className="font-bold text-gray-900 dark:text-white">Personal Details</h6>
		          </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">NIC Number</label>
                  <input type="text" name="nic" value={formData.nic} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="NIC" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Seizer Contact No</label>
                  <input type="text" name="seizer_contact_no" value={formData.seizer_contact_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Seizer Contact" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Mobile Number</label>
                  <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Mobile No" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Address</label>
                  <textarea rows={2} name="address" value={formData.address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Enter Full Address" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Remarks</label>
                  <textarea rows={2} name="remarks" value={formData.remarks} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Any additional information..." />
                </div>
              </div>

              <div className="flex items-center mt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" checked={formData.status === 'Active'} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Seizer is Active</span>
                </label>
              </div>

              <div className="mt-8 flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isSaving} className="rounded-xl border border-transparent bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2">
                  {isSaving ? "Saving..." : (editSeizerId ? "Update Seizer" : "Save Seizer")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
