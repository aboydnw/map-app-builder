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

const rangeInputStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  height: "24px",
  width: "100%",
  cursor: "pointer",
  appearance: "none",
  background: "transparent",
  margin: 0,
  padding: 0
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
      <Box position="relative" h="24px">
        <Box position="absolute" top="10px" h="4px" w="full" rounded="full" bg="gray.200" _dark={{ bg: "gray.600" }} />
        <Box
          position="absolute"
          top="10px"
          h="4px"
          rounded="full"
          bg="blue.500"
          style={{
            left: `${max === 0 ? 0 : (windowStart / max) * 100}%`,
            width: `${max === 0 ? 0 : ((windowEnd - windowStart) / max) * 100}%`
          }}
        />
        <input
          type="range"
          min={0}
          max={max}
          value={windowStart}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (next < windowEnd) onWindowChange(next, windowEnd);
          }}
          style={rangeInputStyle}
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
          style={rangeInputStyle}
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
    <Box position="relative" h="24px">
      <Box position="absolute" top="10px" h="4px" w="full" rounded="full" bg="gray.200" _dark={{ bg: "gray.600" }} />
      <Box
        position="absolute"
        top="10px"
        h="4px"
        rounded="full"
        bg="blue.500"
        style={{ width: `${max === 0 ? 0 : (currentIndex / max) * 100}%` }}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={currentIndex}
        onChange={(e) => onIndexChange(Number(e.target.value))}
        style={rangeInputStyle}
        aria-label="Current timestamp"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={currentIndex}
        aria-valuetext={currentTimestamp ? formatLabel(currentTimestamp.time, currentIndex) : ""}
      />
    </Box>
  );
}
