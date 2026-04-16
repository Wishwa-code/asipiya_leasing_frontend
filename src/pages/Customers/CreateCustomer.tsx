import { useState, useEffect, useRef } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";

// ─── Types ───────────────────────────────────────────────────────────────────
type OccupationEntry = {
  id: string;
  engagementType: string;
  position: string;
  netMonthlyIncome: string;
  startDate: string;
  endDate: string;
  businessName?: string;
  registrationNumber?: string;
  natureOfBusiness?: string;
};

type DocumentEntry = {
  id: string;
  category: string;
  fileName: string;
};

type BankEntry = {
  id: string;
  bank: string;
  accountNumber: string;
  beneficiary: string;
  type: string;
  branch: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const PROVINCES = ["Western", "Central", "Southern", "Northern", "Eastern", "North Western", "North Central", "Uva", "Sabaragamuwa"];
const TITLES = ["Mr.", "Mrs.", "Miss.", "Ms.", "Rev.", "Dr.", "Prof."];
const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["Active", "Inactive", "Blacklisted"];

// ─── Component ───────────────────────────────────────────────────────────────
export default function CreateCustomer() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requiredFieldsOnly, setRequiredFieldsOnly] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [generatedId] = useState(`CUS-${Date.now().toString().slice(-6)}`);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ── Profile & Identity ──
  const [profile, setProfile] = useState({
    title: "", fullName: "", firstName: "", lastName: "",
    nameWithInitials: "", nic: "", dob: "", gender: "", status: "",
    photo: null as File | null,
  });
  const nicRef = useRef<HTMLInputElement>(null);

  function decodeNIC(nic: string) {
    if (!nic) return;
    let dob = "";
    let gender = "";
    if (nic.length === 10) {
      let days = Number(nic.substring(2, 5));
      const year = `19${nic.substring(0, 2)}`;
      if (days > 500) { gender = "Female"; days -= 500; } else { gender = "Male"; }
      const d = new Date(Number(year), 0, days);
      dob = d.toISOString().split("T")[0];
    } else if (nic.length === 12) {
      let days = Number(nic.substring(4, 7));
      const year = nic.substring(0, 4);
      if (days > 500) { gender = "Female"; days -= 500; } else { gender = "Male"; }
      const d = new Date(Number(year), 0, days);
      dob = d.toISOString().split("T")[0];
    }
    setProfile(p => ({ ...p, dob, gender }));
  }

  // ── Address ──
  const [address, setAddress] = useState({
    permLine1: "", permLine2: "", permLine3: "",
    postalLine1: "", postalLine2: "", postalLine3: "",
    sameAsPerm: false,
    province: "", city: "",
  });

  function handleSameAsPerm(checked: boolean) {
    setAddress(a => ({
      ...a, sameAsPerm: checked,
      postalLine1: checked ? a.permLine1 : "",
      postalLine2: checked ? a.permLine2 : "",
      postalLine3: checked ? a.permLine3 : "",
    }));
  }

  // ── Contact ──
  const [contact, setContact] = useState({
    mobilePrimary: "", mobileSecondary: "", landline: "", email: "",
  });

  // ── Remarks ──
  const [remarks, setRemarks] = useState("");

  // ── Occupations ──
  const [occupations, setOccupations] = useState<OccupationEntry[]>([]);
  const [occForm, setOccForm] = useState({ 
    engagementType: "Job / Employment", position: "", netMonthlyIncome: "", 
    startDate: "", endDate: "", businessName: "", registrationNumber: "", natureOfBusiness: ""
  });

  function addOccupation() {
    if (occForm.engagementType === "Job / Employment" && !occForm.position) return;
    if (occForm.engagementType === "Business Owner" && !occForm.businessName) return;
    
    setOccupations(o => [...o, { id: uid(), ...occForm }]);
    setOccForm({ 
      engagementType: occForm.engagementType, position: "", netMonthlyIncome: "", 
      startDate: "", endDate: "", businessName: "", registrationNumber: "", natureOfBusiness: ""
    });
  }
  function removeOccupation(id: string) { setOccupations(o => o.filter(x => x.id !== id)); }

  // ── Documents ──
  const [docEntries, setDocEntries] = useState<DocumentEntry[]>([]);
  const [docCategory, setDocCategory] = useState("");
  const [docFile, setDocFile] = useState<File | null>(null);

  function addDocument() {
    if (!docCategory || !docFile) return;
    setDocEntries(d => [...d, { id: uid(), category: docCategory, fileName: docFile.name }]);
    setDocCategory("");
    setDocFile(null);
  }
  function removeDocument(id: string) { setDocEntries(d => d.filter(x => x.id !== id)); }

  // ── Banks ──
  const [banks, setBanks] = useState<BankEntry[]>([]);
  const [bankForm, setBankForm] = useState({ bank: "", accountNumber: "", beneficiary: "", type: "", branch: "" });

  function addBank() {
    if (!bankForm.bank || !bankForm.accountNumber) return;
    setBanks(b => [...b, { id: uid(), ...bankForm }]);
    setBankForm({ bank: "", accountNumber: "", beneficiary: "", type: "", branch: "" });
  }
  function removeBank(id: string) { setBanks(b => b.filter(x => x.id !== id)); }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);
    setIsSubmitting(true);
    try {
      const payload = {
        customer_id: generatedId,
        title: profile.title,
        full_name: profile.fullName,
        first_name: profile.firstName,
        last_name: profile.lastName,
        name_with_initials: profile.nameWithInitials,
        nic: profile.nic,
        dob: profile.dob,
        gender: profile.gender,
        status: profile.status,
        permanent_address_line1: address.permLine1,
        permanent_address_line2: address.permLine2,
        permanent_address_line3: address.permLine3,
        postal_address_line1: address.sameAsPerm ? address.permLine1 : address.postalLine1,
        postal_address_line2: address.sameAsPerm ? address.permLine2 : address.postalLine2,
        postal_address_line3: address.sameAsPerm ? address.permLine3 : address.postalLine3,
        province: address.province,
        city: address.city,
        mobile_primary: contact.mobilePrimary,
        mobile_secondary: contact.mobileSecondary,
        landline: contact.landline,
        email: contact.email,
        remarks,
        occupations,
        bank_accounts: banks,
      };
      await apiClient.post("/api/customers", payload);
      setSubmitSuccess("Customer registered successfully!");
    } catch {
      setSubmitError("Failed to register customer. Please check the details and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClear() {
    setProfile({ title: "", fullName: "", firstName: "", lastName: "", nameWithInitials: "", nic: "", dob: "", gender: "", status: "", photo: null });
    setAddress({ permLine1: "", permLine2: "", permLine3: "", postalLine1: "", postalLine2: "", postalLine3: "", sameAsPerm: false, province: "", city: "" });
    setContact({ mobilePrimary: "", mobileSecondary: "", landline: "", email: "" });
    setRemarks("");
    setOccupations([]);
    setBanks([]);
    setDocEntries([]);
    setSubmitError(null);
    setSubmitSuccess(null);
  }

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const inputCls = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 transition";
  const selectCls = `${inputCls} appearance-none`;
  const cardCls = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900";
  const labelCls = "block mb-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide";
  const sectionTitle = "flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wide mb-4";

  return (
    <>
      <PageMeta title="Add Customer | Asipiya Leasing" description="Register a new customer" />

      {/* ── Sticky Action Header ─────────────────────────────────────── */}
      <div className={`sticky top-0 z-30 transition-all duration-200 ${isScrolled ? "shadow-md" : ""}`}>
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <h1 className="text-base font-bold text-gray-800 dark:text-white">Customer Registration</h1>
            <p className="text-xs text-gray-400">* Required fields. Remaining information may delay registration.</p>
          </div>

          {submitSuccess && (
            <div className="text-xs text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg">{submitSuccess}</div>
          )}
          {submitError && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">{submitError}</div>
          )}

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Required Fields Only</span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={requiredFieldsOnly} onChange={e => setRequiredFieldsOnly(e.target.checked)} />
                <div className={`block w-10 h-6 rounded-full transition ${requiredFieldsOnly ? 'bg-brand-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
                <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${requiredFieldsOnly ? 'translate-x-4' : ''}`}></div>
              </div>
            </label>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <span>✕</span> Clear
            </button>
            <button
              type="submit"
              form="customer-form"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-5 py-2 text-xs font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition shadow-sm"
            >
              {isSubmitting ? "Registering…" : "✓ Register Customer"}
            </button>
          </div>
        </div>
      </div>

      <form id="customer-form" onSubmit={handleSubmit} ref={formRef} className="mt-4 space-y-4">
        {/* ── Main 2-Col Grid ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT: Profile & Address (2/3) */}
          <div className="lg:col-span-2 space-y-4">

            {/* Profile & Identity */}
            <div className={cardCls}>
              <p className="text-[10px] text-right text-red-400 mb-2">* REQUIRED</p>
              <div className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">👤</span>
                PROFILE &amp; IDENTITY
              </div>

              <div className="flex gap-5 items-start">
                {/* Avatar placeholder */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-20 rounded-full bg-brand-500 flex items-center justify-center text-white text-2xl font-bold select-none">
                    {profile.firstName ? profile.firstName[0].toUpperCase() : (profile.fullName ? profile.fullName[0].toUpperCase() : "NC")}
                  </div>
                  <label className="cursor-pointer text-[11px] text-brand-600 font-semibold hover:underline">
                    ⬆ Upload Photo
                    <input type="file" accept="image/*" className="hidden" onChange={e => setProfile(p => ({ ...p, photo: e.target.files?.[0] ?? null }))} />
                  </label>
                </div>

                {/* Name fields */}
                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelCls}>Title *</label>
                      <select className={selectCls} value={profile.title} onChange={e => setProfile(p => ({ ...p, title: e.target.value }))}>
                        <option value="">Select</option>
                        {TITLES.map(t => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>Full Name *</label>
                      <input className={inputCls} placeholder="Full Name" value={profile.fullName}
                        onChange={e => setProfile(p => ({ ...p, fullName: e.target.value.toUpperCase() }))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>First Name *</label>
                      <input className={inputCls} placeholder="First Name" value={profile.firstName}
                        onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Last Name *</label>
                      <input className={inputCls} placeholder="Last Name" value={profile.lastName}
                        onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <label className={labelCls}>Name with Initials *</label>
                  <input className={inputCls} placeholder="Name with initials" value={profile.nameWithInitials}
                    onChange={e => setProfile(p => ({ ...p, nameWithInitials: e.target.value.toUpperCase() }))} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className={labelCls}>NIC Number *</label>
                    <input ref={nicRef} className={inputCls} placeholder="NIC Number" value={profile.nic}
                      onChange={e => {
                        const val = e.target.value.toUpperCase();
                        setProfile(p => ({ ...p, nic: val }));
                        decodeNIC(val);
                      }} />
                  </div>
                  <div>
                    <label className={labelCls}>Date of Birth *</label>
                    <input type="date" className={inputCls} value={profile.dob}
                      onChange={e => setProfile(p => ({ ...p, dob: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Gender *</label>
                    <select className={selectCls} value={profile.gender} onChange={e => setProfile(p => ({ ...p, gender: e.target.value }))}>
                      <option value="">Select</option>
                      {GENDERS.map(g => <option key={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Status *</label>
                    <select className={selectCls} value={profile.status} onChange={e => setProfile(p => ({ ...p, status: e.target.value }))}>
                      <option value="">Select</option>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Address & Location */}
            <div className={cardCls}>
              <div className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">📍</span>
                ADDRESS &amp; LOCATION
              </div>

              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Permanent Address *</label>
                  <div className="grid grid-cols-3 gap-3">
                    <input className={inputCls} placeholder="Line 1" value={address.permLine1} onChange={e => setAddress(a => ({ ...a, permLine1: e.target.value }))} />
                    <input className={inputCls} placeholder="Line 2" value={address.permLine2} onChange={e => setAddress(a => ({ ...a, permLine2: e.target.value }))} />
                    <input className={inputCls} placeholder="Line 3" value={address.permLine3} onChange={e => setAddress(a => ({ ...a, permLine3: e.target.value }))} />
                  </div>
                </div>

                {!requiredFieldsOnly && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls}>Postal Address</label>
                      <label className="flex items-center gap-1.5 text-[11px] text-brand-600 font-semibold cursor-pointer">
                        <input type="checkbox" checked={address.sameAsPerm} onChange={e => handleSameAsPerm(e.target.checked)}
                          className="accent-brand-500 rounded" />
                        Same as Permanent
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <input className={inputCls} placeholder="Line 1" value={address.postalLine1} disabled={address.sameAsPerm}
                        onChange={e => setAddress(a => ({ ...a, postalLine1: e.target.value }))} />
                      <input className={inputCls} placeholder="Line 2" value={address.postalLine2} disabled={address.sameAsPerm}
                        onChange={e => setAddress(a => ({ ...a, postalLine2: e.target.value }))} />
                      <input className={inputCls} placeholder="Line 3" value={address.postalLine3} disabled={address.sameAsPerm}
                        onChange={e => setAddress(a => ({ ...a, postalLine3: e.target.value }))} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Province *</label>
                    <select className={selectCls} value={address.province} onChange={e => setAddress(a => ({ ...a, province: e.target.value }))}>
                      <option value="">Select Province</option>
                      {PROVINCES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>City *</label>
                    <input className={inputCls} placeholder="Select City / Town" value={address.city}
                      onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: System Context + Contact + Remarks (1/3) */}
          <div className="space-y-4">

            {/* System Context */}
            {!requiredFieldsOnly && (
              <div className={cardCls}>
                <div className={sectionTitle}>
                  <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">⚙</span>
                  SYSTEM CONTEXT
                </div>
                <div>
                  <label className={labelCls}>Customer ID</label>
                  <div className="text-sm font-mono text-brand-600 font-semibold bg-brand-50 rounded-lg px-3 py-2 dark:bg-brand-900/20">
                    {generatedId}
                  </div>
                </div>
              </div>
            )}

            {/* Contact Info */}
            <div className={cardCls}>
              <div className={sectionTitle}>
                <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">📞</span>
                CONTACT INFO
              </div>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Mobile Primary *</label>
                  <input className={inputCls} placeholder="07XXXXXXXX" value={contact.mobilePrimary}
                    onChange={e => setContact(c => ({ ...c, mobilePrimary: e.target.value }))} />
                </div>
                {!requiredFieldsOnly && (
                  <>
                    <div>
                      <label className={labelCls}>Mobile Secondary</label>
                      <input className={inputCls} placeholder="07XXXXXXXX" value={contact.mobileSecondary}
                        onChange={e => setContact(c => ({ ...c, mobileSecondary: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Landline</label>
                      <input className={inputCls} placeholder="0XXXXXXXXX" value={contact.landline}
                        onChange={e => setContact(c => ({ ...c, landline: e.target.value }))} />
                    </div>
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input type="email" className={inputCls} placeholder="example@email.com" value={contact.email}
                        onChange={e => setContact(c => ({ ...c, email: e.target.value }))} />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Remarks */}
            {!requiredFieldsOnly && (
              <div className={cardCls}>
                <div className={sectionTitle}>
                  <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">✏</span>
                  REMARKS
                </div>
                <textarea className={`${inputCls} resize-none`} rows={4} placeholder="Enter any specific notes about this customer..."
                  value={remarks} onChange={e => setRemarks(e.target.value)} />
              </div>
            )}
          </div>
        </div>

        {/* ── Professional Profile ──────────────────────────────────── */}
        <div className={cardCls}>
          <div className={sectionTitle}>
            <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">💼</span>
            PROFESSIONAL PROFILE
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 space-y-3 border border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Add New Engagement</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Engagement Type</label>
                <select className={selectCls} value={occForm.engagementType} onChange={e => setOccForm(f => ({ ...f, engagementType: e.target.value }))}>
                  <option>Job / Employment</option>
                  <option>Business Owner</option>
                </select>
              </div>
              
              {occForm.engagementType === "Job / Employment" ? (
                <>
                  <div>
                    <label className={labelCls}>Position / Designation</label>
                    <input className={inputCls} placeholder="e.g. Senior Project Manager" value={occForm.position}
                      onChange={e => setOccForm(f => ({ ...f, position: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Net Monthly Income</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">Rs.</span>
                      <input type="number" className={`${inputCls} pl-9`} placeholder="0.00" value={occForm.netMonthlyIncome}
                        onChange={e => setOccForm(f => ({ ...f, netMonthlyIncome: e.target.value }))} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelCls}>Business Name</label>
                    <input className={inputCls} placeholder="Business Name" value={occForm.businessName}
                      onChange={e => setOccForm(f => ({ ...f, businessName: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Registration Number</label>
                    <input className={inputCls} placeholder="BR Number" value={occForm.registrationNumber}
                      onChange={e => setOccForm(f => ({ ...f, registrationNumber: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-3 lg:col-span-1">
                    <label className={labelCls}>Nature of Business</label>
                    <input className={inputCls} placeholder="e.g. Retail, Service" value={occForm.natureOfBusiness}
                      onChange={e => setOccForm(f => ({ ...f, natureOfBusiness: e.target.value }))} />
                  </div>
                  <div>
                    <label className={labelCls}>Net Monthly Income</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold">Rs.</span>
                      <input type="number" className={`${inputCls} pl-9`} placeholder="0.00" value={occForm.netMonthlyIncome}
                        onChange={e => setOccForm(f => ({ ...f, netMonthlyIncome: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className={labelCls}>Start Date</label>
                <input type="date" className={inputCls} value={occForm.startDate}
                  onChange={e => setOccForm(f => ({ ...f, startDate: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>End Date (if applicable)</label>
                <input type="date" className={inputCls} placeholder="Present" value={occForm.endDate}
                  onChange={e => setOccForm(f => ({ ...f, endDate: e.target.value }))} />
              </div>
              <div>
                <button type="button" onClick={addOccupation}
                  className="w-full rounded-lg bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 hover:bg-brand-600 transition">
                  + Add Professional Context
                </button>
              </div>
            </div>
          </div>

          {/* Occupations Table */}
          {occupations.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {["Type", "Designation / Business", "Income", "Period", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {occupations.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{o.engagementType}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{o.engagementType === 'Business Owner' ? o.businessName : o.position}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-gray-200">Rs. {o.netMonthlyIncome || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{o.startDate || "—"} → {o.endDate || "Present"}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => removeOccupation(o.id)}
                          className="text-red-500 hover:text-red-700 font-semibold transition">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-center text-gray-400 py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
              No professional entries added yet.
            </p>
          )}
        </div>

        {/* ── Verification Documents + Banking Accounts ─────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Verification Documents */}
          <div className={cardCls}>
            <div className={sectionTitle}>
              <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">🪪</span>
              VERIFICATION DOCUMENTS
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 space-y-3 border border-dashed border-gray-200 dark:border-gray-700">
              <div>
                <label className={labelCls}>Select Document Category</label>
                <select className={selectCls} value={docCategory} onChange={e => setDocCategory(e.target.value)}>
                  <option value="">Select</option>
                  <option>NIC (Front)</option>
                  <option>NIC (Back)</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Birth Certificate</option>
                  <option>Utility Bill</option>
                  <option>Bank Statement</option>
                  <option>Salary Slip</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Upload Document</label>
                <input type="file" className={`${inputCls} file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-brand-600`}
                  onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
              </div>
              <button type="button" onClick={addDocument}
                className="w-full rounded-lg bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 hover:bg-brand-600 transition">
                + Attach Document
              </button>
            </div>

            {docEntries.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {["Category", "File", "Actions"].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {docEntries.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-200">{d.category}</td>
                        <td className="px-4 py-3 text-brand-600">{d.fileName}</td>
                        <td className="px-4 py-3">
                          <button type="button" onClick={() => removeDocument(d.id)}
                            className="text-red-500 hover:text-red-700 font-semibold transition">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-center text-gray-400 py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No documents attached yet.
              </p>
            )}
          </div>

          {/* Banking Accounts */}
          <div className={cardCls}>
            <div className={sectionTitle}>
              <span className="w-7 h-7 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs">🏦</span>
              BANKING ACCOUNTS
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-4 space-y-3 border border-dashed border-gray-200 dark:border-gray-700">
              <div>
                <label className={labelCls}>Select Bank</label>
                <select className={selectCls} value={bankForm.bank} onChange={e => setBankForm(f => ({ ...f, bank: e.target.value }))}>
                  <option value="">Select Bank</option>
                  <option>Bank of Ceylon</option>
                  <option>People's Bank</option>
                  <option>Commercial Bank</option>
                  <option>Sampath Bank</option>
                  <option>HNB</option>
                  <option>NSB</option>
                  <option>Seylan Bank</option>
                  <option>NTB</option>
                  <option>PABC</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Account Number</label>
                  <input className={inputCls} placeholder="Account Number" value={bankForm.accountNumber}
                    onChange={e => setBankForm(f => ({ ...f, accountNumber: e.target.value }))} />
                </div>
                <div>
                  <label className={labelCls}>Account Type</label>
                  <select className={selectCls} value={bankForm.type} onChange={e => setBankForm(f => ({ ...f, type: e.target.value }))}>
                    <option value="">Select</option>
                    <option>Savings</option>
                    <option>Current</option>
                    <option>Fixed Deposit</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Beneficiary / Account Name</label>
                <div className="flex gap-2">
                  <input className={`${inputCls} flex-1`} placeholder="Beneficiary Account Name" value={bankForm.beneficiary}
                    onChange={e => setBankForm(f => ({ ...f, beneficiary: e.target.value }))} />
                  <button type="button" onClick={addBank}
                    className="flex-shrink-0 rounded-lg bg-brand-500 text-white text-xs font-semibold px-4 py-2.5 hover:bg-brand-600 transition">
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Branch</label>
                <input className={inputCls} placeholder="Branch Name" value={bankForm.branch}
                  onChange={e => setBankForm(f => ({ ...f, branch: e.target.value }))} />
              </div>
            </div>

            {banks.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      {["Institution", "Beneficiary", "Account No.", "Code", "Branch", "Actions"].map(h => (
                        <th key={h} className="px-3 py-3 text-left font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {banks.map(b => (
                      <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition">
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{b.bank}</td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{b.beneficiary || "—"}</td>
                        <td className="px-3 py-3 text-gray-700 dark:text-gray-200">{b.accountNumber}</td>
                        <td className="px-3 py-3 text-gray-500">{b.type || "—"}</td>
                        <td className="px-3 py-3 text-gray-500">{b.branch || "—"}</td>
                        <td className="px-3 py-3">
                          <button type="button" onClick={() => removeBank(b.id)}
                            className="text-red-500 hover:text-red-700 font-semibold transition">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-center text-gray-400 py-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                No bank accounts added yet.
              </p>
            )}
          </div>
        </div>

        {/* ── Footer Actions ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="text-base">🔒</span>
            <div>
              <p className="font-semibold text-gray-600 dark:text-gray-300">Data Security Assured</p>
              <p>All records are encrypted and stored following industry standards.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={handleClear}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
              Discard Changes
            </button>
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60 transition shadow-sm">
              {isSubmitting ? (
                <><span className="animate-spin">⏳</span> Registering…</>
              ) : (
                <><span>✓</span> Confirm Registration</>
              )}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
