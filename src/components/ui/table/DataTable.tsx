import React, { useState, useRef, useEffect } from "react";
import { CloseIcon, DownloadIcon, TableIcon } from "../../../icons";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  render?: (item: T, index: number) => React.ReactNode;
  visible?: boolean;
  toggleable?: boolean;
}

interface TabOption {
  label: string;
  value: string;
}

interface DataTableProps<T> {
  // Core Data
  data: T[];
  columns: ColumnConfig<T>[];
  loading?: boolean;
  
  // Search & Filtering
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  
  // Status Tabs
  tabs?: TabOption[];
  activeTab?: string;
  onTabChange?: (value: string) => void;
  
  // Custom Filter Pills (Optional slot for custom popovers/pills)
  filterBarLeft?: React.ReactNode;
  
  // Action Buttons
  onExport?: () => void;
  createButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  
  // Column Visibility
  visibleCols?: Record<string, boolean>;
  onVisibleColsChange?: (cols: Record<string, boolean>) => void;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  tabs,
  activeTab = "",
  onTabChange,
  filterBarLeft,
  onExport,
  createButton,
  visibleCols,
  onVisibleColsChange,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
}: DataTableProps<T>) {
  const [columnsPopoverOpen, setColumnsPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setColumnsPopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter columns based on visibility config
  const renderedColumns = columns.filter((col) => {
    if (visibleCols && visibleCols[col.key] === false) return false;
    if (col.visible === false) return false;
    return true;
  });

  const totalColsCount = renderedColumns.length;

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = Math.min(pageStart + pageSize, totalItems);

  // Pagination page range helper (show at most 5 page numbers)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = 2;
    let start = Math.max(1, safePage - half);
    const end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const hasTabsRow = (tabs && tabs.length > 0) || onSearchChange;
  const hasFilterRow = filterBarLeft || onExport || createButton || (visibleCols && onVisibleColsChange);

  return (
    <div className="w-full">
      {/* ── Tabs + Search Row ── */}
      {hasTabsRow && (
        <div className="flex items-stretch border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
          {/* Tabs */}
          {tabs && tabs.map((tab, i) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onTabChange?.(tab.value)}
              className={`px-5 py-2.5 text-sm font-medium text-left transition-colors whitespace-nowrap ${
                i > 0 ? "border-l border-gray-200 dark:border-gray-700" : ""
              } ${
                activeTab === tab.value
                  ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 font-semibold"
                  : "bg-gray-50/60 dark:bg-gray-800/40 text-gray-500 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Search bar anchored to the right */}
          {onSearchChange && (
            <div className={`flex-1 flex items-center px-3 bg-white dark:bg-gray-900 ${
              tabs && tabs.length > 0 ? "border-l border-gray-200 dark:border-gray-700" : "py-2"
            }`}>
              <div className="ml-auto flex items-center gap-1.5 w-56 border border-gray-200 dark:border-gray-700 rounded-md px-2.5 py-1 bg-gray-50 dark:bg-gray-850 focus-within:border-brand-400 focus-within:bg-white dark:focus-within:bg-gray-900 transition-colors">
                <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent text-xs text-gray-700 dark:text-gray-300 outline-none placeholder-gray-400 py-1"
                />
                {searchQuery && (
                  <button onClick={() => onSearchChange("")} className="text-gray-400 hover:text-gray-600 shrink-0">
                    <CloseIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Filters & Actions Row ── */}
      {hasFilterRow && (
        <div className={`flex flex-wrap items-center justify-between gap-2 py-2 border-x border-b border-gray-200 dark:border-gray-700 px-3 ${!hasTabsRow ? "border-t" : ""}`}>
          {/* Left: Optional filter slots */}
          <div className="flex flex-wrap items-center gap-2">
            {filterBarLeft}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {onExport && (
              <button
                onClick={onExport}
                className="inline-flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                Export
              </button>
            )}

            {createButton && (
              <button
                onClick={createButton.onClick}
                className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-md px-3 py-1.5 text-xs font-medium transition-colors shadow-sm"
              >
                {createButton.icon || <span className="text-xs font-bold leading-none">+</span>}
                {createButton.label}
              </button>
            )}

            {/* Edit Columns Customizer */}
            {visibleCols && onVisibleColsChange && (
              <div className="relative" ref={popoverRef}>
                <button
                  onClick={() => setColumnsPopoverOpen(!columnsPopoverOpen)}
                  className={`inline-flex items-center gap-1.5 border rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    columnsPopoverOpen
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  Edit columns
                </button>

                {columnsPopoverOpen && (
                  <div className="absolute right-0 mt-2 z-50 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg min-w-[200px] py-2">
                    {/* Active Columns */}
                    <div className="px-4 pt-1 pb-1">
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Active Columns
                      </p>
                      {columns.filter((c) => c.toggleable !== false).map((col) => {
                        const isChecked = visibleCols[col.key] !== false;
                        return (
                          <label
                            key={col.key}
                            className="flex items-center justify-between text-xs text-gray-700 dark:text-gray-300 font-medium select-none px-0.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) =>
                                  onVisibleColsChange({
                                    ...visibleCols,
                                    [col.key]: e.target.checked,
                                  })
                                }
                                className="w-3.5 h-3.5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                              />
                              <span>{col.label}</span>
                            </div>
                            <span className="text-gray-300 dark:text-gray-600 text-xs">⠿</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Table Grid ── */}
      <div className={`border-x border-b border-gray-200 dark:border-gray-700 overflow-x-auto ${!hasTabsRow && !hasFilterRow ? "border-t" : ""}`}>
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <tr>
              {renderedColumns.map((col) => (
                <th
                  key={col.key}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {loading ? (
              <tr>
                <td colSpan={totalColsCount} className="px-4 py-10 text-center">
                  <span className="inline-block w-6 h-6 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
                  <p className="mt-2 text-xs text-gray-400 font-semibold tracking-wider uppercase">Loading records…</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={totalColsCount} className="px-4 py-12 text-center text-xs text-gray-400">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  {renderedColumns.map((col) => (
                    <td key={col.key} className="px-3 py-1 text-xs text-gray-700 dark:text-gray-300">
                      {col.render ? col.render(item, idx) : (item as any)[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer Pagination ── */}
      {!loading && totalItems > 0 && (
        <div className="flex items-center justify-between mt-3 flex-wrap gap-3">
          {/* Left: counts & entries selector */}
          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing {pageStart + 1}–{pageEnd} of {totalItems} entries
            </p>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="text-[11px] border border-gray-200 dark:border-gray-700 rounded px-1.5 py-0.5 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
            >
              {pageSizeOptions.map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>
          </div>

          {/* Right: navigation buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={safePage === 1}
                className="px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
              >
                ‹ Prev
              </button>

              {getPageNumbers().map((pg) => (
                <button
                  key={pg}
                  onClick={() => onPageChange(pg)}
                  className={`w-7 h-6 text-xs rounded transition-colors border ${
                    pg === safePage
                      ? "bg-brand-500 border-brand-500 text-white font-semibold"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={safePage === totalPages}
                className="px-2 py-0.5 text-xs border border-gray-200 dark:border-gray-700 rounded bg-white dark:bg-gray-900 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-45 disabled:cursor-not-allowed transition-colors"
              >
                Next ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
