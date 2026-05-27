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
}

const StepVehicleAsset: React.FC<StepVehicleAssetProps> = ({ formData, updateFormData }) => {
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [vehicleMakes, setVehicleMakes] = useState<any[]>([]);
  const [vehicleModels, setVehicleModels] = useState<any[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);

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
    fetchTypes();
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
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">VALUATION</h3>
            <div className="space-y-4">
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
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">ASSET PHOTOS</h3>
            <div className="grow flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-8 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer group">
               <DownloadIcon className="w-8 h-8 mb-4 text-gray-400 group-hover:text-brand-500 transition-colors" />
               <p className="font-bold text-sm">Upload or Drag Photos</p>
               <p className="text-xs text-gray-400 mt-1">Min 4 photos required for valuation</p>
            </div>
          </div>
      </div>
    </div>
  );
};

export default StepVehicleAsset;
