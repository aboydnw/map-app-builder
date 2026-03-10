# Skill: Add a Time Series Chart

## When to use
When you want to display temporal trends for map data — for example, showing temperature over time for a clicked location, NDVI changes across dates, or air quality readings. Built on recharts.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `npm install recharts` (peer dependency — TimeSeriesChart uses recharts' `ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`)

## Steps

### 1. Import the component

```tsx
import { TimeSeriesChart } from "@maptool/core";
import type { TimeSeriesPoint, SeriesConfig } from "@maptool/core";
```

### 2. Single series usage

For a single data series, pass an array of `TimeSeriesPoint` objects:

```tsx
const data: TimeSeriesPoint[] = [
  { time: new Date("2024-01-15"), value: 12.3 },
  { time: new Date("2024-02-15"), value: 14.1 },
  { time: new Date("2024-03-15"), value: 18.7 },
  { time: new Date("2024-04-15"), value: 22.4 },
  { time: new Date("2024-05-15"), value: 26.8 },
];

<TimeSeriesChart
  data={data}
  xLabel="Date"
  yLabel="Temperature (C)"
  color="#e53e3e"
  height={200}
/>
```

The `time` field accepts `Date` objects or ISO strings. Dates are formatted as "Mon DD" (e.g., "Jan 15") on the x-axis. Use the optional `label` field on a data point to override the x-axis label.

### 3. Multi-series usage

For multiple lines on the same chart, add extra keys to your data objects and define a `series` config:

```tsx
const data: TimeSeriesPoint[] = [
  { time: "2024-01-15", value: 0, no2: 45, pm25: 12, o3: 38 },
  { time: "2024-02-15", value: 0, no2: 52, pm25: 15, o3: 35 },
  { time: "2024-03-15", value: 0, no2: 38, pm25: 10, o3: 42 },
] as any; // extra keys beyond TimeSeriesPoint

const series: SeriesConfig[] = [
  { dataKey: "no2", color: "#3182ce", name: "NO2" },
  { dataKey: "pm25", color: "#e53e3e", name: "PM2.5" },
  { dataKey: "o3", color: "#38a169", name: "Ozone" },
];

<TimeSeriesChart
  data={data}
  series={series}
  xLabel="Date"
  yLabel="Concentration (ppb)"
  height={250}
/>
```

When `series` is provided, the `color` and `value` props are ignored — each series defines its own `dataKey` and `color`.

### 4. Embed inside a DetailsPanel

A common pattern is to show the chart in a side panel when a user clicks a feature:

```tsx
import { DetailsPanel, TimeSeriesChart } from "@maptool/core";

<DetailsPanel title={selectedStation?.name} isOpen={!!selectedStation} onClose={() => setSelectedStation(null)}>
  {selectedStation && (
    <TimeSeriesChart
      data={selectedStation.timeseries}
      xLabel="Date"
      yLabel="Value"
      height={200}
    />
  )}
</DetailsPanel>
```

### 5. Verify

Run `npm run dev` and confirm:
- [ ] The chart renders with correct axes and data points
- [ ] Hovering over the line shows a tooltip with the value
- [ ] For multi-series, each line has a distinct color and name in the tooltip
- [ ] The chart resizes responsively when its container changes width

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `TimeSeriesPoint[]` | required | Array of `{ time: Date \| string, value: number, label?: string }` |
| `series` | `SeriesConfig[]` | — | Multi-series config. Each entry: `{ dataKey: string, color: string, name?: string }` |
| `xLabel` | `string` | — | Label for the x-axis |
| `yLabel` | `string` | — | Label for the y-axis |
| `color` | `string` | `"#3182CE"` | Line color for single-series mode (ignored when `series` is set) |
| `height` | `number` | `200` | Chart height in pixels |

## Common mistakes
- **Missing recharts dependency** — `recharts` is a peer dependency. If not installed, you'll get a module resolution error at build time.
- **Passing `Date` objects that lose precision** — the chart formats dates with `toLocaleDateString`. If all your dates fall on the same day, labels will be identical. Use the `label` field to provide custom x-axis labels.
- **Multi-series `dataKey` not matching data** — the `dataKey` in each `SeriesConfig` must exactly match a key on your data objects. Mismatches result in flat lines at zero.
- **Setting `height` on the parent but not on the chart** — `ResponsiveContainer` needs an explicit `height` prop. It won't inherit height from a parent div.

## Reference files
- `src/components/TimeSeriesChart/TimeSeriesChart.tsx` — component source, `TimeSeriesChartProps`, `TimeSeriesPoint`, `SeriesConfig`
