import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export interface TimeSeriesPoint {
  time: Date | string;
  value: number;
  label?: string;
}

export interface SeriesConfig {
  dataKey: string;
  color: string;
  name?: string;
}

export interface TimeSeriesChartProps {
  data: TimeSeriesPoint[];
  series?: SeriesConfig[];
  xLabel?: string;
  yLabel?: string;
  color?: string;
  height?: number;
}

function formatDate(time: Date | string): string {
  const d = time instanceof Date ? time : new Date(time);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function prepareData(data: TimeSeriesPoint[]): Record<string, unknown>[] {
  return data.map((point) => ({
    ...point,
    time: point.label ?? formatDate(point.time)
  }));
}

const DEFAULT_COLOR = "#3182CE";
const AXIS_STYLE = { fontSize: 11, fill: "#718096" };

export function TimeSeriesChart({
  data,
  series,
  xLabel,
  yLabel,
  color = DEFAULT_COLOR,
  height = 200
}: TimeSeriesChartProps) {
  const chartData = prepareData(data);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData} accessibilityLayer>
        <XAxis
          dataKey="time"
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          label={xLabel ? { value: xLabel, position: "insideBottom", offset: -5, style: AXIS_STYLE } : undefined}
        />
        <YAxis
          tick={AXIS_STYLE}
          tickLine={false}
          axisLine={false}
          width={40}
          label={yLabel ? { value: yLabel, angle: -90, position: "insideLeft", style: AXIS_STYLE } : undefined}
        />
        <Tooltip />
        {series ? (
          series.map((s) => (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              stroke={s.color}
              name={s.name ?? s.dataKey}
              dot={false}
              strokeWidth={2}
            />
          ))
        ) : (
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            dot={false}
            strokeWidth={2}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
