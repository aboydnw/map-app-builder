// Push panel layout: sidebar takes space from the map via flex layout.
// The map resizes to fill remaining space when the sidebar toggles.
import { useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const SIDEBAR_WIDTH = "360px";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Flex h="100vh">
      {sidebarOpen && (
        <Box
          w={{ base: "100%", md: SIDEBAR_WIDTH }}
          minW="280px"
          bg="white"
          borderRight="1px solid"
          borderColor="gray.200"
          overflowY="auto"
          p={4}
        >
          {/* Sidebar content goes here */}
        </Box>
      )}

      <Box flex={1} position="relative">
        <IconButton
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          position="absolute"
          top={3}
          left={3}
          zIndex={1}
          onClick={() => setSidebarOpen((v) => !v)}
          size="sm"
        >
          {sidebarOpen ? "←" : "→"}
        </IconButton>

        <DeckGL
          viewState={viewState}
          onViewStateChange={({ viewState: vs }) => setViewState(vs)}
          layers={layers}
          controller
        >
          <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
        </DeckGL>
      </Box>
    </Flex>
  );
}
