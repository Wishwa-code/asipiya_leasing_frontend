import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { DataTable } from "../../components/ui/table";
import { Modal } from "../../components/ui/modal";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "../../components/ui/drawer";


// SVG icon for Leaflet Marker
import L from "leaflet";
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

type Supplier = {
  ID: number;
  name: string;
  nic: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  contact_no: string;
  occupation: string;
  income: number | string;
  name_in_cheque: string;
  CreatedAt?: string;
};

// Component for picking map location
function LocationPickerMap({ lat, lng, onChange }: { lat: number, lng: number, onChange: (lat: number, lng: number) => void }) {
  const [position, setPosition] = useState<[number, number]>([lat, lng]);
  
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  };

  useEffect(() => {
    setPosition([lat, lng]);
  }, [lat, lng]);

  return (
    <MapContainer center={position} zoom={lat === 7.8731 && lng === 80.7718 ? 7 : 15} style={{ height: "400px", width: "100%", zIndex: 10 }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position} icon={customIcon} />
      <MapEvents />
    </MapContainer>
  );
}

export default function SuppliersManagement() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    nic: "",
    contact_no: "",
    occupation: "",
    income: "",
    name_in_cheque: "",
    latitude: "",
    longitude: "",
    address: ""
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Temp map state
  const [tempLat, setTempLat] = useState<number>(7.8731);
  const [tempLng, setTempLng] = useState<number>(80.7718);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      // Trying to fetch from existing backend endpoint
      const res = await apiClient.get('/suppliers'); 
      // Laravel pagination usually returns data inside data.data or similar. Adjusting based on standard conventions
      setSuppliers(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
      // Fallback dummy data if endpoint fails (for pure frontend demonstration)
      setSuppliers([
        { ID: 1, name: "Uriel Wolf", nic: "784", latitude: 46.0, longitude: 43.0, address: "Dolores fugit eius", contact_no: "644", occupation: "Est quos ratione num", income: "282.00", name_in_cheque: "Plato Woodard", CreatedAt: "2026-04-08 15:15" },
        { ID: 2, name: "Quemby Byrd", nic: "175", latitude: 39.0, longitude: 24.0, address: "Quis vitae harum sed", contact_no: "436", occupation: "Quis velit est irure", income: "364.00", name_in_cheque: "Cheyenne French", CreatedAt: "2026-03-19 11:54" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors for field
    if (errors[name]) {
      setErrors(prev => {
        const newErrs = { ...prev };
        delete newErrs[name];
        return newErrs;
      });
    }
  };

  const openCreateModal = () => {
    setEditSupplierId(null);
    setFormData({
      name: "", nic: "", contact_no: "", occupation: "", income: "", name_in_cheque: "", latitude: "", longitude: "", address: ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (supplier: Supplier) => {
    setEditSupplierId(supplier.ID);
    setFormData({
      name: supplier.name || "",
      nic: supplier.nic || "",
      contact_no: supplier.contact_no || "",
      occupation: supplier.occupation || "",
      income: supplier.income ? supplier.income.toString() : "",
      name_in_cheque: supplier.name_in_cheque || "",
      latitude: supplier.latitude ? supplier.latitude.toString() : "",
      longitude: supplier.longitude ? supplier.longitude.toString() : "",
      address: supplier.address || ""
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrors({});

    try {
      if (editSupplierId) {
        await apiClient.put(`/suppliers/${editSupplierId}`, formData);
      } else {
        await apiClient.post('/suppliers', formData);
      }
      setIsModalOpen(false);
      fetchSuppliers();
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
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await apiClient.delete(`/suppliers/${id}`);
      fetchSuppliers();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const openMap = () => {
    setTempLat(formData.latitude ? parseFloat(formData.latitude) : 7.8731);
    setTempLng(formData.longitude ? parseFloat(formData.longitude) : 80.7718);
    setIsMapModalOpen(true);
  };

  const confirmMapLocation = () => {
    setFormData(prev => ({
      ...prev,
      latitude: tempLat.toFixed(8),
      longitude: tempLng.toFixed(8)
    }));
    setIsMapModalOpen(false);
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.nic && s.nic.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalItems = filteredSuppliers.length;
  const pagedSuppliers = filteredSuppliers.slice(
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
      label: "Name",
      toggleable: false,
      render: (s: Supplier) => (
        <span className="font-semibold text-gray-900 dark:text-white capitalize">
          {s.name || "-"}
        </span>
      ),
    },
    {
      key: "nic",
      label: "NIC",
      toggleable: true,
      render: (s: Supplier) => s.nic || "—",
    },
    {
      key: "coordinates",
      label: "Coordinates",
      toggleable: true,
      render: (s: Supplier) =>
        s.latitude && s.longitude ? (
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {s.latitude}, {s.longitude}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "address",
      label: "Address",
      toggleable: true,
      render: (s: Supplier) => (
        <span className="truncate max-w-[200px] block" title={s.address}>
          {s.address || "—"}
        </span>
      ),
    },
    {
      key: "contact_no",
      label: "Contact No",
      toggleable: true,
      render: (s: Supplier) => s.contact_no || "—",
    },
    {
      key: "occupation",
      label: "Occupation",
      toggleable: true,
      render: (s: Supplier) => s.occupation || "—",
    },
    {
      key: "income",
      label: "Income",
      toggleable: true,
      render: (s: Supplier) =>
        s.income ? parseFloat(s.income.toString()).toFixed(2) : "—",
    },
    {
      key: "name_in_cheque",
      label: "Name in Cheque",
      toggleable: true,
      render: (s: Supplier) => s.name_in_cheque || "—",
    },
    {
      key: "CreatedAt",
      label: "Created At",
      toggleable: true,
      render: (s: Supplier) => s.CreatedAt || "—",
    },
    {
      key: "actions",
      label: "",
      toggleable: false,
      render: (s: Supplier) => (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => openEditModal(s)}
            className="p-1 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded transition-colors"
            aria-label="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <button
            onClick={() => handleDelete(s.ID)}
            className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors"
            aria-label="Delete"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ], [currentPage, pageSize]);

  return (
    <div className="relative pb-20">
      <PageMeta title="Supplier Management | Asipiya Leasing" description="Quickly create and manage suppliers." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quickly create and manage suppliers.</p>
      </div>

      <DataTable<Supplier>
        data={pagedSuppliers}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search NIC or Name..."
        createButton={{
          label: "Create Supplier",
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
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600">
               {editSupplierId ? (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
               ) : (
                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
               )}
              </span>
              {editSupplierId ? "Edit Supplier" : "Create New Supplier"}
            </DrawerTitle>
            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors dark:hover:bg-gray-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </DrawerHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 overflow-y-auto no-scrollbar flex-1 space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-error-500">*</span></label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter Full Name"
                  className={`w-full rounded-xl border ${errors.name ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 transition-shadow`} />
                {errors.name && <p className="mt-1 text-xs text-error-500">{errors.name[0]}</p>}
              </div>

              {/* NIC and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">NIC Number</label>
                  <input type="text" name="nic" value={formData.nic} onChange={handleInputChange} placeholder="Enter NIC (Optional)"
                    className={`w-full rounded-xl border ${errors.nic ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800`} />
                  {errors.nic && <p className="mt-1 text-xs text-error-500">{errors.nic[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Contact Number</label>
                  <input type="text" name="contact_no" value={formData.contact_no} onChange={handleInputChange} placeholder="Enter Contact No"
                    className={`w-full rounded-xl border ${errors.contact_no ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800`} />
                  {errors.contact_no && <p className="mt-1 text-xs text-error-500">{errors.contact_no[0]}</p>}
                </div>
              </div>

              {/* Occ & Income */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Occupation</label>
                  <input type="text" name="occupation" value={formData.occupation} onChange={handleInputChange} placeholder="Enter Occupation"
                    className={`w-full rounded-xl border ${errors.occupation ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800`} />
                  {errors.occupation && <p className="mt-1 text-xs text-error-500">{errors.occupation[0]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Income</label>
                  <input type="number" step="0.01" name="income" value={formData.income} onChange={handleInputChange} placeholder="Enter Income"
                    className={`w-full rounded-xl border ${errors.income ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800`} />
                  {errors.income && <p className="mt-1 text-xs text-error-500">{errors.income[0]}</p>}
                </div>
              </div>

              {/* Name in Cheque */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Name in Cheque</label>
                  <input type="text" name="name_in_cheque" value={formData.name_in_cheque} onChange={handleInputChange} placeholder="Enter Name in Cheque"
                    className={`w-full rounded-xl border ${errors.name_in_cheque ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800`} />
                  {errors.name_in_cheque && <p className="mt-1 text-xs text-error-500">{errors.name_in_cheque[0]}</p>}
                </div>
              </div>

              {/* Map Coordinates & Address */}
              <div className="bg-brand-50/50 dark:bg-brand-900/10 p-5 rounded-2xl border border-brand-100 dark:border-brand-800/50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-white">Location Details</h4>
                  <button type="button" onClick={openMap} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-100 text-brand-600 rounded-lg hover:bg-brand-200 hover:text-brand-700 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {formData.latitude ? "Change Location" : "Pick on Map"}
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Longitude</label>
                    <input type="text" readOnly name="longitude" value={formData.longitude} placeholder="Longitude"
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Latitude</label>
                    <input type="text" readOnly name="latitude" value={formData.latitude} placeholder="Latitude"
                      className="w-full rounded-xl border border-gray-200 bg-white/50 px-3 py-2 text-sm text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Address</label>
                  <textarea name="address" rows={2} value={formData.address} onChange={handleInputChange} placeholder="Enter Temporary Address"
                    className={`w-full rounded-xl border ${errors.address ? 'border-error-500' : 'border-gray-200'} bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800`} />
                  {errors.address && <p className="mt-1 text-xs text-error-500">{errors.address[0]}</p>}
                </div>
              </div>

            </div>
            
            <DrawerFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 text-sm font-bold text-white bg-brand-500 rounded-xl hover:bg-brand-600 focus:ring-4 focus:ring-brand-500/30 transition-all shadow-sm flex items-center gap-2"
              >
                {isSaving ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Saving...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                  {editSupplierId ? "Update Supplier" : "Save Draft"}</>
                )}
              </button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      {/* MAP MODAL */}
      {isMapModalOpen && (
        <Modal
          isOpen={isMapModalOpen}
          onClose={() => setIsMapModalOpen(false)}
          className="max-w-3xl w-full mx-4 my-8 flex flex-col overflow-hidden z-[100000]"
          showCloseButton={false}
        >
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 relative z-20">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Select Location
              </h3>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (p) => { setTempLat(p.coords.latitude); setTempLng(p.coords.longitude); },
                        () => alert("Could not fetch location.")
                      );
                    }
                  }}
                  className="px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg text-xs font-bold hover:bg-brand-100 transition-colors flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                  My Location
                </button>
                <button onClick={() => setIsMapModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors dark:hover:bg-gray-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="relative">
              <LocationPickerMap lat={tempLat} lng={tempLng} onChange={(lat, lng) => { setTempLat(lat); setTempLng(lng); }} />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur shadow-lg rounded-xl p-3 z-[400] border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Selected Coordinates: <span className="text-brand-600 font-bold ml-1">{tempLat.toFixed(6)}, {tempLng.toFixed(6)}</span>
                </p>
                <button onClick={confirmMapLocation} className="px-5 py-2 text-sm font-bold text-white bg-brand-500 rounded-lg hover:bg-brand-600 shadow-sm transition-colors">
                  Confirm
                </button>
              </div>
            </div>
        </Modal>
      )}

    </div>
  );
}
