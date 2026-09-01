"use client";

import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,

  loading: () => <div className="loading-spinner" />,
});

interface RadialChartProps {
  value: number;
  color?: string;
  size?: number;
}

export default function RadialChart({
  value,
  color = "#465FFF",
  size = 64,
}: RadialChartProps) {
  const options: ApexOptions = {
    colors: [color],

    chart: {
      type: "radialBar",
      height: size,
      width: size,
      fontFamily: "Arial, sans-serif",
    },

    plotOptions: {
      radialBar: {
        startAngle: 0,
        endAngle: 360,

        hollow: {
          size: "50%",
        },

        track: {
          background: "#374151",
          strokeWidth: "100%",
        },

        dataLabels: {
          name: {
            show: false,
          },

          value: {
            show: true,
            fontSize: "14px",
            fontWeight: 600,
            color: "#9CA3AF",
            offsetY: 5,
            formatter: (val) => `${Math.round(val)}%`,
          },
        },
      },
    },

    fill: {
      type: "solid",
    },

    stroke: {
      lineCap: "round",
    },
  };

  return (
    <ReactApexChart
      options={options}
      series={[value]}
      type="radialBar"
      width={size}
      height={size}
    />
  );
}
