import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link } from "react-router";
import { PlusIcon, EyeIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

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
  id: number;
  name: string;
  nic: string;
  latitude: number | null;
  longitude: number | null;
  address: string;
  contact_no: string;
  occupation: string;
  income: number | string;
  name_in_cheque: string;
  created_at: string;
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
        { id: 1, name: "Uriel Wolf", nic: "784", latitude: 46.0, longitude: 43.0, address: "Dolores fugit eius", contact_no: "644", occupation: "Est quos ratione num", income: "282.00", name_in_cheque: "Plato Woodard", created_at: "2026-04-08 15:15" },
        { id: 2, name: "Quemby Byrd", nic: "175", latitude: 39.0, longitude: 24.0, address: "Quis vitae harum sed", contact_no: "436", occupation: "Quis velit est irure", income: "364.00", name_in_cheque: "Cheyenne French", created_at: "2026-03-19 11:54" },
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
    setEditSupplierId(supplier.id);
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

  return (
    <div className="relative pb-20">
      <PageMeta title="Supplier Management | Asipiya Leasing" description="Quickly create and manage suppliers." />

      <div className="mb-6 mt-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Quickly create and manage suppliers.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
        {/* Table Header area */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 gap-4">
          <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500">
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Existing Suppliers
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            Create Supplier
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
            placeholder="Search NIC or Name..."
            className="w-full sm:w-64 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm outline-none focus:border-brand-500 focus:bg-white dark:border-gray-700 dark:bg-gray-900 dark:focus:bg-gray-800 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full whitespace-nowrap text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-4 w-12">#</th>
                <th className="px-5 py-4">Name</th>
                <th className="px-5 py-4">NIC / Contact</th>
                <th className="px-5 py-4">Coordinates</th>
                <th className="px-5 py-4 min-w-[200px]">Address</th>
                <th className="px-5 py-4">Contact No</th>
                <th className="px-5 py-4">Occupation</th>
                <th className="px-5 py-4">Income</th>
                <th className="px-5 py-4">Name in Cheque</th>
                <th className="px-5 py-4">Created At</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={11} className="px-5 py-8 text-center text-gray-500">
                   <div className="flex flex-col items-center justify-center">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-2"></span>
                    <p className="font-medium text-xs uppercase tracking-widest text-brand-500">Loading Data...</p>
                   </div>
                  </td>
                </tr>
              ) : filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-5 py-12 text-center text-gray-500">
                    <p className="font-semibold text-sm">No suppliers found</p>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier, idx) => (
                  <tr key={supplier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-gray-200">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white capitalize">{supplier.name || '-'}</td>
                    <td className="px-5 py-4 font-medium">{supplier.nic || '-'}</td>
                    <td className="px-5 py-4">
                      {supplier.latitude && supplier.longitude ? (
                        <div className="flex items-center gap-2">
                           <span className="font-medium">{supplier.latitude},<br/>{supplier.longitude}</span>
                           <span className="flex items-center justify-center w-8 h-8 rounded-full border border-brand-200 text-brand-500 bg-brand-50">
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                             </svg>
                           </span>
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-5 py-4 whitespace-normal"><p className="text-xs">{supplier.address || '-'}</p></td>
                    <td className="px-5 py-4">{supplier.contact_no || '-'}</td>
                    <td className="px-5 py-4">{supplier.occupation || '-'}</td>
                    <td className="px-5 py-4 font-medium">{supplier.income ? parseFloat(supplier.income.toString()).toFixed(2) : '-'}</td>
                    <td className="px-5 py-4">{supplier.name_in_cheque || '-'}</td>
                    <td className="px-5 py-4 text-xs font-medium">{supplier.created_at || '-'}</td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(supplier)} className="p-1.5 text-brand-500 hover:bg-brand-50 rounded transition-colors" aria-label="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDelete(supplier.id)} className="p-1.5 text-error-500 hover:bg-error-50 rounded transition-colors" aria-label="Delete">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Dummy */}
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/30 dark:bg-gray-800/30 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-semibold text-gray-500">
            Showing {filteredSuppliers.length > 0 ? 1 : 0} to {filteredSuppliers.length} of {filteredSuppliers.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-400 cursor-not-allowed hidden sm:block">
              Previous
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-brand-500 text-white text-xs font-bold shadow hover:bg-brand-600 transition-colors">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-400 cursor-not-allowed hidden sm:block">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm sm:p-0">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-100 text-brand-600">
                 {editSupplierId ? (
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                 ) : (
                   <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                 )}
                </span>
                {editSupplierId ? "Edit Supplier" : "Create New Supplier"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors dark:hover:bg-gray-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto no-scrollbar">
              <form onSubmit={handleSubmit} className="space-y-5">
                
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

              </form>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)} 
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
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
            </div>
          </div>
        </div>
      )}

      {/* MAP MODAL */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm sm:p-0">
          <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
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
                        (e) => alert("Could not fetch location.")
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
          </div>
        </div>
      )}

    </div>
  );
}
