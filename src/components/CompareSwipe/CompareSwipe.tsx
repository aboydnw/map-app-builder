import DeckGL from "@deck.gl/react";
import type { Layer } from "@deck.gl/core";
import { Box, Text } from "@chakra-ui/react";
import { useSwipePosition } from "./useSwipePosition";

export interface CompareSwipeProps {
  leftLayers: Layer[];
  rightLayers: Layer[];
  leftLabel?: string;
  rightLabel?: string;
  initialPosition?: number;
  viewState: Record<string, unknown>;
  onViewStateChange: (params: { viewState: Record<string, unknown> }) => void;
  mapStyle?: string;
  width?: string | number;
  height?: string | number;
}

/** Side-by-side map comparison with a draggable swipe divider. */
export function CompareSwipe({
  leftLayers,
  rightLayers,
  leftLabel,
  rightLabel,
  initialPosition = 50,
  viewState,
  onViewStateChange,
  mapStyle,
  width = "100%",
  height = "100%"
}: CompareSwipeProps) {
  const { position, isDragging, handlers } = useSwipePosition(initialPosition);

  return (
    <Box
      position="relative"
      width={width}
      height={height}
      overflow="hidden"
      {...handlers}
    >
      <Box
        position="absolute"
        inset={0}
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <DeckGL
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          layers={leftLayers}
          controller={true}
          style={{ position: "absolute", inset: "0" }}
        />
      </Box>

      <Box
        position="absolute"
        inset={0}
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <DeckGL
          viewState={viewState}
          onViewStateChange={onViewStateChange}
          layers={rightLayers}
          controller={true}
          style={{ position: "absolute", inset: "0" }}
        />
      </Box>

      <Box
        position="absolute"
        top={0}
        bottom={0}
        left={`${position}%`}
        transform="translateX(-50%)"
        width="4px"
        bg="white"
        cursor="ew-resize"
        zIndex={10}
        boxShadow="0 0 4px rgba(0,0,0,0.5)"
        {...handlers}
      >
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="28px"
          height="28px"
          borderRadius="full"
          bg="white"
          boxShadow="md"
          display="flex"
          alignItems="center"
          justifyContent="center"
          cursor="ew-resize"
        >
          <Text fontSize="xs" color="gray.600" userSelect="none">
            ⇔
          </Text>
        </Box>
      </Box>

      {leftLabel && (
        <Box
          position="absolute"
          top={3}
          left={3}
          bg="blackAlpha.700"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="sm"
          zIndex={10}
          pointerEvents="none"
        >
          {leftLabel}
        </Box>
      )}
      {rightLabel && (
        <Box
          position="absolute"
          top={3}
          right={3}
          bg="blackAlpha.700"
          color="white"
          px={2}
          py={1}
          borderRadius="md"
          fontSize="sm"
          zIndex={10}
          pointerEvents="none"
        >
          {rightLabel}
        </Box>
      )}
    </Box>
  );
}
