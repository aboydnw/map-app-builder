import { Box, Flex } from "@chakra-ui/react";
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
    <Box
      position="absolute"
      left={0}
      right={0}
      {...(position === "bottom" ? { bottom: 0 } : { top: 0 })}
      zIndex={10}
      borderTopWidth="1px"
      borderColor="gray.200"
      bg="rgba(255,255,255,0.9)"
      backdropFilter="blur(4px)"
      className={className}
      role="region"
      aria-label="Animation timeline"
      _dark={{ bg: "rgba(30,30,30,0.95)", borderColor: "gray.700" }}
    >
      {histogram && histogram.length > 0 ? (
        <Box borderBottomWidth="1px" borderColor="gray.200" px={3} pt={2} pb={1} _dark={{ borderColor: "gray.700" }}>
          <Histogram bins={histogram} />
        </Box>
      ) : null}

      <Box px={3} pt={2} pb={1}>
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
      </Box>

      <Flex
        alignItems="center"
        justifyContent="space-between"
        gap={2}
        borderTopWidth="1px"
        borderColor="gray.200"
        px={3}
        py={2}
        _dark={{ borderColor: "gray.700" }}
      >
        <Flex alignItems="center" gap={2}>
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
        </Flex>
        <Box>
          <TimestampDisplay
            current={currentTimestamp ? format(currentTimestamp.time, currentIndex) : ""}
            start={start ? format(start.time, 0) : ""}
            end={end ? format(end.time, totalFrames - 1) : ""}
          />
        </Box>
      </Flex>
    </Box>
  );
}
