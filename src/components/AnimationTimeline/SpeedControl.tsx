import { Button, Flex } from "@chakra-ui/react";
import type { SpeedOption } from "./types";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  options: SpeedOption[];
}

export function SpeedControl({ speed, onSpeedChange, options }: SpeedControlProps) {
  return (
    <Flex alignItems="center" gap={1} role="radiogroup" aria-label="Playback speed">
      {options.map((opt) => (
        <Button
          key={opt.value}
          size="xs"
          colorPalette="blue"
          variant={speed === opt.value ? "subtle" : "outline"}
          fontSize="10px"
          onClick={() => onSpeedChange(opt.value)}
          role="radio"
          aria-checked={speed === opt.value}
          aria-label={`Speed ${opt.label}`}
        >
          {opt.label}
        </Button>
      ))}
    </Flex>
  );
}
