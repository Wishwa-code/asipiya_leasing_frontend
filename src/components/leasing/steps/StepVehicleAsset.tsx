import React from "react";
import { 
  VEHICLE_TYPES, 
  MANU_COUNTRIES, 
  FUEL_TYPES, 
  USAGE_TYPES, 
  BODY_TYPES 
} from "../../../constants/leasingConstants";
import { BoxIcon, DownloadIcon } from "../../../icons"; // I'll assume camera/upload icons exist or use BoxIcon

interface StepVehicleAssetProps {
  formData: any;
  updateFormData: (fields: any) => void;
}

const StepVehicleAsset: React.FC<StepVehicleAssetProps> = ({ formData, updateFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    updateFormData({ [e.target.name]: e.target.value });
  };

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
            <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none">
              {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Make</label>
            <input type="text" name="vehicle_make" value={formData.vehicle_make} onChange={handleChange} placeholder="e.g. Toyota" className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5 ml-1">Model</label>
            <input type="text" name="vehicle_model" value={formData.vehicle_model} onChange={handleChange} placeholder="e.g. Vitz" className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:border-brand-500 outline-none" />
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
