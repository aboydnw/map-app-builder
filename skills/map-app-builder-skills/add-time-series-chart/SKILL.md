# Skill: Add a Time Series Chart

## When to use
When you want to display temporal trends for map data — for example, showing temperature over time for a clicked location, NDVI changes across dates, or air quality readings. Built on recharts.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `npm install recharts` (peer dependency — TimeSeriesChart uses recharts' `ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`)

## Template files

| File | Description |
|------|-------------|
| `templates/time-series-example.tsx` | Single-series, multi-series, and DetailsPanel-embedded chart patterns |

## Steps

### 1. Add a time series chart

See `templates/time-series-example.tsx` for all three usage patterns:

- **Single series** — pass `TimeSeriesPoint[]` with `time` and `value` fields. The `time` field accepts `Date` objects or ISO strings (formatted as "Mon DD" on the x-axis).
- **Multi-series** — add extra keys to data objects and pass a `SeriesConfig[]` array. When `series` is provided, the `color` and `value` props are ignored — each series defines its own `dataKey` and `color`.
- **Embedded in DetailsPanel** — show the chart in a side panel when a user clicks a feature.

### 2. Verify

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
