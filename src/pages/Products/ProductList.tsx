import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import { Link, useNavigate } from "react-router";
import { PlusIcon, EyeIcon, PencilIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import ViewProductModal from "./components/ViewProductModal";
import { ROUTES } from "../../routes/paths";

// Simplified type for the list view
type ProductListItem = {
  id: number;
  product_name: string;
  product_code: string;
  interest_method: string;
  loan_period_type: string;
  status: 'active' | 'inactive';
  items_count: number;
  charges_count: number;
};

export default function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/leasing/products');
      // For now, depending on API response, we assume res.data holds the array or res.data.data
      setProducts(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    // Optimistic update
    setProducts(products.map(p => p.id === id ? { ...p, status: newStatus } : p));

    try {
      await apiClient.post('/leasing/products/status', {
        id,
        status: newStatus
      });
    } catch (err) {
      console.error("Failed to toggle status", err);
      // Revert on failure
      setProducts(products.map(p => p.id === id ? { ...p, status: currentStatus as 'active' | 'inactive' } : p));
    }
  };

  // Safe formatting helper
  const formatText = (text: string) => {
    if (!text) return '-';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredProducts = products.filter(p =>
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.product_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative pb-20">
      <PageMeta
        title="Product List | Asipiya Leasing"
        description="Manage your microfinance products"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Product List</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your microfinance products</p>
        </div>
        <Link
          to="/products/create"
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Create Product
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">

        {/* Top bar */}
        <div className="p-4 sm:p-5 flex justify-end border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <input
            type="text"
            placeholder="Search products..."
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
                <th className="px-5 py-4 w-16">No</th>
                <th className="px-5 py-4">Product Name</th>
                <th className="px-5 py-4">Code</th>
                <th className="px-5 py-4">Interest Method</th>
                <th className="px-5 py-4">Period Type</th>
                <th className="px-5 py-4 text-center">Sub Products</th>
                <th className="px-5 py-4 text-center">Charges</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-5 py-8 text-center text-gray-500">
                    <span className="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin mb-2"></span>
                    <p className="font-medium text-xs uppercase tracking-widest text-brand-500">Loading Data...</p>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-gray-500">
                    <p className="font-semibold text-sm">No data available in table</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, idx) => (
                  <tr key={`${product.id}-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-gray-200">{idx + 1}</td>
                    <td className="px-5 py-4 font-bold text-gray-900 dark:text-white uppercase">{product.product_name}</td>
                    <td className="px-5 py-4"><span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-600 dark:text-gray-300">{product.product_code}</span></td>
                    <td className="px-5 py-4 font-medium">{formatText(product.interest_method)}</td>
                    <td className="px-5 py-4 font-medium">{formatText(product.loan_period_type)}</td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs">
                        {product.items_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400 font-bold text-xs">
                        {product.charges_count || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={product.status === 'active'}
                          onChange={() => toggleStatus(product.id, product.status)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
                      </label>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedProductId(product.id)}
                          className="p-2 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-700 dark:hover:bg-brand-500/20 text-gray-500 rounded-lg transition-colors inline-block"
                          aria-label="View Product"
                        >
                          <EyeIcon className="w-4 h-4 fill-current" />
                        </button>
                        <button
                          onClick={() => navigate(ROUTES.EDIT_PRODUCT.replace(':id', product.id.toString()))}
                          className="p-2 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-700 dark:hover:bg-brand-500/20 text-gray-500 rounded-lg transition-colors inline-block"
                          aria-label="Edit Product"
                        >
                          <PencilIcon className="w-4 h-4 fill-current" />
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
            Showing {filteredProducts.length > 0 ? 1 : 0} to {filteredProducts.length} of {filteredProducts.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-400 cursor-not-allowed">
              Previous
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-400 cursor-not-allowed">
              Next
            </button>
          </div>
        </div>

      </div>

      {selectedProductId && (
        <ViewProductModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}
