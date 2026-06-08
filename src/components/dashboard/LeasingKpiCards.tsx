import React from "react";
import { Coins, AlertTriangle, Percent, Activity } from "lucide-react";

interface Stats {
  active_portfolio_value: number;
  arrears_outstanding: number;
  npl_ratio: number;
  disbursement_pipeline: number;
  active_leases_count: number;
}

interface LeasingKpiCardsProps {
  stats: Stats;
  loading: boolean;
}

export const LeasingKpiCards: React.FC<LeasingKpiCardsProps> = ({ stats, loading }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val.toFixed(2)}%`;
  };

  const cardItems = [
    {
      title: "Active Portfolio",
      value: loading ? "Loading..." : formatCurrency(stats.active_portfolio_value),
      desc: loading ? "..." : `${stats.active_leases_count} active lease agreements`,
      icon: <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
      colorClass: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400",
      borderClass: "border-indigo-100/50 dark:border-indigo-950/20",
    },
    {
      title: "Arrears Outstanding",
      value: loading ? "Loading..." : formatCurrency(stats.arrears_outstanding),
      desc: loading ? "..." : "Total default amount overdue",
      icon: <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      colorClass: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
      borderClass: "border-red-100/50 dark:border-red-950/20",
    },
    {
      title: "NPL Ratio (Overdue %)",
      value: loading ? "Loading..." : formatPercent(stats.npl_ratio),
      desc: loading ? "..." : "Non-Performing Loan percentage",
      icon: <Percent className="w-5 h-5 text-purple-600 dark:text-purple-400" />,
      colorClass: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
      borderClass: "border-purple-100/50 dark:border-purple-950/20",
    },
    {
      title: "Disbursement Pipeline",
      value: loading ? "Loading..." : formatCurrency(stats.disbursement_pipeline),
      desc: loading ? "..." : "Approved leases awaiting payout",
      icon: <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      colorClass: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400",
      borderClass: "border-emerald-100/50 dark:border-emerald-950/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cardItems.map((item, index) => (
        <div
          key={index}
          className={`bg-white dark:bg-gray-900 border ${item.borderClass} rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between`}
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {item.title}
            </span>
            <div className={`p-2 rounded-xl ${item.colorClass}`}>
              {item.icon}
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white truncate">
              {item.value}
            </h3>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></span>
              {item.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
