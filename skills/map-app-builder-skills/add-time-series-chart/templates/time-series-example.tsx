// Complete example showing TimeSeriesChart in single-series and multi-series modes,
// embedded inside a DetailsPanel.

import { useState } from "react";
import { DetailsPanel, TimeSeriesChart } from "@maptool/core";
import type { TimeSeriesPoint, SeriesConfig } from "@maptool/core";

// --- Single series ---

const temperatureData: TimeSeriesPoint[] = [
  { time: new Date("2024-01-15"), value: 12.3 },
  { time: new Date("2024-02-15"), value: 14.1 },
  { time: new Date("2024-03-15"), value: 18.7 },
  { time: new Date("2024-04-15"), value: 22.4 },
  { time: new Date("2024-05-15"), value: 26.8 },
];

function SingleSeriesExample() {
  return (
    <TimeSeriesChart
      data={temperatureData}
      xLabel="Date"
      yLabel="Temperature (C)"
      color="#e53e3e"
      height={200}
    />
  );
}

// --- Multi-series ---

const airQualityData: TimeSeriesPoint[] = [
  { time: "2024-01-15", value: 0, no2: 45, pm25: 12, o3: 38 },
  { time: "2024-02-15", value: 0, no2: 52, pm25: 15, o3: 35 },
  { time: "2024-03-15", value: 0, no2: 38, pm25: 10, o3: 42 },
] as any;

const series: SeriesConfig[] = [
  { dataKey: "no2", color: "#3182ce", name: "NO2" },
  { dataKey: "pm25", color: "#e53e3e", name: "PM2.5" },
  { dataKey: "o3", color: "#38a169", name: "Ozone" },
];

function MultiSeriesExample() {
  return (
    <TimeSeriesChart
      data={airQualityData}
      series={series}
      xLabel="Date"
      yLabel="Concentration (ppb)"
      height={250}
    />
  );
}

// --- Embedded in DetailsPanel ---

interface Station {
  name: string;
  timeseries: TimeSeriesPoint[];
}

function ChartInPanel({ station, onClose }: { station: Station | null; onClose: () => void }) {
  return (
    <DetailsPanel title={station?.name} isOpen={!!station} onClose={onClose}>
      {station && (
        <TimeSeriesChart
          data={station.timeseries}
          xLabel="Date"
          yLabel="Value"
          height={200}
        />
      )}
    </DetailsPanel>
  );
}

export { SingleSeriesExample, MultiSeriesExample, ChartInPanel };
