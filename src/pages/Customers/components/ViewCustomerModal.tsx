import { useState, useEffect } from "react";
import { CloseIcon, UserCircleIcon, InfoIcon, CalenderIcon, HorizontaLDots } from "../../../icons";
import apiClient from "../../../api/apiClient";

interface ViewCustomerModalProps {
  customerId: number;
  onClose: () => void;
}

export default function ViewCustomerModal({ customerId, onClose }: ViewCustomerModalProps) {
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/customers/${customerId}`);
        setCustomer(res.data?.data || res.data);
      } catch (err) {
        console.error("Failed to fetch customer details", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerDetails();
  }, [customerId]);

  if (!onClose) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all transform scale-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <UserCircleIcon className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Customer Details</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Full view of customer information</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-400"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 dark:bg-gray-900/20">
          {loading ? (
            <div className="py-20 text-center">
              <span className="inline-block w-10 h-10 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin"></span>
              <p className="mt-4 text-sm font-bold text-brand-500 uppercase tracking-widest">Loading Information...</p>
            </div>
          ) : customer ? (
            <div className="space-y-8">
              
              {/* General Information */}
              <section>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div> General Context
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem label="Full Name" value={customer.full_name} />
                  <DetailItem label="Customer Code" value={customer.customer_code} highlighted />
                  <DetailItem label="NIC Number" value={customer.new_nic || customer.old_nic} />
                  <DetailItem label="Gender" value={customer.gender} />
                  <DetailItem label="Date of Birth" value={customer.dob} />
                  <DetailItem label="Status" value={customer.status} isStatus />
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Contact Information */}
              <section>
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning-500"></div> Contact Points
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem label="Primary Mobile" value={customer.contact_no} />
                  <DetailItem label="Secondary Mobile" value={customer.contact_no_02} />
                  <DetailItem label="Landline" value={customer.landline} />
                  <DetailItem label="Email Address" value={customer.email} />
                  <DetailItem label="City" value={customer.city} />
                  <DetailItem label="Province" value={customer.province} />
                </div>
              </section>

              <hr className="border-gray-100 dark:border-gray-700" />

              {/* Addresses */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-info-500"></div> Permanent Address
                    </h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {customer.permanent_address_line1}<br />
                        {customer.permanent_address_line2}<br />
                        {customer.permanent_address_line3}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-info-500"></div> Postal Address
                    </h4>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {customer.postal_address_line1}<br />
                        {customer.postal_address_line2}<br />
                        {customer.postal_address_line3}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bank Accounts & Occupations */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Bank Accounts</h4>
                    <div className="space-y-3">
                      {customer.bank_accounts?.length > 0 ? customer.bank_accounts.map((acc: any, i: number) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                          <div>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{acc.bank_name}</p>
                            <p className="text-[11px] text-gray-500">{acc.account_number}</p>
                          </div>
                          <span className="text-[10px] font-bold text-brand-500 uppercase">{acc.account_type}</span>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400 italic">No bank accounts recorded</p>
                      )}
                    </div>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4">Occupations</h4>
                    <div className="space-y-3">
                      {customer.occupations?.length > 0 ? customer.occupations.map((occ: any, i: number) => (
                        <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-100 dark:border-gray-700">
                          <p className="text-sm font-bold text-gray-900 dark:text-white">{occ.business_name || occ.designation}</p>
                          <p className="text-[11px] text-gray-500">{occ.type} • {occ.nature_of_business}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400 italic">No occupation details recorded</p>
                      )}
                    </div>
                  </section>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-gray-400">
              <p>Failed to load customer details.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-brand-500/20"
          >
            Close View
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value, highlighted = false, isStatus = false }: { label: string, value: any, highlighted?: boolean, isStatus?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      {isStatus ? (
        <span className={`inline-flex w-fit items-center justify-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${value === 'active' ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 'bg-error-50 text-error-600 dark:bg-error-500/10'}`}>
          {value || 'Unknown'}
        </span>
      ) : (
        <p className={`text-sm font-bold ${highlighted ? 'text-brand-500' : 'text-gray-900 dark:text-white'}`}>
          {value || '-'}
        </p>
      )}
    </div>
  );
}
