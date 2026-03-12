// Basic ArcLayer creation with width scaled by value.
// Renders static arcs between source and target positions.

import { ArcLayer } from "@deck.gl/layers";
import type { FlowData } from "./flow-data";

export function createArcLayer(flows: FlowData[]) {
  return new ArcLayer<FlowData>({
    id: "flows",
    data: flows,
    getSourcePosition: (d) => d.source,
    getTargetPosition: (d) => d.target,
    getSourceColor: [0, 128, 255],
    getTargetColor: [255, 128, 0],
    getWidth: (d) => Math.sqrt(d.value) / 5,
    widthUnits: "pixels",
    pickable: true,
  });
}
