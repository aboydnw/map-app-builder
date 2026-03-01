import { Button, Flex } from "@chakra-ui/react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  disableBack?: boolean;
  disableForward?: boolean;
}

export function PlaybackControls({
  isPlaying,
  onPlayingChange,
  onStepBack,
  onStepForward,
  disableBack,
  disableForward
}: PlaybackControlsProps) {
  return (
    <Flex alignItems="center" gap={1}>
      {onStepBack ? (
        <Button
          variant="outline"
          size="xs"
          onClick={onStepBack}
          disabled={disableBack}
          aria-label="Step back"
        >
          ◀
        </Button>
      ) : null}

      <Button
        colorPalette="blue"
        variant="solid"
        size="xs"
        onClick={() => onPlayingChange(!isPlaying)}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "Pause" : "Play"}
      </Button>

      {onStepForward ? (
        <Button
          variant="outline"
          size="xs"
          onClick={onStepForward}
          disabled={disableForward}
          aria-label="Step forward"
        >
          ▶
        </Button>
      ) : null}
    </Flex>
  );
}
