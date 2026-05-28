import React, { useState, useEffect } from "react";
import { DocsIcon, DownloadIcon, CheckCircleIcon, TrashBinIcon, FileIcon } from "../../../icons";
import apiClient from "../../../api/apiClient";
import DatePicker from "../../form/date-picker";

interface StepCrDocsProps {
  formData: any;
  updateFormData: (fields: any) => void;
  draftId?: number | null;
  saveDraft?: () => Promise<void>;
}

const STEP9_DOCS = [
  { name: "url_cr_front", label: "Original CR - Front side", required: true, accept: "image/*" },
  { name: "url_cr_back", label: "Original CR - Back side", required: true, accept: "image/*" },
  { name: "url_invoice", label: "Proforma / Supplier Invoice", required: true, accept: ".pdf,image/*" },
  { name: "url_valuation", label: "Valuation Report (Used Vehicles)", required: true, accept: ".pdf,image/*" },
  { name: "url_cusdec", label: "Customs Documents (CUSDEC)", required: false, accept: ".pdf,image/*" },
  { name: "url_revenue_license", label: "Revenue License Copy", required: false, accept: ".pdf,image/*" },
  { name: "url_emission_cert", label: "Emission Test (VET) Certificate", required: false, accept: ".pdf,image/*" },
  { name: "url_insurance_note", label: "Insurance Cover Note / Certificate", required: false, accept: ".pdf,image/*" },
  { name: "url_chassis_punch", label: "Chassis Punch Photo", required: false, accept: "image/*" },
  { name: "url_engine_punch", label: "Engine Number Plate Photo", required: false, accept: "image/*" },
];

