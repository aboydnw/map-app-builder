import { Box, Flex } from "@chakra-ui/react";
import type { SpeedOption } from "./types";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  options: SpeedOption[];
}

export function SpeedControl({ speed, onSpeedChange, options }: SpeedControlProps) {
  return (
    <Flex alignItems="center" gap="1px" flexShrink={0} role="radiogroup" aria-label="Playback speed">
      {options.map((opt) => (
        <Box
          key={opt.value}
          as="button"
          onClick={() => onSpeedChange(opt.value)}
          border="1px solid"
          borderColor={speed === opt.value ? "blue.500" : "gray.200"}
          bg={speed === opt.value ? "blue.50" : "white"}
          borderRadius="3px"
          px="5px"
          py="2px"
          fontSize="9px"
          color={speed === opt.value ? "blue.500" : "gray.500"}
          fontWeight={speed === opt.value ? 600 : 400}
          cursor="pointer"
          role="radio"
          aria-checked={speed === opt.value}
          aria-label={`Speed ${opt.label}`}
          _dark={{
            bg: speed === opt.value ? "blue.900" : "gray.700",
            borderColor: speed === opt.value ? "blue.400" : "gray.600",
            color: speed === opt.value ? "blue.300" : "gray.400"
          }}
        >
          {opt.label}
        </Box>
      ))}
    </Flex>
  );
}
