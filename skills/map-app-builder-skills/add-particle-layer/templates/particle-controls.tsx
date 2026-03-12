// Slider controls for particle density and speed.
// Place as a sibling of the DeckGL/Map component inside a relative container.

import { useState } from "react";
import { Box, Slider, Text } from "@chakra-ui/react";

interface ParticleControlsProps {
  numParticles: number;
  speed: number;
  onNumParticlesChange: (value: number) => void;
  onSpeedChange: (value: number) => void;
}

export function ParticleControls({
  numParticles,
  speed,
  onNumParticlesChange,
  onSpeedChange,
}: ParticleControlsProps) {
  return (
    <Box
      position="absolute"
      top={4}
      right={4}
      bg="white"
      p={4}
      borderRadius="md"
      boxShadow="md"
      w="200px"
    >
      <Text fontSize="sm" mb={1}>
        Particles: {numParticles}
      </Text>
      <Slider
        value={[numParticles]}
        min={1000}
        max={20000}
        step={1000}
        onValueChange={(details) => onNumParticlesChange(details.value[0])}
      />
      <Text fontSize="sm" mt={3} mb={1}>
        Speed: {speed}x
      </Text>
      <Slider
        value={[speed]}
        min={0.5}
        max={10}
        step={0.5}
        onValueChange={(details) => onSpeedChange(details.value[0])}
      />
    </Box>
  );
}
