import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../components/ui/drawer";

type InsuranceCompany = {
  ID: number;
  company_code: string | null;
  company_name: string;
  head_office_address: string | null;
  contact_person: string | null;
  contact_mobile: string | null;
  contact_email: string | null;
  contact_person2: string | null;
  contact_person2_mobile: string | null;
  contact_person2_email: string | null;
  commision_rate: string | null;
  bank_account_no: string | null;
  bank_account_name: string | null;
  bank_name: string | null;
  status: number | null;
  CreatedAt?: string;
};

export default function InsuranceCompaniesManagement() {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    company_code: "",
    company_name: "",
    head_office_address: "",
    contact_person: "",
    contact_mobile: "",
    contact_email: "",
    contact_person2: "",
    contact_person2_mobile: "",
    contact_person2_email: "",
    commision_rate: "",
    bank_account_no: "",
    bank_account_name: "",
    bank_name: "",
    status: 1
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/insuarance-companies');
      setCompanies(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch insurance companies", err);
      // Fallback
      setCompanies([
        { ID: 1, company_name: "SafeLife Insurance", company_code: "SL001", head_office_address: "Colombo", contact_person: "John Doe", contact_mobile: "0771234567", contact_email: "john@safelife.com", contact_person2: null, contact_person2_mobile: null, contact_person2_email: null, commision_rate: "5%", bank_account_no: "112233", bank_account_name: "SafeLife PVT", bank_name: "BOC", status: 1, CreatedAt: "2026-04-10 10:00" },
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
      company_code: "", company_name: "", head_office_address: "",
      contact_person: "", contact_mobile: "", contact_email: "",
      contact_person2: "", contact_person2_mobile: "", contact_person2_email: "",
      commision_rate: "", bank_account_no: "", bank_account_name: "", bank_name: "", status: 1
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (c: InsuranceCompany) => {
    setEditId(c.ID);
    setFormData({
      company_code: c.company_code || "",
      company_name: c.company_name || "",
      head_office_address: c.head_office_address || "",
      contact_person: c.contact_person || "",
      contact_mobile: c.contact_mobile || "",
      contact_email: c.contact_email || "",
      contact_person2: c.contact_person2 || "",
      contact_person2_mobile: c.contact_person2_mobile || "",
      contact_person2_email: c.contact_person2_email || "",
      commision_rate: c.commision_rate || "",
      bank_account_no: c.bank_account_no || "",
      bank_account_name: c.bank_account_name || "",
      bank_name: c.bank_name || "",
      status: c.status !== undefined && c.status !== null ? c.status : 1
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
        await apiClient.put(`/insuarance-companies/${editId}`, formData);
      } else {
        await apiClient.post('/insuarance-companies', formData);
      }
      setIsModalOpen(false);
      fetchCompanies();
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
      await apiClient.delete(`/insuarance-companies/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.company_code && c.company_code.toLowerCase().includes(q)) ||
        (c.contact_person && c.contact_person.toLowerCase().includes(q)) ||
        (c.contact_mobile && c.contact_mobile.toLowerCase().includes(q))
    );
  }, [companies, searchQuery]);

  const totalItems = filteredData.length;
  const pagedData = useMemo(() => {
    return filteredData.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredData, currentPage, pageSize]);

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
      key: "company_name",
      label: "Company Name",
      toggleable: false,
      render: (c: InsuranceCompany) => <span className="font-semibold text-gray-900 dark:text-white">{c.company_name}</span>,
    },
    {
      key: "company_code",
      label: "Company Code",
      toggleable: true,
      render: (c: InsuranceCompany) => c.company_code || "—",
    },
    {
      key: "contact_person",
      label: "Contact Person",
      toggleable: true,
      render: (c: InsuranceCompany) => c.contact_person || "—",
    },
    {
      key: "contact_mobile",
      label: "Mobile",
      toggleable: true,
      render: (c: InsuranceCompany) => c.contact_mobile || "—",
    },
    {
      key: "bank_details",
      label: "Bank Details",
      toggleable: true,
      render: (c: InsuranceCompany) => c.bank_name ? `${c.bank_name} - ${c.bank_account_no}` : "—",
    },
    {
      key: "status",
      label: "Status",
      toggleable: true,
      render: (c: InsuranceCompany) => (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${c.status === 1 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {c.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (c: InsuranceCompany) => (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => openEditModal(c)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors" title="Edit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDelete(c.ID)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors" title="Delete">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ], [currentPage, pageSize]);

  return (
    <div className="relative pb-20">
      <PageMeta title="Insurance Companies | Asipiya Leasing" description="Create and manage insurance companies." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Insurance Companies</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage Insurance Companies.</p>
      </div>

      <DataTable<InsuranceCompany>
        data={pagedData}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search Company Code or Name..."
        createButton={{
          label: "Add Insurance Company",
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
              {editId ? "Edit Insurance Company" : "Add Insurance Company"}
            </DrawerTitle>
            <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </DrawerHeader>
          
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Name <span className="text-red-500">*</span></label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Enter Company Name" required/>
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Code</label>
                  <input type="text" name="company_code" value={formData.company_code} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. SL001" />
                </div>
              </div>

              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Head Office Address</label>
                <textarea rows={2} name="head_office_address" value={formData.head_office_address} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Full address" />
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h6 className="font-bold text-gray-900 dark:text-white">Primary Contact Person</h6>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Mobile</label>
                  <input type="text" name="contact_mobile" value={formData.contact_mobile} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. 0771234567" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" name="contact_email" value={formData.contact_email} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Email Address" />
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h6 className="font-bold text-gray-900 dark:text-white">Secondary Contact Person</h6>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Name</label>
                  <input type="text" name="contact_person2" value={formData.contact_person2} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Mobile</label>
                  <input type="text" name="contact_person2_mobile" value={formData.contact_person2_mobile} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. 0771234567" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input type="email" name="contact_person2_email" value={formData.contact_person2_email} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Email Address" />
                </div>
              </div>

              <div className="mb-5 mt-6 border-b border-gray-200 dark:border-gray-700 pb-2">
                <h6 className="font-bold text-gray-900 dark:text-white">Financial Details</h6>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Commission Rate</label>
                  <input type="text" name="commision_rate" value={formData.commision_rate} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. 5%" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Bank Name</label>
                  <input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. BOC" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Account Name</label>
                  <input type="text" name="bank_account_name" value={formData.bank_account_name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Account Name" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Account No</label>
                  <input type="text" name="bank_account_no" value={formData.bank_account_no} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Account Number" />
                </div>
              </div>

              <div className="flex items-center mt-6">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="status" checked={formData.status === 1} onChange={handleInputChange} className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                  <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Company is Active</span>
                </label>
              </div>
            </div>

            <DrawerFooter className="p-4 flex justify-end gap-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={isSaving} className="rounded-xl border border-transparent bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus:bg-brand-600 focus:ring-4 focus:ring-brand-500/20 disabled:opacity-50 transition-all flex items-center gap-2">
                {isSaving ? "Saving..." : (editId ? "Update Company" : "Save Company")}
              </button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

    </div>
  );
}
