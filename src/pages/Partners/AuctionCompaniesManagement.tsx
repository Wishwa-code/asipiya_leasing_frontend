import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";
import { PlusIcon } from "../../icons";


type AuctionCompany = {
  ID: number;
  name: string;
  contact_no_1: string | null;
  contact_no_2: string | null;
  contact_person: string | null;
  address: string | null;
  note: string | null;
  CreatedAt?: string;
};

export default function AuctionCompaniesManagement() {
  const [companies, setCompanies] = useState<AuctionCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    contact_no_1: "",
    contact_no_2: "",
    contact_person: "",
    address: "",
    note: ""
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/auction-companies');
      setCompanies(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch auction companies", err);
      setCompanies([
        { ID: 1, name: "Prime Auctions Ltd", contact_person: "Mark Davis", contact_no_1: "0771234567", contact_no_2: "", address: "Kandy", note: "Vehicle auctions", CreatedAt: "2026-04-10 10:00" },
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
      name: "", contact_no_1: "", contact_no_2: "", contact_person: "", address: "", note: ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (c: AuctionCompany) => {
    setEditId(c.ID);
    setFormData({
      name: c.name || "",
      contact_no_1: c.contact_no_1 || "",
      contact_no_2: c.contact_no_2 || "",
      contact_person: c.contact_person || "",
      address: c.address || "",
      note: c.note || ""
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
        await apiClient.put(`/auction-companies/${editId}`, formData);
      } else {
        await apiClient.post('/auction-companies', formData);
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
      await apiClient.delete(`/auction-companies/${id}`);
      fetchCompanies();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const filteredData = companies.filter(c =>
    (c.name && c.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.contact_person && c.contact_person.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = filteredData.length;
  const pagedData = filteredData.slice(
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
      key: "name",
      label: "Company Name",
      toggleable: false,
      render: (c: AuctionCompany) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {c.name}
        </span>
      ),
    },
    {
      key: "contact_person",
      label: "Contact Person",
      toggleable: true,
      render: (c: AuctionCompany) => c.contact_person || "—",
    },
    {
      key: "contact_no",
      label: "Contact Numbers",
      toggleable: true,
      render: (c: AuctionCompany) => {
        const numbers = [c.contact_no_1, c.contact_no_2].filter(Boolean).join(" / ");
        return numbers || "—";
      },
    },
    {
      key: "CreatedAt",
      label: "Created At",
      toggleable: true,
      render: (c: AuctionCompany) => c.CreatedAt ? new Date(c.CreatedAt).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (c: AuctionCompany) => (
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
      <PageMeta title="Auction Companies | Asipiya Leasing" description="Create and manage auction companies." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Auction Companies</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage Auction Companies.</p>
      </div>

      <DataTable<AuctionCompany>
        data={pagedData}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search Companies..."
        createButton={{
          label: "Add Auction Company",
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


      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4">
          <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-gray-800 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 p-5 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <PlusIcon className="w-5 h-5 text-brand-500" />
                {editId ? "Edit Auction Company" : "Add Auction Company"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-700 dark:hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              
              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Company Name <span className="text-red-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Enter Company Name" required/>
              </div>

              <div className="mb-5 text-sm">
                <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Contact Person</label>
                <input type="text" name="contact_person" value={formData.contact_person} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="e.g. John Doe" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Contact Number 1</label>
                  <input type="text" name="contact_no_1" value={formData.contact_no_1} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Primary Contact" />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-gray-700 dark:text-gray-300">Contact Number 2</label>
                  <input type="text" name="contact_no_2" value={formData.contact_no_2} onChange={handleInputChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 outline-none focus:border-brand-500 dark:border-gray-700 dark:bg-gray-800" placeholder="Secondary Contact" />
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
