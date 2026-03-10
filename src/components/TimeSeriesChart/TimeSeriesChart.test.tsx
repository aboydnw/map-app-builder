import { describe, it, expect } from "vitest";
import { renderWithProvider } from "../../test-utils";
import { TimeSeriesChart } from "./TimeSeriesChart";
import type { TimeSeriesPoint } from "./TimeSeriesChart";

const SAMPLE_DATA: TimeSeriesPoint[] = [
  { time: "2024-01-01", value: 10 },
  { time: "2024-02-01", value: 20 },
  { time: "2024-03-01", value: 15 }
];

describe("TimeSeriesChart", () => {
  it("renders without crashing", () => {
    const { container } = renderWithProvider(
      <TimeSeriesChart data={[]} />
    );
    expect(container).toBeTruthy();
  });

  it("renders with data", () => {
    const { container } = renderWithProvider(
      <TimeSeriesChart data={SAMPLE_DATA} />
    );
    expect(container).toBeTruthy();
  });

  it("renders multiple series", () => {
    const multiData = SAMPLE_DATA.map((p) => ({
      ...p,
      temperature: p.value,
      humidity: p.value * 2
    }));

    const { container } = renderWithProvider(
      <TimeSeriesChart
        data={multiData as unknown as TimeSeriesPoint[]}
        series={[
          { dataKey: "temperature", color: "#ff0000", name: "Temperature" },
          { dataKey: "humidity", color: "#0000ff", name: "Humidity" }
        ]}
      />
    );
    expect(container).toBeTruthy();
  });
});
