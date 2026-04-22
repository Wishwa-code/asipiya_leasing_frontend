import { useState, useEffect } from "react";
import { 
  CloseLineIcon, 
  BoxIcon, 
  CalenderIcon as CalendarIcon, 
  DollarLineIcon, 
  TimeIcon, 
  ListIcon, 
  DocsIcon,
  CheckLineIcon
} from "../../../icons";
import apiClient from "../../../api/apiClient";

interface ViewProductModalProps {
  productId: number;
  onClose: () => void;
}

export default function ViewProductModal({ productId, onClose }: ViewProductModalProps) {
  const [product, setProduct] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      // Depending on backend preference, this could be /api/leasing/products/:id 
      const res = await apiClient.get(`/api/leasing/products/${productId}`);
       // API might wrap inside data or response.data.product
      setProduct(res.data?.data || res.data?.product || res.data);
    } catch (error) {
      console.error("Failed to load product details", error);
    } finally {
      setLoading(false);
    }
  };

  if (!productId) return null;

  // Formatting helpers
  const formatText = (text?: string) => {
    if (!text) return '-';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (val: string | number) => {
    const num = Number(val) || 0;
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Derivative metrics
  let minLoanLimit = 0;
  let maxLoanLimit = 0;
  
  if (product && product.product_has_items && product.product_has_items.length > 0) {
    let min = Infinity;
    let max = -Infinity;
    product.product_has_items.forEach((item: Record<string, any>) => {
      const imin = Number(item.minimum_loan_amount) || 0;
      const imax = Number(item.maximum_loan_amount) || 0;
      if (imin < min) min = imin;
      if (imax > max) max = imax;
    });
    if (min !== Infinity) minLoanLimit = min;
    if (max !== -Infinity) maxLoanLimit = max;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-gray-50 dark:bg-gray-900 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start shrink-0">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Product Details</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Comprehensive overview of the selected product</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg transition-colors"
          >
            <CloseLineIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-brand-500">
              <span className="w-8 h-8 border-4 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-4"></span>
              <p className="font-semibold text-sm">Loading product details...</p>
            </div>
          ) : !product ? (
             <div className="text-center py-20 text-gray-500">Failed to load payload.</div>
          ) : (
            <div className="space-y-6">
              
              {/* Product Top Header */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-5">
                  <div className="shrink-0 w-16 h-16 bg-brand-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-brand-500/30">
                    <BoxIcon className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                       <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{product.product_name}</h2>
                       {product.status === 'active' ? (
                          <span className="px-3 py-1 bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400 rounded-full text-xs font-bold border border-success-200 dark:border-success-800">Active</span>
                       ) : (
                          <span className="px-3 py-1 bg-error-50 dark:bg-error-500/10 text-error-600 dark:text-error-400 rounded-full text-xs font-bold border border-error-200 dark:border-error-800">Inactive</span>
                       )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg font-bold text-gray-700 dark:text-gray-300">
                        Code: {product.product_code}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarIcon className="w-4 h-4" />
                        Created: <span className="font-medium">{product.CreatedAt ? new Date(product.CreatedAt).toLocaleDateString() : 'N/A'}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white dark:bg-gray-800 p-5 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-info-50 text-info-500 dark:bg-info-500/10 dark:text-info-400 rounded-full flex items-center justify-center mb-3">
                      <BoxIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Interest Method</p>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{formatText(product.interest_method)}</h4>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-5 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-brand-50 text-brand-500 dark:bg-brand-500/10 dark:text-brand-400 rounded-full flex items-center justify-center mb-3">
                      <DollarLineIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Loan Limits</p>
                    <div className="flex items-center gap-2">
                       <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(minLoanLimit)}</span>
                       <span className="text-sm font-medium text-gray-400">to</span>
                       <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(maxLoanLimit)}</span>
                    </div>
                 </div>
                 <div className="bg-white dark:bg-gray-800 p-5 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-sm flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-success-50 text-success-500 dark:bg-success-500/10 dark:text-success-400 rounded-full flex items-center justify-center mb-3">
                      <TimeIcon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Period Type</p>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">{formatText(product.loan_period_type)}</h4>
                 </div>
              </div>

              {/* Configurations List */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ListIcon className="w-5 h-5 text-brand-500" />
                    Sub Products (Configuration)
                  </h3>
                  <span className="px-3 py-1 bg-brand-100 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 rounded-full text-xs font-bold">
                    {product.product_has_items?.length || 0} Items
                  </span>
                </div>
                <div className="overflow-x-auto">
                   <table className="w-full text-left text-sm whitespace-nowrap text-gray-600 dark:text-gray-400">
                     <thead className="bg-gray-50 dark:bg-gray-800 text-xs font-bold uppercase text-gray-400">
                       <tr>
                         <th className="px-6 py-3">Item Name</th>
                         <th className="px-6 py-3">Loan Amount Range</th>
                         <th className="px-6 py-3">Period & Interest</th>
                         <th className="px-6 py-3 text-right">Penalty</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                       {!product.product_has_items || product.product_has_items.length === 0 ? (
                         <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No items configured for this product.</td></tr>
                       ) : product.product_has_items.map((cfg: Record<string, any>, idx: number) => (
                         <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                           <td className="px-6 py-4">
                             <p className="font-bold text-gray-900 dark:text-gray-200">{cfg.product_item_name}</p>
                           </td>
                           <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-300">
                             {formatCurrency(cfg.minimum_loan_amount)} - {formatCurrency(cfg.maximum_loan_amount)}
                           </td>
                           <td className="px-6 py-4">
                             <p className="font-bold text-gray-900 dark:text-gray-200">{cfg.minimum_interest}% - {cfg.maximum_interest}%</p>
                             <p className="text-xs text-gray-400 mt-0.5">{cfg.minimum_loan_period} - {cfg.maximum_loan_period} {formatText(product.loan_period_type)}</p>
                           </td>
                           <td className="px-6 py-4 text-right">
                             {cfg.penalty_percentage > 0 ? (
                               <>
                                 <p className="text-error-500 font-bold">{cfg.penalty_percentage}%</p>
                                 <p className="text-xs text-gray-400 mt-0.5">{formatText(cfg.penalty_apply_type)}</p>
                               </>
                             ) : (
                               <span className="text-gray-400 font-medium">No penalty</span>
                             )}
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
              </div>

              {/* Bottom splits (Charges and Docs) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Charges */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       <DollarLineIcon className="w-5 h-5 text-warning-500" /> Additional Charges
                    </h3>
                  </div>
                  <div className="flex-1 overflow-x-auto p-2">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
                      <thead className="text-xs font-bold uppercase text-gray-400">
                         <tr>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2">Amount/Rate</th>
                            <th className="px-4 py-2 text-right">Type</th>
                         </tr>
                      </thead>
                       <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                        {!product.additional_charges || product.additional_charges.length === 0 ? (
                           <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-400">No additional charges.</td></tr>
                        ) : product.additional_charges.map((charge: Record<string, any>, idx: number) => (
                           <tr key={idx}>
                             <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-200">{charge.description}</td>
                             <td className="px-4 py-3 font-bold">{formatCurrency(charge.value)}{charge.value_type === 'percentage' ? '%' : ''}</td>
                             <td className="px-4 py-3 text-right">
                               {charge.value_type === 'percentage' ? (
                                 <span className="px-2 py-0.5 bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400 text-xs font-bold rounded">Percentage</span>
                               ) : (
                                 <span className="px-2 py-0.5 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 text-xs font-bold rounded">Fixed</span>
                               )}
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Docs */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                       <DocsIcon className="w-5 h-5 text-success-500" /> Required Documents
                    </h3>
                  </div>
                  <div className="flex-1 p-4">
                     <ul className="space-y-2">
                      {!product.required_documents || product.required_documents.length === 0 ? (
                        <li className="text-center py-4 text-gray-400 text-sm">No documents required.</li>
                      ) : product.required_documents.map((doc: Record<string, any>, idx: number) => (
                         <li key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                            <div className="w-6 h-6 shrink-0 bg-success-100 dark:bg-success-500/20 text-success-500 rounded-full flex justify-center items-center">
                               <CheckLineIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 dark:text-gray-200 flex-1">{doc.name}</span>
                            <span className="text-xs font-medium text-gray-400">{doc.status || 'Required'}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end shrink-0">
           <button 
             onClick={onClose}
             className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-colors"
           >
             Close
           </button>
        </div>

      </div>
    </div>
  );
}
