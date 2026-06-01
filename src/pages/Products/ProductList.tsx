import { useState, useEffect, useMemo } from "react";
import PageMeta from "../../components/common/PageMeta";
import { useNavigate } from "react-router";
import { EyeIcon, PencilIcon } from "../../icons";
import apiClient from "../../api/apiClient";
import ViewProductModal from "./components/ViewProductModal";
import { ROUTES } from "../../routes/paths";
import { DataTable } from "../../components/ui/table";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>({
    no: true,
    product_name: true,
    product_code: true,
    interest_method: true,
    loan_period_type: true,
    items_count: true,
    charges_count: true,
    status: true,
    actions: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Reset to first page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/leasing/products');
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
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));

    try {
      await apiClient.post('/leasing/products/status', {
        id,
        status: newStatus
      });
    } catch (err) {
      console.error("Failed to toggle status", err);
      // Revert on failure
      setProducts(prev => prev.map(p => p.id === id ? { ...p, status: currentStatus as 'active' | 'inactive' } : p));
    }
  };

  // Safe formatting helper
  const formatText = (text: string) => {
    if (!text) return '-';
    return text.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p =>
      p.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.product_code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  const totalItems = filteredProducts.length;

  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [filteredProducts, currentPage, pageSize]);

  const columns = useMemo(() => [
    {
      key: "no",
      label: "No",
      toggleable: false,
      render: (_: any, idx: number) => (
        <span className="font-semibold text-gray-900 dark:text-gray-200">
          {(currentPage - 1) * pageSize + idx + 1}
        </span>
      ),
    },
    {
      key: "product_name",
      label: "Product Name",
      toggleable: true,
      render: (product: ProductListItem) => (
        <span className="font-bold text-gray-900 dark:text-white uppercase">
          {product.product_name}
        </span>
      ),
    },
    {
      key: "product_code",
      label: "Code",
      toggleable: true,
      render: (product: ProductListItem) => (
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs font-bold text-gray-600 dark:text-gray-300">
          {product.product_code}
        </span>
      ),
    },
    {
      key: "interest_method",
      label: "Interest Method",
      toggleable: true,
      render: (product: ProductListItem) => formatText(product.interest_method),
    },
    {
      key: "loan_period_type",
      label: "Period Type",
      toggleable: true,
      render: (product: ProductListItem) => formatText(product.loan_period_type),
    },
    {
      key: "items_count",
      label: "Sub Products",
      toggleable: true,
      render: (product: ProductListItem) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs">
            {product.items_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: "charges_count",
      label: "Charges",
      toggleable: true,
      render: (product: ProductListItem) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning-50 dark:bg-warning-500/10 text-warning-600 dark:text-warning-400 font-bold text-xs">
            {product.charges_count || 0}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      toggleable: true,
      render: (product: ProductListItem) => (
        <div className="text-center">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={product.status === 'active'}
              onChange={() => toggleStatus(product.id, product.status)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-500"></div>
          </label>
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      toggleable: false,
      render: (product: ProductListItem) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setSelectedProductId(product.id)}
            className="p-2 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-700 dark:hover:bg-brand-500/20 text-gray-500 rounded-lg transition-colors inline-block cursor-pointer"
            aria-label="View Product"
          >
            <EyeIcon className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => navigate(ROUTES.EDIT_PRODUCT.replace(':id', product.id.toString()))}
            className="p-2 bg-gray-100 hover:bg-brand-50 hover:text-brand-600 dark:bg-gray-700 dark:hover:bg-brand-500/20 text-gray-500 rounded-lg transition-colors inline-block cursor-pointer"
            aria-label="Edit Product"
          >
            <PencilIcon className="w-4 h-4 fill-current" />
          </button>
        </div>
      ),
    },
  ], [currentPage, pageSize]);

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
      </div>

      <DataTable<ProductListItem>
        data={paginatedProducts}
        columns={columns}
        loading={loading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search products…"
        createButton={{
          label: "Create Product",
          onClick: () => navigate("/products/create"),
        }}
        visibleCols={visibleCols}
        onVisibleColsChange={setVisibleCols}
        currentPage={currentPage}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />

      {selectedProductId && (
        <ViewProductModal
          productId={selectedProductId}
          onClose={() => setSelectedProductId(null)}
        />
      )}
    </div>
  );
}
