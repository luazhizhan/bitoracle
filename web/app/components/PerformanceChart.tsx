"use client";

import Chart from "react-apexcharts";
import data from "./assets/performance.json";

export default function PerformanceChart() {
  const usdFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  const options = {
    theme: {
      mode: "light",
    },
    chart: {
      type: "line",
      zoom: {
        enabled: false,
      },
      toolbar: {
        show: false, // This line hides the chart toolbar/options
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: 3,
    },
    grid: {
      row: {
        colors: ["#f3f3f3", "transparent"],
        opacity: 0.5,
      },
    },
    xaxis: {
      type: "datetime",
      title: {
        text: "Date",
        offsetY: 10,
      },
      labels: {
        style: {
          fontSize: "1em",
        },
        offsetY: -1,
      },
    },
    yaxis: {
      title: {
        text: "USD",
      },
      tickAmount: 6,
      labels: {
        formatter: function (value: number) {
          return usdFormatter.format(value);
        },
        style: {
          fontSize: "1em",
        },
      },
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: function (value: number) {
          return usdFormatter.format(value);
        },
      },
    },
    legend: {
      position: "top",
    },
    annotations: {
      yaxis: [
        {
          y: data.buyAndHold[data.buyAndHold.length - 1][1],
          borderColor: "#5c5c5c",
          label: {
            borderColor: "#5c5c5c",
            style: {
              color: "#fff",
              background: "#5c5c5c",
              fontSize: "1.2em",
            },
            text: `Buy and Hold: ${usdFormatter.format(
              data.buyAndHold[data.buyAndHold.length - 1][1]
            )}`,
          },
        },
        {
          y: data.model[data.model.length - 1][1],
          borderColor: "#51A2FF",
          label: {
            borderColor: "#51A2FF",
            style: {
              color: "#fff",
              background: "#51A2FF",
              fontSize: "1.2em",
            },
            text: `AI Model: ${usdFormatter.format(
              data.model[data.model.length - 1][1]
            )}`,
          },
        },
      ],
    },
  } as ApexCharts.ApexOptions;

  return (
    <Chart
      options={options}
      series={[
        {
          name: "Buy and Hold",
          data: data.buyAndHold,
          color: "#5c5c5c",
        },
        {
          name: "AI Model",
          data: data.model,
          color: "#51A2FF",
        },
      ]}
      type="line"
      height="500"
      width="100%"
    />
  );
}
