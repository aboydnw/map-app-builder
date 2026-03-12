// Overlay panel layout: panels float over the map with absolute positioning.
// Uses shared constants to prevent overlapping between adjacent panels.
const BOTTOM_BAR_HEIGHT = "80px";

<Box flex={1} position="relative">
  <DeckGL /* ... */ >
    <Map /* ... */ />
  </DeckGL>

  {/* Right overlay panel — partial height */}
  <Box
    position="absolute"
    top={4}
    right={4}
    bottom={BOTTOM_BAR_HEIGHT}
    w="320px"
    bg="rgba(255, 255, 255, 0.92)"
    backdropFilter="blur(8px)"
    borderRadius="lg"
    boxShadow="lg"
    overflowY="auto"
    zIndex={10}
    p={4}
  >
    {/* Panel content */}
  </Box>

  {/* Bottom overlay bar — spans full width, avoids right panel */}
  <Box
    position="absolute"
    bottom={0}
    left={0}
    right={0}
    h={BOTTOM_BAR_HEIGHT}
    bg="rgba(255, 255, 255, 0.92)"
    backdropFilter="blur(8px)"
    zIndex={10}
    px={4}
    py={2}
  >
    {/* Bottom bar content (e.g. AnimationTimeline) */}
  </Box>
</Box>
