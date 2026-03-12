// Category definitions and hex-to-RGB color mapping for arc layers.
// Used with getSourceColor/getTargetColor accessors on ArcLayer.

import { ArcLayer } from "@deck.gl/layers";
import type { CategoryEntry } from "@maptool/core";
import type { FlowData } from "./flow-data";

export const categories: CategoryEntry[] = [
  { value: "grain", color: "#4CAF50", label: "Grain" },
  { value: "tech", color: "#2196F3", label: "Technology" },
  { value: "manufacturing", color: "#FF9800", label: "Manufacturing" },
];

const colorMap = new Map(categories.map((c) => {
  const n = parseInt(c.color.replace("#", ""), 16);
  return [c.value, [(n >> 16) & 255, (n >> 8) & 255, n & 255] as [number, number, number]];
}));

export function createCategorizedArcLayer(flows: FlowData[]) {
  return new ArcLayer<FlowData>({
    id: "flows",
    data: flows,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getSourceColor: (d) => colorMap.get(d.category!) ?? [200, 200, 200],
    getTargetColor: (d) => colorMap.get(d.category!) ?? [200, 200, 200],
    getWidth: (d) => Math.sqrt(d.value) / 5,
    widthUnits: "pixels",
    pickable: true,
  });
}
