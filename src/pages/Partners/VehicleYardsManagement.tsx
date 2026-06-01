import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { PlusIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { DataTable } from "../../components/ui/table";

type VehicleYard = {
  ID: number;
  yard_name: string;
  address: string | null;
  province: string | null;
  district: string | null;
  dsd: string | null;
  yard_contact_no: string | null;
  contact_person: string | null;
  mobile_no: string | null;
  status: number | null;
  CreatedAt?: string;
};

export default function VehicleYardsManagement() {
  const [yards, setYards] = useState<VehicleYard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

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
        { ID: 1, yard_name: "Central Yard", address: "123 Main St", province: "Central", district: "Kandy", dsd: "Kandy Kadawath", yard_contact_no: "0812345678", contact_person: "Kamal Perera", mobile_no: "0771122334", status: 1, CreatedAt: "2026-04-10 10:00" },
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
    setEditId(y.ID);
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

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return yards;
    return yards.filter(
      (y) =>
        (y.yard_name && y.yard_name.toLowerCase().includes(q)) ||
        (y.contact_person && y.contact_person.toLowerCase().includes(q)) ||
        (y.district && y.district.toLowerCase().includes(q)) ||
        (y.dsd && y.dsd.toLowerCase().includes(q))
    );
  }, [yards, searchQuery]);

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
      key: "yard_name",
      label: "Yard Name",
      toggleable: false,
      render: (y: VehicleYard) => <span className="font-semibold text-gray-900 dark:text-white">{y.yard_name}</span>,
    },
    {
      key: "contact_person",
      label: "Contact Person",
      toggleable: true,
      render: (y: VehicleYard) => y.contact_person || "—",
    },
    {
      key: "mobile_no",
      label: "Mobile No",
      toggleable: true,
      render: (y: VehicleYard) => y.mobile_no || "—",
    },
    {
      key: "yard_contact_no",
      label: "Landline No",
      toggleable: true,
      render: (y: VehicleYard) => y.yard_contact_no || "—",
    },
    {
      key: "location",
      label: "Location",
      toggleable: true,
      render: (y: VehicleYard) => {
        if (y.district && y.dsd) return `${y.district} (${y.dsd})`;
        return y.district || y.dsd || "—";
      },
    },
    {
      key: "status",
      label: "Status",
      toggleable: true,
      render: (y: VehicleYard) => (
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${y.status === 1 ? 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400'}`}>
          {y.status === 1 ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (y: VehicleYard) => (
        <div className="flex items-center justify-center gap-1.5">
          <button onClick={() => openEditModal(y)} className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors" title="Edit">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          </button>
          <button onClick={() => handleDelete(y.ID)} className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors" title="Delete">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      ),
    },
  ], [currentPage, pageSize]);

  return (
    <div className="relative pb-20">
      <PageMeta title="Vehicle Yards | Asipiya Leasing" description="Create and manage vehicle yards." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Vehicle Yards</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create and manage Vehicle Yards.</p>
      </div>

      <DataTable<VehicleYard>
        data={pagedData}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search Yard Name or District..."
        createButton={{
          label: "Add Vehicle Yard",
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
