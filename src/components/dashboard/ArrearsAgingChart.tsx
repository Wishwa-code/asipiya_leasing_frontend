import React from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface AgingPoint {
  range: string;
  value: number;
}

interface ArrearsAgingChartProps {
  data: AgingPoint[];
  loading: boolean;
}

export const ArrearsAgingChart: React.FC<ArrearsAgingChartProps> = ({ data, loading }) => {
  const categories = data.map((d) => d.range);
  const values = data.map((d) => d.value);

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
    chart: {
      fontFamily: "Geist, sans-serif",
      type: "bar",
      height: 310,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "45%",
        borderRadius: 8,
        borderRadiusApplication: "end",
        distributed: true, // Assigns unique colors to individual bars
      },
    },
    // Yellow, Amber, Red, Dark Red (indicating warning -> critical)
    colors: ["#FBBF24", "#F59E0B", "#EF4444", "#B91C1C"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      labels: {
        style: {
          fontWeight: 600,
        },
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
    legend: {
      show: false, // colors correspond to the x-axis buckets, so legend is redundant
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
    tooltip: {
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat("en-LK", {
            style: "currency",
            currency: "LKR",
          }).format(val),
      },
    },
  };

  const series = [
    {
      name: "Arrears Balance",
      data: values,
    },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
      <div>
        <h4 className="text-base font-bold text-gray-900 dark:text-white">
          Arrears Aging Buckets
        </h4>
        <p className="text-xs font-semibold text-gray-500 mb-6">
          Overdue installment balance aging distribution
        </p>
      </div>
      {loading ? (
        <div className="h-[310px] flex items-center justify-center text-sm font-semibold text-gray-400">
          Loading chart data...
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[400px]">
            <Chart options={options} series={series} type="bar" height={310} />
          </div>
        </div>
      )}
    </div>
  );
};
