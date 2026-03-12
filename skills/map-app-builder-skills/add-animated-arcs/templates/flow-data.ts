// Flow data interface and sample data for arc visualizations.
// Replace sample data with your own source/target coordinate pairs.

export interface FlowData {
  source: [number, number]; // [lng, lat]
  target: [number, number];
  value: number;
  category?: string;
}

export const flows: FlowData[] = [
  { source: [-95.7, 37.1], target: [2.3, 48.9], value: 1500, category: "grain" },
  { source: [-95.7, 37.1], target: [139.7, 35.7], value: 800, category: "tech" },
  { source: [116.4, 39.9], target: [-95.7, 37.1], value: 2200, category: "manufacturing" },
];
