// Animated ArcLayer using useAnimationClock and getTilt for visual motion.
// The tilt value rotates the arc each frame, creating a traveling effect.

import { useMemo } from "react";
import { ArcLayer } from "@deck.gl/layers";
import { useAnimationClock } from "@maptool/core";
import type { FlowData } from "./flow-data";

const TOTAL_FRAMES = 60;

export function useAnimatedArcLayer(flows: FlowData[]) {
  const clock = useAnimationClock({ totalFrames: TOTAL_FRAMES, fps: 10, loop: true });

  const layer = useMemo(
    () =>
      new ArcLayer<FlowData>({
        id: "flows",
        data: flows,
        getSourcePosition: (d) => d.source,
        getTargetPosition: (d) => d.target,
        getSourceColor: [0, 128, 255],
        getTargetColor: [255, 128, 0],
        getWidth: (d) => Math.sqrt(d.value) / 5,
        widthUnits: "pixels",
        getHeight: 0.5,
        getTilt: clock.currentIndex * 6,
        pickable: true,
        updateTriggers: {
          getTilt: clock.currentIndex,
        },
      }),
    [flows, clock.currentIndex]
  );

  return { layer, clock };
}
