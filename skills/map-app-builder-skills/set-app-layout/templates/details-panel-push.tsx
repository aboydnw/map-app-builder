// DetailsPanel with mode="push": a pre-styled sidebar component that pushes the map.
// Use mode="overlay" instead for floating panels.
import { DetailsPanel } from "@maptool/core";

<Flex h="100vh">
  <DetailsPanel mode="push" width={SIDEBAR_WIDTH}>
    {/* Sidebar content */}
  </DetailsPanel>

  <Box flex={1} position="relative">
    <DeckGL /* ... */>
      <Map /* ... */ />
    </DeckGL>
  </Box>
</Flex>
