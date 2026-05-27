import React, { useState, useEffect } from "react";
import { 
  MANU_COUNTRIES, 
  USAGE_TYPES, 
  BODY_TYPES 
} from "../../../constants/leasingConstants";
import { BoxIcon, DownloadIcon } from "../../../icons";
import apiClient from "../../../api/apiClient";

const getMakeForModel = (modelName: string): string => {
  const name = modelName.toLowerCase();
  
  // Cars
  if (["alto", "wagon r", "spacia", "swift", "celerio", "every"].includes(name)) return "suzuki";
  if (["vitz", "aqua", "axio", "premio", "allion", "corolla", "prius", "yaris", "hiace", "townace", "liteace", "noah", "voxy", "land cruiser", "prado", "rav4", "rush", "c-hr", "hilux", "coaster"].includes(name)) return "toyota";
  if (["fit", "grace", "civic", "shuttle", "insight", "vezel", "cr-v", "dio", "hornet"].includes(name)) return "honda";
  if (["sunny", "leaf", "dayz", "caravan", "vanette", "x-trail", "navara"].includes(name)) return "nissan";
  if (["panda", "elite"].includes(name)) return "micro";
  if (["tucson"].includes(name)) return "hyundai";
  if (["sportage"].includes(name)) return "kia";
  
  // SUVs/Cabs/Buses/Lorries
  if (["l200", "triton", "montero", "outlander", "canter", "fuso"].includes(name)) return "mitsubishi";
  if (["defender"].includes(name)) return "land rover";
  if (["d-max", "elf", "forward"].includes(name)) return "isuzu";
  
  // Three-Wheelers / Motorbikes
  if (["re", "maxima", "pulsar", "discover", "platina", "ct100"].includes(name)) return "bajaj";
  if (["king", "apache", "metro", "wego"].includes(name)) return "tvs";
  if (["ape"].includes(name)) return "piaggio";
  if (["fz", "rayzr"].includes(name)) return "yamaha";
  
  // Lorries / Buses
  if (["ace (dimo batta)", "super ace", "lpt", "lp"].includes(name)) return "tata";
  if (["bolero", "maxximo"].includes(name)) return "mahindra";
  if (["viking"].includes(name)) return "ashok leyland";
  
  // Tractors
  if (["massey ferguson 240"].includes(name)) return "massey ferguson";
  if (["kubota l4508"].includes(name)) return "kubota";
  if (["tafe 45 di"].includes(name)) return "tafe";
  
  return "";
};

interface StepVehicleAssetProps {
  formData: any;
  updateFormData: (fields: any) => void;
  draftId?: number | null;
  saveDraft?: () => Promise<void>;
}

const VEHICLE_DOCS = [
  { name: "front_side_photo", label: "Front Side Photo", required: true, accept: "image/*" },
  { name: "back_side_photo", label: "Back Side Photo", required: true, accept: "image/*" },
  { name: "left_side_photo", label: "Left Side Photo", required: true, accept: "image/*" },
  { name: "right_side_photo", label: "Right Side Photo", required: true, accept: "image/*" },
  { name: "upper_photo", label: "Upper Photo", required: false, accept: "image/*" },
  { name: "inside_photo", label: "Inside Photo", required: false, accept: "image/*" },
  { name: "chasis_no_file", label: "Chassis No (File)", required: true, accept: "*/*" },
  { name: "meter_reading_file", label: "Meter Reading (File)", required: true, accept: "*/*" },
  { name: "valuation_report", label: "Valuation Report", required: true, accept: ".pdf,image/*" },
  { name: "cr_copy", label: "CR Copy", required: false, accept: ".pdf,image/*" },
  { name: "deletion_copy", label: "Deletion Copy", required: false, accept: ".pdf,image/*" },
  { name: "revenue_license", label: "Revenue License", required: false, accept: ".pdf,image/*" },
  { name: "supplier_invoice", label: "Supplier Invoice", required: false, accept: ".pdf,image/*" }
];

import { TrashBinIcon, FileIcon } from "../../../icons";

