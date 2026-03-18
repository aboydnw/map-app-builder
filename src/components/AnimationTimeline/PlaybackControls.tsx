import { Box, Flex } from "@chakra-ui/react";

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
    <Flex alignItems="center" gap={1} flexShrink={0}>
      {onStepBack ? (
        <Box
          as="button"
          onClick={onStepBack}
          {...({ disabled: disableBack } as object)}
          w="22px"
          h="22px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="4px"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          fontSize="10px"
          cursor={disableBack ? "not-allowed" : "pointer"}
          opacity={disableBack ? 0.4 : 1}
          aria-label="Step back"
          _dark={{ bg: "gray.700", borderColor: "gray.600", color: "gray.100" }}
        >
          ◀
        </Box>
      ) : null}

      <Box
        as="button"
        onClick={() => onPlayingChange(!isPlaying)}
        bg="blue.500"
        color="white"
        borderRadius="50%"
        w="28px"
        h="28px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        cursor="pointer"
        flexShrink={0}
        fontSize="12px"
        border="none"
        aria-label={isPlaying ? "Pause" : "Play"}
        _dark={{ bg: "blue.400" }}
      >
        {isPlaying ? "⏸" : "▶"}
      </Box>

      {onStepForward ? (
        <Box
          as="button"
          onClick={onStepForward}
          {...({ disabled: disableForward } as object)}
          w="22px"
          h="22px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius="4px"
          border="1px solid"
          borderColor="gray.200"
          bg="white"
          fontSize="10px"
          cursor={disableForward ? "not-allowed" : "pointer"}
          opacity={disableForward ? 0.4 : 1}
          aria-label="Step forward"
          _dark={{ bg: "gray.700", borderColor: "gray.600", color: "gray.100" }}
        >
          ▶
        </Box>
      ) : null}
    </Flex>
  );
}
