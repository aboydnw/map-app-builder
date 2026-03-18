import { Box } from "@chakra-ui/react";
import type { TimelineMode, Timestep } from "./types";

interface TimeSliderProps {
  totalFrames: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  mode: TimelineMode;
  windowStart?: number;
  windowEnd?: number;
  onWindowChange?: (start: number, end: number) => void;
  timestamps: Timestep[];
  formatLabel: (time: number | string, index: number) => string;
}

const rangeStyle: React.CSSProperties = {
  width: "100%",
  accentColor: "#3182CE",
  cursor: "pointer",
  margin: 0
};

export function TimeSlider({
  totalFrames,
  currentIndex,
  onIndexChange,
  mode,
  windowStart = 0,
  windowEnd = totalFrames - 1,
  onWindowChange,
  timestamps,
  formatLabel
}: TimeSliderProps) {
  const max = Math.max(totalFrames - 1, 0);
  const currentTimestamp = timestamps[currentIndex];

  if (mode === "window" && onWindowChange) {
    return (
      <Box position="relative" h="20px">
        <input
          type="range"
          min={0}
          max={max}
          value={windowStart}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (next < windowEnd) onWindowChange(next, windowEnd);
          }}
          style={{ ...rangeStyle, position: "absolute", top: 0, height: "20px", appearance: "none", background: "transparent" }}
          aria-label="Window start"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={windowStart}
          aria-valuetext={timestamps[windowStart] ? formatLabel(timestamps[windowStart].time, windowStart) : ""}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={windowEnd}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (next > windowStart) onWindowChange(windowStart, next);
          }}
          style={{ ...rangeStyle, position: "absolute", top: 0, height: "20px", appearance: "none", background: "transparent" }}
          aria-label="Window end"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={windowEnd}
          aria-valuetext={timestamps[windowEnd] ? formatLabel(timestamps[windowEnd].time, windowEnd) : ""}
        />
      </Box>
    );
  }

  return (
    <input
      type="range"
      min={0}
      max={max}
      value={currentIndex}
      onChange={(e) => onIndexChange(Number(e.target.value))}
      style={rangeStyle}
      aria-label="Current timestamp"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={currentIndex}
      aria-valuetext={currentTimestamp ? formatLabel(currentTimestamp.time, currentIndex) : ""}
    />
  );
}