const StepVehicleAsset: React.FC<StepVehicleAssetProps> = ({ formData, updateFormData, draftId, saveDraft }) => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleMakes, setVehicleMakes] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const fetchTypes = async () => {
      setLoadingTypes(true);
      try {
        const res = await apiClient.get("/lookup/vehicle-types");
        const data = res.data?.data || res.data || [];
        setVehicleTypes(data);
      } catch (err) {
        console.error("Failed to fetch vehicle types:", err);
      } finally {
        setLoadingTypes(false);
      }
    };
    
    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const res = await apiClient.get("/suppliers");
        const data = res.data?.data || res.data || [];
        setSuppliers(data);
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchTypes();
    fetchSuppliers();
  }, []);

  // Sync type string to type_id if resuming from a draft with a string type
  useEffect(() => {
    if (vehicleTypes.length > 0 && formData.vehicle_type && !formData.vehicle_type_id) {
      const matched = vehicleTypes.find(t => 
        t.vehicle_type_name.toLowerCase() === formData.vehicle_type.toLowerCase() ||
        (t.vehicle_type_name.toLowerCase() === "car" && formData.vehicle_type.toLowerCase() === "cars")
      );
      if (matched) {
        updateFormData({
          vehicle_type_id: String(matched.id || matched.ID),
          vehicle_type: matched.vehicle_type_name
        });
      }
    }
  }, [vehicleTypes, formData.vehicle_type, formData.vehicle_type_id]);

  useEffect(() => {
    if (!formData.vehicle_type_id) {
      setVehicleMakes([]);
      setVehicleModels([]);
      return;
    }

    const fetchMakesAndModels = async () => {
      setLoadingMakes(true);
      setLoadingModels(true);
      try {
        const [makesRes, modelsRes] = await Promise.all([
          apiClient.get(`/lookup/vehicle-makes?type_id=${formData.vehicle_type_id}`),
          apiClient.get(`/lookup/vehicle-models?type_id=${formData.vehicle_type_id}`)
        ]);
        setVehicleMakes(makesRes.data?.data || makesRes.data || []);
        setVehicleModels(modelsRes.data?.data || modelsRes.data || []);
      } catch (err) {
        console.error("Failed to fetch makes and models:", err);
      } finally {
        setLoadingMakes(false);
        setLoadingModels(false);
      }
    };

    fetchMakesAndModels();
  }, [formData.vehicle_type_id]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedType = vehicleTypes.find(t => String(t.id || t.ID) === selectedId);
    
    updateFormData({
      vehicle_type_id: selectedId,
      vehicle_type: selectedType ? selectedType.vehicle_type_name : "",
      vehicle_make_id: "",
      vehicle_make: "",
      vehicle_model_id: "",
      vehicle_model: ""
    });
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedMake = vehicleMakes.find(m => String(m.id || m.ID) === selectedId);
    
    updateFormData({
      vehicle_make_id: selectedId,
      vehicle_make: selectedMake ? selectedMake.vehicle_make : "",
      vehicle_model_id: "",
      vehicle_model: ""
    });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedModel = vehicleModels.find(m => String(m.id || m.ID) === selectedId);
    
    updateFormData({
      vehicle_model_id: selectedId,
      vehicle_model: selectedModel ? selectedModel.vehicle_model_name : ""
    });
  };

  const handleFileUpload = async (name: string, file: File) => {
    let activeDraftId = draftId;
    
    // Auto-save/create draft first if no draft ID is present yet
    if (!activeDraftId) {
      if (!formData.customer_db_id) {
        alert("Please complete Step 1: Customer details first to initialize this lease application draft.");
        return;
      }
      setUploading(prev => ({ ...prev, [name]: true }));
      try {
        if (saveDraft) {
          await saveDraft();
          const savedId = localStorage.getItem("leasing_draft_id");
          if (savedId) {
            activeDraftId = parseInt(savedId);
          } else {
            throw new Error("Draft ID was not saved successfully.");
          }
        }
      } catch (err) {
        console.error("Auto draft initialization failed for upload:", err);
        alert("Failed to initialize lease application draft. Please check Customer details.");
        setUploading(prev => ({ ...prev, [name]: false }));
        return;
      }
    }

    setUploading(prev => ({ ...prev, [name]: true }));
    const uploadData = new FormData();
    uploadData.append("image_type", name);
    uploadData.append("file", file);

    try {
      const res = await apiClient.post(`/leasing-applications/${activeDraftId}/upload-document`, uploadData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      const uploadedUrl = res.data?.url;
      if (uploadedUrl) {
        updateFormData({ [name]: uploadedUrl });
      }
    } catch (err: any) {
      console.error(`Failed to upload ${name}:`, err);
      alert(`Failed to upload file: ${err.response?.data?.error || err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [name]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, name: string) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(name, file);
    }
  };

  const handleDeleteFile = (name: string) => {
    updateFormData({ [name]: "" });
  };

  const resolveFileUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    if (url.startsWith("/storage/")) {
      const cleanBase = (import.meta.env.VITE_APP_API_URL || "http://localhost:8084").replace(/\/$/, "");
      return `${cleanBase}${url}`;
    }
    const cleanBase = (import.meta.env.VITE_APP_API_URL || "http://localhost:8084").replace(/\/$/, "");
    return `${cleanBase}/uploads/${url}`;
  };

  const filteredModels = vehicleModels.filter(m => {
    if (!formData.vehicle_make) return false;
    const inferredMake = getMakeForModel(m.vehicle_model_name);
    return inferredMake === formData.vehicle_make.toLowerCase();
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Basic Specifications */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><BoxIcon className="w-4 h-4" /></div> BASIC SPECIFICATIONS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Asset Type</label>
            <select 
              name="vehicle_type_id" 
              value={formData.vehicle_type_id || ""} 
              onChange={handleTypeChange} 
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
              disabled={loadingTypes}
            >
              <option value="">Select Asset Type</option>
              {vehicleTypes.map(t => (
                <option key={t.id || t.ID} value={String(t.id || t.ID)}>
                  {t.vehicle_type_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Make</label>
            <select 
              name="vehicle_make_id" 
              value={formData.vehicle_make_id || ""} 
              onChange={handleMakeChange} 
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
              disabled={loadingMakes || !formData.vehicle_type_id}
            >
              <option value="">
                {!formData.vehicle_type_id 
                  ? "Select Asset Type First" 
                  : loadingMakes 
                    ? "Loading Makes..." 
                    : "Select Make"}
              </option>
              {vehicleMakes.map(m => (
                <option key={m.id || m.ID} value={String(m.id || m.ID)}>
                  {m.vehicle_make}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Model</label>
            <select 
              name="vehicle_model_id" 
              value={formData.vehicle_model_id || ""} 
              onChange={handleModelChange} 
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none"
              disabled={loadingModels || !formData.vehicle_make_id}
            >
              <option value="">
                {!formData.vehicle_make_id 
                  ? "Select Make First" 
                  : loadingModels 
                    ? "Loading Models..." 
                    : "Select Model"}
              </option>
              {filteredModels.map(m => (
                <option key={m.id || m.ID} value={String(m.id || m.ID)}>
                  {m.vehicle_model_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Asset Status</label>
            <select name="vehicle_status" value={formData.vehicle_status} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none font-bold text-brand-500">
              <option value="REGISTERED">REGISTERED</option>
              <option value="UNREGISTERED">UNREGISTERED</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Technical Details */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><BoxIcon className="w-4 h-4" /></div> TECHNICAL DETAILS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Engine CC</label>
            <input type="text" name="engine_cc" value={formData.engine_cc} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none" />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Chassis No</label>
            <input type="text" name="chassis_no" value={formData.chassis_no} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Manu. Year</label>
            <input type="text" name="manu_year" value={formData.manu_year} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Usage</label>
            <select name="usage_type" value={formData.usage_type} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none">
              {USAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Manu. Country</label>
            <select name="manu_country" value={formData.manu_country} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none">
              {MANU_COUNTRIES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Body Type</label>
            <select name="body_type" value={formData.body_type} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none">
              {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Reg. No</label>
              <input type="text" name="reg_no" value={formData.reg_no} onChange={handleChange} placeholder="e.g. WP CAA-1234" className="w-full p-2.5 bg-brand-50/50 dark:bg-brand-500/5 border border-brand-200 dark:border-brand-500/20 rounded-xl text-sm font-bold text-brand-600 dark:text-brand-400 focus:border-brand-500 outline-none" />
          </div>
        </div>
      </div>

      {/* 3. Valuation & Supplier info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">VALUATION</h3>
            <div className="space-y-4 grow flex flex-col justify-center">
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Market Value</label>
                    <input type="text" name="market_value" value={formData.market_value} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Forced Value</label>
                    <input type="text" name="forced_value" value={formData.forced_value} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:border-brand-500" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Invoice Value</label>
                  <input type="text" name="invoice_value" value={formData.invoice_value} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:border-brand-500" />
               </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">SUPPLIER DETAILS</h3>
            <div className="space-y-4 grow flex flex-col justify-center">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Supplier <span className="text-red-500">*</span></label>
                <select 
                  name="supplier_id" 
                  value={formData.supplier_id || ""} 
                  onChange={handleChange} 
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none font-bold"
                  disabled={loadingSuppliers}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map(s => (
                    <option key={s.id || s.ID} value={String(s.id || s.ID)}>
                      {s.name} {s.contact_no ? `(${s.contact_no})` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Supplier RNO <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  name="supplier_rno" 
                  value={formData.supplier_rno || ""} 
                  onChange={handleChange} 
                  placeholder="Supplier Registration/Reference No" 
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-bold outline-none focus:border-brand-500" 
                />
              </div>
            </div>
          </div>
      </div>

      {/* 4. Vehicle Documents Upload Grid */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"><DownloadIcon className="w-4 h-4" /></div> VEHICLE ATTACHMENTS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {VEHICLE_DOCS.map(doc => {
            const value = formData[doc.name] || "";
            const isUploaded = !!value;
            const isImage = doc.accept === "image/*" || (typeof value === "string" && (
              value.toLowerCase().endsWith(".png") || 
              value.toLowerCase().endsWith(".jpg") || 
              value.toLowerCase().endsWith(".jpeg") || 
              value.toLowerCase().endsWith(".webp") ||
              value.includes("image")
            ));

            const resolvedUrl = resolveFileUrl(value);

            return (
              <div 
                key={doc.name} 
                className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-250 dark:border-gray-800 shadow-sm flex flex-col justify-between h-72 relative hover:border-brand-500/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-3">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {doc.label} {doc.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                </div>

                <div className="grow flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 p-4 relative overflow-hidden h-44">
                  {uploading[doc.name] ? (
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="w-8 h-8 border-3 border-brand-500/35 border-t-brand-500 rounded-full animate-spin"></span>
                      <span className="text-xs font-bold text-brand-500 uppercase tracking-widest animate-pulse">Uploading...</span>
                    </div>
                  ) : isUploaded ? (
                    isImage ? (
                      <div className="relative w-full h-full group/preview">
                        <img 
                          src={resolvedUrl} 
                          alt={doc.label} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-3 rounded-lg">
                          <a 
                            href={resolvedUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                            title="View Original"
                          >
                            <DownloadIcon className="w-5 h-5" />
                          </a>
                          <button 
                            type="button"
                            onClick={() => handleDeleteFile(doc.name)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-white rounded-lg transition-colors"
                            title="Delete file"
                          >
                            <TrashBinIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-2 text-center w-full">
                        <div className="p-3 bg-brand-50 dark:bg-brand-500/10 rounded-full text-brand-500 mb-2">
                          <FileIcon className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-[200px] mb-2 px-2">
                          {value.split('/').pop()}
                        </p>
                        <div className="flex gap-2">
                          <a 
                            href={resolvedUrl} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-[10px] font-bold uppercase tracking-wider text-brand-500 hover:underline"
                          >
                            Open
                          </a>
                          <span className="text-gray-300 dark:text-gray-700">|</span>
                          <button 
                            type="button"
                            onClick={() => handleDeleteFile(doc.name)}
                            className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/10 rounded-xl transition-colors">
                      <input 
                        type="file" 
                        className="hidden" 
                        accept={doc.accept} 
                        onChange={(e) => handleFileChange(e, doc.name)}
                      />
                      <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400 mb-2">
                        <DownloadIcon className="w-6 h-6 rotate-180" />
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Choose File</span>
                      <span className="text-[10px] text-gray-400 mt-1">Upload File or Image</span>
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StepVehicleAsset;
