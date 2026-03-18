import { useRef } from "react";
import { Box, Flex } from "@chakra-ui/react";
import { useAnimationExport } from "../../hooks/useAnimationExport";
import { ExportButton } from "./ExportButton";
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
  className,
  exportEnabled,
  canvasRef
}: AnimationTimelineProps) {
  const fallbackRef = useRef<HTMLCanvasElement>(null);
  const resolvedCanvasRef = canvasRef ?? fallbackRef;

  const { isExporting, startExport } = useAnimationExport({
    canvasRef: resolvedCanvasRef,
    totalFrames: timestamps.length,
    fps: speed * 2
  });

  if (timestamps.length === 0) return null;

  const totalFrames = timestamps.length;
  const currentTimestamp = timestamps[currentIndex];
  const defaultFormatter = (time: number | string) => {
    const d = new Date(time);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };
  const format = formatLabel ?? ((time: number | string) => defaultFormatter(time));

  const handleStepBack = () => onIndexChange(Math.max(0, currentIndex - 1));
  const handleStepForward = () => onIndexChange(Math.min(totalFrames - 1, currentIndex + 1));

  return (
    <Box
      position="absolute"
      {...(position === "bottom" ? { bottom: 4 } : { top: 4 })}
      left="50%"
      transform="translateX(-50%)"
      zIndex={10}
      className={className}
      role="region"
      aria-label="Animation timeline"
    >
      <Flex justify="center" mb={2}>
        <TimestampDisplay
          current={currentTimestamp ? format(currentTimestamp.time, currentIndex) : ""}
        />
      </Flex>

      <Box
        bg="white"
        borderRadius="12px"
        boxShadow="0 2px 12px rgba(0,0,0,0.12)"
        px={4}
        py={2.5}
        w="480px"
        maxW="calc(100vw - 32px)"
        _dark={{ bg: "gray.800", boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}
      >
        {histogram && histogram.length > 0 ? (
          <Box mb={2}>
            <Histogram bins={histogram} />
          </Box>
        ) : null}

        <Flex align="center" gap={2.5}>
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayingChange={onPlayingChange}
            onStepBack={showStepControls ? handleStepBack : undefined}
            onStepForward={showStepControls ? handleStepForward : undefined}
            disableBack={currentIndex === 0}
            disableForward={currentIndex === totalFrames - 1}
          />

          <Box flex={1}>
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

          {showSpeedControl && onSpeedChange ? (
            <SpeedControl speed={speed} onSpeedChange={onSpeedChange} options={speedOptions} />
          ) : null}

          {exportEnabled ? (
            <>
              <Box w="1px" h="20px" bg="gray.200" flexShrink={0} _dark={{ bg: "gray.600" }} />
              <ExportButton onExport={() => startExport()} isExporting={isExporting} />
            </>
          ) : null}
        </Flex>
      </Box>
    </Box>
  );
}
