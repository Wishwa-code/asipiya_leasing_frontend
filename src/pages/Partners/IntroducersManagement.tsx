import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../components/ui/drawer";

type Introducer = {
  ID: number;
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
  CreatedAt?: string;
};

export default function IntroducersManagement() {
  const [introducers, setIntroducers] = useState<Introducer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
        { ID: 1, introducer_type: "Individual", name: "John Doe Broker", registration_no: "123456789V", contact_person: null, primary_contact: "0771122334", secondary_contact: null, email: "john@example.com", address: "Colombo", commission_rate: "5%", bank_details: "HNB - 112233", remarks: "Good broker", status: 1, CreatedAt: "2026-04-10 10:00" },
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
    setEditIntroducerId(introducer.ID);
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

  const filteredIntroducers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return introducers;
    return introducers.filter(
      (s) =>
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.registration_no && s.registration_no.toLowerCase().includes(q)) ||
        (s.primary_contact && s.primary_contact.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q))
    );
  }, [introducers, searchQuery]);

  const totalItems = filteredIntroducers.length;
  const pagedIntroducers = useMemo(() => {
    return filteredIntroducers.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredIntroducers, currentPage, pageSize]);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const columns = useMemo(() => [
    {
      key: "idx",
      label: "#",
      toggleable: false,
      render: (_: any, idx: number) => <span className="text-gray-400 font-semibold">{(currentPage - 1) * pageSize + idx + 1}</span>,
    },
    {
      key: "name",
      label: "Name",
      toggleable: false,
      render: (s: Introducer) => <span className="font-semibold text-gray-900 dark:text-white">{s.name}</span>,
    },
    {
      key: "introducer_type",
      label: "Type",
      toggleable: true,
      render: (s: Introducer) => (
        <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-md">
          {s.introducer_type}
        </span>
      ),
    },
    {
      key: "registration_no",
      label: "Reg / NIC",
      toggleable: true,
      render: (s: Introducer) => s.registration_no || "—",
    },
    {
      key: "primary_contact",
      label: "Primary Contact",
      toggleable: true,
      render: (s: Introducer) => s.primary_contact || "—",
    },
    {
      key: "email",
      label: "Email",
      toggleable: true,
      render: (s: Introducer) => s.email || "—",
    },
    {
      key: "commission_rate",
      label: "Commission Rate",
      toggleable: true,
      render: (s: Introducer) => s.commission_rate || "—",
    },
    {
      key: "status",
      label: "Status",
      toggleable: true,
      render: (s: Introducer) => (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${s.status === 1 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {s.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (s: Introducer) => (
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
      <PageMeta title="Introducers Management | Asipiya Leasing" description="Quickly create and manage introducers." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Introducers Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quickly create and manage Introducers.</p>
      </div>

      <DataTable<Introducer>
        data={pagedIntroducers}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search Name or Reg No..."
        createButton={{
          label: "Create Introducer",
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

      {/* CREATE/EDIT DRAWER */}
      <Drawer open={isModalOpen} onOpenChange={setIsModalOpen} direction="right">
        <DrawerContent className="h-full flex flex-col">
          <DrawerHeader className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
            <DrawerTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <PlusIcon className="w-5 h-5 text-brand-500" />
              {editIntroducerId ? "Edit Introducer" : "Add New Introducer"}
            </DrawerTitle>
            <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </DrawerHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              
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
            </div>

            <DrawerFooter className="p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="rounded-xl border border-transparent bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2">
                {isSaving ? "Saving..." : (editIntroducerId ? "Update Introducer" : "Save Introducer")}
              </button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  );
}
