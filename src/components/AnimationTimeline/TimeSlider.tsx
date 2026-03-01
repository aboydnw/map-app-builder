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
      <div className="mt-relative mt-h-6">
        <div className="mt-absolute mt-top-2.5 mt-h-1 mt-w-full mt-rounded-full mt-bg-[var(--mt-border)]" />
        <div
          className="mt-absolute mt-top-2.5 mt-h-1 mt-rounded-full mt-bg-[var(--mt-accent)]"
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
          className="mt-absolute mt-top-0 mt-h-6 mt-w-full mt-cursor-pointer mt-appearance-none mt-bg-transparent"
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
          className="mt-absolute mt-top-0 mt-h-6 mt-w-full mt-cursor-pointer mt-appearance-none mt-bg-transparent"
          aria-label="Window end"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={windowEnd}
          aria-valuetext={timestamps[windowEnd] ? formatLabel(timestamps[windowEnd].time, windowEnd) : ""}
        />
      </div>
    );
  }

  return (
    <div className="mt-relative mt-h-6">
      <div className="mt-absolute mt-top-2.5 mt-h-1 mt-w-full mt-rounded-full mt-bg-[var(--mt-border)]" />
      <div
        className="mt-absolute mt-top-2.5 mt-h-1 mt-rounded-full mt-bg-[var(--mt-accent)]"
        style={{ width: `${max === 0 ? 0 : (currentIndex / max) * 100}%` }}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={currentIndex}
        onChange={(e) => onIndexChange(Number(e.target.value))}
        className="mt-absolute mt-top-0 mt-h-6 mt-w-full mt-cursor-pointer mt-appearance-none mt-bg-transparent"
        aria-label="Current timestamp"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={currentIndex}
        aria-valuetext={currentTimestamp ? formatLabel(currentTimestamp.time, currentIndex) : ""}
      />
    </div>
  );
}
