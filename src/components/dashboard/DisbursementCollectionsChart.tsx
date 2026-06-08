import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface TrendDataPoint {
  month: string;
  year_month: string;
  disbursed: number;
  collected: number;
}

interface DisbursementCollectionsChartProps {
  data: TrendDataPoint[];
  loading: boolean;
}

export const DisbursementCollectionsChart: React.FC<DisbursementCollectionsChartProps> = ({
  data,
  loading,
}) => {
  const categories = data.map((d) => d.month);
  const disbursedSeries = data.map((d) => d.disbursed);
  const collectedSeries = data.map((d) => d.collected);

  const formatLKR = (val: number) => {
    if (val >= 1000000) {
      return `${(val / 1000000).toFixed(1)}M LKR`;
    }
    if (val >= 1000) {
      return `${(val / 1000).toFixed(0)}k LKR`;
    }
    return `${val} LKR`;
  };

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Geist, sans-serif",
      fontWeight: 600,
      fontSize: "12px",
      markers: {
        size: 5,
      },
    },
    colors: ["#4F46E5", "#10B981"], // Indigo, Emerald
    chart: {
      fontFamily: "Geist, sans-serif",
      height: 310,
      type: "area",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: [2, 2],
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
          }).format(val),
      },
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => formatLKR(val),
        style: {
          fontSize: "12px",
          colors: ["#6B7280"],
        },
      },
    },
  };

  const series = [
    {
      name: "Disbursed Capital",
      data: disbursedSeries,
    },
    {
      name: "Collected Installments",
      data: collectedSeries,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white">
            Disbursements vs. Collections
          </h4>
          <p className="text-xs font-semibold text-gray-500">
            6-month capital outflow vs. inflow trend
          </p>
        </div>
      </div>
      {loading ? (
        <div className="h-[310px] flex items-center justify-center text-sm font-semibold text-gray-400">
          Loading chart data...
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[500px]">
            <Chart options={options} series={series} type="area" height={310} />
          </div>
        </div>
      )}
    </div>
  );
};
