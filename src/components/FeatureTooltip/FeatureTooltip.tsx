import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";

export interface FeatureTooltipProps {
  x: number;
  y: number;
  children: ReactNode;
  offsetX?: number;
  offsetY?: number;
}

const EDGE_PADDING = 12;

export function FeatureTooltip({ x, y, children, offsetX = 12, offsetY = -12 }: FeatureTooltipProps) {
  const left = typeof window !== "undefined" && x + offsetX + 240 > window.innerWidth ? x - offsetX - 240 : x + offsetX;
  const top = typeof window !== "undefined" && y + offsetY < 0 ? y + EDGE_PADDING : y + offsetY;

  return (
    <Box
      position="fixed"
      left={`${left}px`}
      top={`${top}px`}
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={3}
      fontSize="sm"
      pointerEvents="none"
      zIndex={1000}
      maxW="240px"
    >
      {children}
    </Box>
  );
}
