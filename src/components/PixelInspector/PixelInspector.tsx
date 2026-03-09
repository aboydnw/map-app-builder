import { Box, Spinner, Text } from "@chakra-ui/react";
import type { PointValue } from "../../utils/titiler";

export type InspectorPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

export interface PixelInspectorProps {
  value: PointValue | null;
  isLoading?: boolean;
  position?: InspectorPosition;
  formatValue?: (key: string, val: number) => string;
}

const POSITION_STYLES: Record<InspectorPosition, Record<string, number>> = {
  "top-right": { top: 3, right: 3 },
  "top-left": { top: 3, left: 3 },
  "bottom-right": { bottom: 3, right: 3 },
  "bottom-left": { bottom: 3, left: 3 }
};

/** Floating panel that displays raster band values at an inspected point. */
export function PixelInspector({
  value,
  isLoading = false,
  position = "top-right",
  formatValue
}: PixelInspectorProps) {
  if (!value && !isLoading) return null;

  const posStyles = POSITION_STYLES[position];
  const fmt = formatValue ?? ((_key: string, val: number) => String(val));

  return (
    <Box
      position="absolute"
      {...posStyles}
      bg="white"
      borderRadius="md"
      boxShadow="md"
      p={3}
      minW="160px"
      zIndex={1000}
      fontSize="sm"
    >
      {isLoading && (
        <Box display="flex" alignItems="center" gap={2}>
          <Spinner size="sm" />
          <Text color="gray.500">Loading...</Text>
        </Box>
      )}
      {value && !isLoading && (
        <>
          <Text color="gray.500" mb={1}>
            {value.coordinates[1].toFixed(5)}, {value.coordinates[0].toFixed(5)}
          </Text>
          {Object.entries(value.values).map(([key, val]) => (
            <Box key={key} display="flex" justifyContent="space-between" gap={4}>
              <Text fontWeight="medium">{key}</Text>
              <Text fontFamily="mono">{fmt(key, val)}</Text>
            </Box>
          ))}
        </>
      )}
    </Box>
  );
}