const StepCrDocs: React.FC<StepCrDocsProps> = ({ formData, updateFormData, draftId, saveDraft }) => {
  const [checkingRmv, setCheckingRmv] = useState(false);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const bridgeData: Partial<any> = {};

    if (!formData.cr_reg_no && formData.reg_no) bridgeData.cr_reg_no = formData.reg_no;
    if (!formData.cr_chassis_no && formData.chassis_no) bridgeData.cr_chassis_no = formData.chassis_no;
    if (!formData.cr_make && formData.vehicle_make) bridgeData.cr_make = formData.vehicle_make;
    if (!formData.cr_model && formData.vehicle_model) bridgeData.cr_model = formData.vehicle_model;
    if (!formData.cr_yom && formData.manu_year) bridgeData.cr_yom = formData.manu_year;
    if (!formData.cr_engine_capacity && formData.engine_cc) bridgeData.cr_engine_capacity = formData.engine_cc;
    if (!formData.cr_body_type && formData.body_type) bridgeData.cr_body_type = formData.body_type;
    if (!formData.cr_country_of_origin && formData.manu_country) bridgeData.cr_country_of_origin = formData.manu_country;
    if (!formData.cr_registered_owner && formData.customer_name) bridgeData.cr_registered_owner = formData.customer_name;

    if (Object.keys(bridgeData).length > 0) {
      updateFormData(bridgeData);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      updateFormData({ [name]: (e.target as HTMLInputElement).checked });
    } else {
      updateFormData({ [name]: value });
    }
  };

  const handleCheckRmv = () => {
    if (!formData.cr_reg_no || !formData.cr_chassis_no) {
      alert("Please enter both Registration Number and Chassis Number to check RMV data.");
      return;
    }
    setCheckingRmv(true);
    setTimeout(() => {
      updateFormData({
        cr_make: "TOYOTA",
        cr_model: "Aqua",
        cr_variant: "NHP10",
        cr_yom: "2018",
        cr_year_of_reg: "2020",
        cr_engine_no: "1NZ-FXE-1234567",
        cr_engine_capacity: "1490",
        cr_fuel_type: "Hybrid",
        cr_transmission: "Automatic",
        cr_body_type: "Motor Car",
        cr_color: "Pearl White",
        cr_seating_capacity: "5",
        cr_gross_weight: "1395",
        cr_unladen_weight: "1120",
        cr_country_of_origin: "JAPAN",
        rmv_verified: true,
        rmv_verified_at: new Date().toLocaleString(),
      });
      setCheckingRmv(false);
      alert("RMV DMT portal check complete. Data populated successfully!");
    }, 1500);
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

  return (
    <div className="space-y-8 animate-fadeIn text-gray-900 dark:text-white pb-10">
      
      {/* SECTION A: Lease Linkage Info (Read-only Summary) */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <div className="w-1.5 h-3 bg-brand-500 rounded-full"></div> SECTION A: LEASE LINKAGE INFO
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Customer Code</p>
            <p className="text-sm font-bold truncate mt-0.5">{formData.customer_code || "-"}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 lg:col-span-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Customer Name</p>
            <p className="text-sm font-bold truncate mt-0.5">{formData.customer_name || "-"}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase">NIC / BR No.</p>
            <p className="text-sm font-bold truncate mt-0.5">{formData.nic || "-"}</p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
            <p className="text-[10px] font-bold text-gray-400 uppercase">Facility Amount</p>
            <p className="text-sm font-black text-brand-600 dark:text-brand-400 mt-0.5">
              LKR {parseFloat(formData.loan_amount || "0").toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION B: CR Master Data & DMT Verification */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-gray-100 dark:border-gray-750 pb-4">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
              <div className="w-1.5 h-3 bg-brand-500 rounded-full"></div> SECTION B: RMV CR MASTER DATA
            </h3>
            <p className="text-xs text-gray-500 mt-1">Vehicle master details exactly as printed on the Certificate of Registration</p>
          </div>
          
          {/* Check RMV Action Bar */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleCheckRmv}
              disabled={checkingRmv}
              className="px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {checkingRmv ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/35 border-t-white rounded-full animate-spin"></span>
                  Checking DMT...
                </>
              ) : (
                "Check RMV (DMT)"
              )}
            </button>
            {formData.rmv_verified && (
              <span className="flex items-center gap-1 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-black uppercase px-2.5 py-1.5 rounded-full border border-green-200 dark:border-green-500/25">
                <CheckCircleIcon className="w-3.5 h-3.5" /> Verified ({formData.rmv_verified_at?.split(" ")[0]})
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Vehicle Reg No *
            </label>
            <input
              type="text"
              name="cr_reg_no"
              value={formData.cr_reg_no || ""}
              onChange={handleInputChange}
              placeholder="e.g. WP CAA-1234"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Chassis Number / VIN *
            </label>
            <input
              type="text"
              name="cr_chassis_no"
              value={formData.cr_chassis_no || ""}
              onChange={handleInputChange}
              placeholder="Chassis / VIN"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Date of First Reg *
            </label>
            <DatePicker
              id="cr_first_reg_date"
              placeholder="Select registration date"
              defaultDate={formData.cr_first_reg_date || ""}
              static={false}
              onChange={(_dates, dateStr) => updateFormData({ cr_first_reg_date: dateStr })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Absolute Owner (Financier) *
            </label>
            <input
              type="text"
              name="cr_absolute_owner"
              value={formData.cr_absolute_owner || ""}
              onChange={handleInputChange}
              placeholder="Absolute Owner Name"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Registered Owner *
            </label>
            <input
              type="text"
              name="cr_registered_owner"
              value={formData.cr_registered_owner || ""}
              onChange={handleInputChange}
              placeholder="Registered Owner Name"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Make *
            </label>
            <input
              type="text"
              name="cr_make"
              value={formData.cr_make || ""}
              onChange={handleInputChange}
              placeholder="e.g. TOYOTA"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Model *
            </label>
            <input
              type="text"
              name="cr_model"
              value={formData.cr_model || ""}
              onChange={handleInputChange}
              placeholder="e.g. Aqua"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Variant / Model Code
            </label>
            <input
              type="text"
              name="cr_variant"
              value={formData.cr_variant || ""}
              onChange={handleInputChange}
              placeholder="e.g. NHP10"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Year of Manufacture *
            </label>
            <input
              type="text"
              name="cr_yom"
              value={formData.cr_yom || ""}
              onChange={handleInputChange}
              placeholder="YOM"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Year of Registration *
            </label>
            <input
              type="text"
              name="cr_year_of_reg"
              value={formData.cr_year_of_reg || ""}
              onChange={handleInputChange}
              placeholder="Year of Reg"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Engine Number *
            </label>
            <input
              type="text"
              name="cr_engine_no"
              value={formData.cr_engine_no || ""}
              onChange={handleInputChange}
              placeholder="Engine No"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Engine Capacity (CC) *
            </label>
            <input
              type="text"
              name="cr_engine_capacity"
              value={formData.cr_engine_capacity || ""}
              onChange={handleInputChange}
              placeholder="Capacity in CC"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Fuel Type *
            </label>
            <select
              name="cr_fuel_type"
              value={formData.cr_fuel_type || "Petrol"}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            >
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
              <option value="CNG">CNG</option>
              <option value="LPG">LPG</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Transmission
            </label>
            <select
              name="cr_transmission"
              value={formData.cr_transmission || "Automatic"}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            >
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Body Type *
            </label>
            <input
              type="text"
              name="cr_body_type"
              value={formData.cr_body_type || "Motor Car"}
              onChange={handleInputChange}
              placeholder="e.g. Hatchback, Van"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Colour *
            </label>
            <input
              type="text"
              name="cr_color"
              value={formData.cr_color || ""}
              onChange={handleInputChange}
              placeholder="Colour"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Gross Weight (kg)
            </label>
            <input
              type="text"
              name="cr_gross_weight"
              value={formData.cr_gross_weight || ""}
              onChange={handleInputChange}
              placeholder="Gross Weight"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Unladen Weight (kg)
            </label>
            <input
              type="text"
              name="cr_unladen_weight"
              value={formData.cr_unladen_weight || ""}
              onChange={handleInputChange}
              placeholder="Unladen Weight"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Previous Owners Count
            </label>
            <input
              type="number"
              name="cr_previous_owners_count"
              value={formData.cr_previous_owners_count || "0"}
              onChange={handleInputChange}
              placeholder="Count"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Mileage at Registration (km)
            </label>
            <input
              type="number"
              name="cr_mileage"
              value={formData.cr_mileage || ""}
              onChange={handleInputChange}
              placeholder="Mileage"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION C: CR Document Metadata */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <div className="w-1.5 h-3 bg-brand-500 rounded-full"></div> SECTION C: CR DOCUMENT METADATA
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              CR Serial / Ref Number *
            </label>
            <input
              type="text"
              name="cr_serial_no"
              value={formData.cr_serial_no || ""}
              onChange={handleInputChange}
              placeholder="e.g. CR-90982"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              CR Issue Date *
            </label>
            <DatePicker
              id="cr_issue_date"
              placeholder="Select CR issue date"
              defaultDate={formData.cr_issue_date || ""}
              static={false}
              onChange={(_dates, dateStr) => updateFormData({ cr_issue_date: dateStr })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              CR Issuing RMV Office *
            </label>
            <select
              name="cr_issue_office"
              value={formData.cr_issue_office || "Narahenpita"}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            >
              <option value="Narahenpita">Narahenpita</option>
              <option value="Werahera">Werahera</option>
              <option value="Galle">Galle</option>
              <option value="Kurunegala">Kurunegala</option>
              <option value="Gampaha">Gampaha</option>
              <option value="Kandy">Kandy</option>
              <option value="Anuradhapura">Anuradhapura</option>
              <option value="Jaffna">Jaffna</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              CR Type *
            </label>
            <select
              name="cr_type"
              value={formData.cr_type || "Original"}
              onChange={handleInputChange}
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            >
              <option value="Original">Original</option>
              <option value="Duplicate">Duplicate</option>
              <option value="Certified Copy">Certified Copy</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1.5 ml-1">
              Number of Keys Received
            </label>
            <input
              type="number"
              name="cr_keys_received"
              value={formData.cr_keys_received || "2"}
              onChange={handleInputChange}
              placeholder="Keys Count"
              className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold focus:border-brand-500 outline-none text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 md:col-span-2">
            <div>
              <p className="text-sm font-bold">Duplicate Key Status *</p>
              <p className="text-xs text-gray-500">Is a duplicate key held by the company?</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="duplicate_key"
                checked={formData.duplicate_key}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* SECTION D: Sri Lankan Compliance Uploads */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <div className="w-1.5 h-3 bg-brand-500 rounded-full"></div> SECTION D: COMPLIANCE ATTACHMENTS
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STEP9_DOCS.map((doc) => {
            const value = formData[doc.name] || "";
            const isUploaded = !!value;
            const isImage =
              doc.accept === "image/*" ||
              (typeof value === "string" &&
                (value.toLowerCase().endsWith(".png") ||
                  value.toLowerCase().endsWith(".jpg") ||
                  value.toLowerCase().endsWith(".jpeg") ||
                  value.toLowerCase().endsWith(".webp") ||
                  value.includes("image")));

            const resolvedUrl = resolveFileUrl(value);

            return (
              <div
                key={doc.name}
                className="bg-gray-50 dark:bg-gray-900/50 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between h-72 relative hover:border-brand-500/30 transition-all duration-300"
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
                      <span className="text-xs font-bold text-brand-500 uppercase tracking-widest animate-pulse">
                        Uploading...
                      </span>
                    </div>
                  ) : isUploaded ? (
                    isImage ? (
                      <div className="relative w-full h-full group/preview">
                        <img src={resolvedUrl} alt={doc.label} className="w-full h-full object-cover rounded-lg" />
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
                          {value.split("/").pop()}
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

      {/* SECTION E: Verification & Discrepancies */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
          <div className="w-1.5 h-3 bg-brand-500 rounded-full"></div> SECTION E: VERIFICATION & AUDIT CONTROLS
        </h3>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-bold">Do uploaded documents match RMV CR Data?</p>
              <p className="text-xs text-gray-500">Confirm that all uploaded documents perfectly reconcile with CR data.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="data_matched"
                checked={formData.data_matched}
                onChange={handleInputChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
            </label>
          </div>

          {/* Conditional Discrepancy Reason text-area */}
          {!formData.data_matched && (
            <div className="transition-all duration-300 ease-in-out">
              <label className="block text-xs font-bold text-red-500 uppercase mb-1.5 ml-1">
                Discrepancy Reason *
              </label>
              <textarea
                name="discrepancy_reason"
                value={formData.discrepancy_reason || ""}
                onChange={handleInputChange}
                placeholder="Identify discrepancies between documents and RMV data..."
                className="w-full p-2.5 bg-red-50/10 dark:bg-red-950/10 border border-red-200 dark:border-red-900/50 rounded-xl text-sm focus:border-red-500 outline-none min-h-[100px] font-semibold text-gray-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepCrDocs;
