import { useState, useEffect } from "react";
import PageMeta from "../../components/common/PageMeta";
import apiClient from "../../api/apiClient";
import { LeasingKpiCards } from "../../components/dashboard/LeasingKpiCards";
import { DisbursementCollectionsChart } from "../../components/dashboard/DisbursementCollectionsChart";
import { ArrearsAgingChart } from "../../components/dashboard/ArrearsAgingChart";
import { ActionableWorklists } from "../../components/dashboard/ActionableWorklists";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const [stats, setStats] = useState({
    active_portfolio_value: 0,
    arrears_outstanding: 0,
    npl_ratio: 0,
    disbursement_pipeline: 0,
    active_leases_count: 0,
  });
  const [trends, setTrends] = useState([]);
  const [arrearsAging, setArrearsAging] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendsRes, agingRes] = await Promise.all([
        apiClient.get("/leasing/dashboard/stats"),
        apiClient.get("/leasing/dashboard/trends"),
        apiClient.get("/leasing/dashboard/arrears-aging"),
      ]);
      setStats(statsRes.data);
      setTrends(trendsRes.data?.data || []);
      setArrearsAging(agingRes.data?.data || []);
    } catch (err) {
      console.error("Error loading dashboard data", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData();
  };

  return (
    <>
      <PageMeta
        title="Leasing Operations Dashboard | Asipiya Leasing"
        description="Leasing operations KPIs, trends, and recovery worklists"
      />

      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pt-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-xs font-semibold text-gray-500">
            Leasing portfolio overview and real-time operations performance
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || isRefreshing}
          className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-750 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-xs hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-theme-xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Top KPIs */}
        <LeasingKpiCards stats={stats} loading={loading} />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <DisbursementCollectionsChart data={trends} loading={loading} />
          </div>
          <div className="lg:col-span-5">
            <ArrearsAgingChart data={arrearsAging} loading={loading} />
          </div>
        </div>

        {/* Actionable Worklists Section */}
        <div className="grid grid-cols-1 gap-6">
          <ActionableWorklists onDisburseSuccess={loadDashboardData} />
        </div>
      </div>
    </>
  );
}
