// Alternative animation using TripsLayer for smooth trail effects.
// Provides fade-out trails along arc paths.

import { TripsLayer } from "@deck.gl/geo-layers";
import type { AnimationClockState } from "@maptool/core";
import type { FlowData } from "./flow-data";

const TOTAL_FRAMES = 120;

export function createTripsLayer(flows: FlowData[], clock: AnimationClockState) {
  return new TripsLayer<FlowData>({
    id: "flow-trails",
    data: flows,
    getPath: (d) => [d.source, d.target],
    getTimestamps: () => [0, 1],
    getColor: [0, 180, 255],
    getWidth: (d) => Math.sqrt(d.value) / 5,
    widthUnits: "pixels",
    currentTime: (clock.currentIndex / TOTAL_FRAMES) % 1,
    trailLength: 0.4,
    fadeTrail: true,
  });
}
