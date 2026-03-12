// Combined push + overlay layout: push sidebar with overlay elements on the map.
// Overlay elements live inside the map container, so they automatically avoid the push sidebar.
const SIDEBAR_WIDTH = "360px";
const BOTTOM_BAR_HEIGHT = "80px";

<Flex h="100vh">
  {/* Push sidebar */}
  <Box w={{ base: "100%", md: SIDEBAR_WIDTH }} /* ... */ >
    {/* Sidebar content */}
  </Box>

  {/* Map + overlays */}
  <Box flex={1} position="relative">
    <DeckGL /* ... */>
      <Map /* ... */ />
    </DeckGL>

    {/* Legend — offset from bottom bar */}
    <MapLegend
      position="bottom-left"
      layers={legendLayers}
      style={{ marginBottom: BOTTOM_BAR_HEIGHT }}
    />

    {/* Bottom bar */}
    <AnimationTimeline /* ... */ position="bottom" />
  </Box>
</Flex>
