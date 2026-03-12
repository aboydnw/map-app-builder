// Full animation setup: clock, index clamping, layer binding, and timeline UI.
import { useEffect, useMemo } from "react";
import {
  useAnimationClock,
  useTitiler,
  createCOGLayer,
  AnimationTimeline,
} from "@maptool/core";
import type { Timestep } from "@maptool/core";

const timestamps: Timestep[] = [
  /* your timestamps here */
];
const cogUrlsByIndex: Record<number, string> = {
  /* index → COG URL mapping */
};

function AnimatedMap() {
  const clock = useAnimationClock({
    totalFrames: timestamps.length,
    fps: 2,
    loop: true,
    initialSpeed: 1,
  });

  useEffect(() => {
    if (clock.currentIndex >= timestamps.length && timestamps.length > 0) {
      clock.setIndex(0);
    }
  }, [timestamps.length, clock.currentIndex, clock.setIndex]);

  const currentCogUrl = cogUrlsByIndex[clock.currentIndex] ?? "";

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: currentCogUrl,
    colormap: "viridis",
  });

  const layers = useMemo(
    () =>
      titiler.tileUrl
        ? [createCOGLayer({ id: "animated-cog", tileUrl: titiler.tileUrl })]
        : [],
    [titiler.tileUrl]
  );

  return (
    <AnimationTimeline
      timestamps={timestamps}
      currentIndex={clock.currentIndex}
      onIndexChange={clock.setIndex}
      isPlaying={clock.isPlaying}
      onPlayingChange={clock.setPlaying}
      speed={clock.speed}
      onSpeedChange={clock.setSpeed}
      formatLabel={(time) => {
        const d = new Date(time);
        return d.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
      }}
      showStepControls
      showSpeedControl
    />
  );
}
