import { Histogram } from "./Histogram";
import { PlaybackControls } from "./PlaybackControls";
import { SpeedControl } from "./SpeedControl";
import { TimeSlider } from "./TimeSlider";
import { TimestampDisplay } from "./TimestampDisplay";
import type { AnimationTimelineProps } from "./types";

const DEFAULT_SPEED_OPTIONS = [
  { label: "0.5x", value: 0.5 },
  { label: "1x", value: 1 },
  { label: "2x", value: 2 },
  { label: "4x", value: 4 }
];

export function AnimationTimeline({
  timestamps,
  mode = "timestamp",
  currentIndex,
  onIndexChange,
  windowStart,
  windowEnd,
  onWindowChange,
  isPlaying,
  onPlayingChange,
  speed = 1,
  onSpeedChange,
  speedOptions = DEFAULT_SPEED_OPTIONS,
  formatLabel,
  showStepControls = true,
  showSpeedControl = true,
  histogram,
  position = "bottom",
  className
}: AnimationTimelineProps) {
  if (timestamps.length === 0) return null;

  const totalFrames = timestamps.length;
  const currentTimestamp = timestamps[currentIndex];
  const defaultFormatter = (time: number | string) => {
    const d = new Date(time);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };
  const format = formatLabel ?? ((time: number | string) => defaultFormatter(time));
  const start = timestamps[0];
  const end = timestamps[totalFrames - 1];

  const handleStepBack = () => onIndexChange(Math.max(0, currentIndex - 1));
  const handleStepForward = () => onIndexChange(Math.min(totalFrames - 1, currentIndex + 1));

  return (
    <div
      className={`mt-absolute mt-left-0 mt-right-0 ${position === "bottom" ? "mt-bottom-0" : "mt-top-0"} mt-z-10 mt-border-t mt-border-[var(--mt-border)] mt-bg-[var(--mt-bg)] mt-backdrop-blur-sm ${className ?? ""}`}
      role="region"
      aria-label="Animation timeline"
    >
      {histogram && histogram.length > 0 ? (
        <div className="mt-border-b mt-border-[var(--mt-border)] mt-px-3 mt-pt-2 mt-pb-1">
          <Histogram bins={histogram} />
        </div>
      ) : null}

      <div className="mt-px-3 mt-pt-2 mt-pb-1">
        <TimeSlider
          totalFrames={totalFrames}
          currentIndex={currentIndex}
          onIndexChange={onIndexChange}
          mode={mode}
          windowStart={windowStart}
          windowEnd={windowEnd}
          onWindowChange={onWindowChange}
          timestamps={timestamps}
          formatLabel={(time, index) => format(time, index)}
        />
      </div>

      <div className="mt-flex mt-items-center mt-justify-between mt-gap-2 mt-border-t mt-border-[var(--mt-border)] mt-px-3 mt-py-2">
        <div className="mt-flex mt-items-center mt-gap-2">
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayingChange={onPlayingChange}
            onStepBack={showStepControls ? handleStepBack : undefined}
            onStepForward={showStepControls ? handleStepForward : undefined}
            disableBack={currentIndex === 0}
            disableForward={currentIndex === totalFrames - 1}
          />
          {showSpeedControl && onSpeedChange ? (
            <SpeedControl speed={speed} onSpeedChange={onSpeedChange} options={speedOptions} />
          ) : null}
        </div>
        <div>
          <TimestampDisplay
            current={currentTimestamp ? format(currentTimestamp.time, currentIndex) : ""}
            start={start ? format(start.time, 0) : ""}
            end={end ? format(end.time, totalFrames - 1) : ""}
          />
        </div>
      </div>
    </div>
  );
}
