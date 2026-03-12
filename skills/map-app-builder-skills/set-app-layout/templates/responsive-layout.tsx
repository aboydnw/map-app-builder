// Responsive layout: push sidebar on desktop, Chakra Drawer on mobile.
// Uses useBreakpointValue to switch between layouts at the md breakpoint.
import { Box, Flex, IconButton, useBreakpointValue } from "@chakra-ui/react";
import { Drawer } from "@chakra-ui/react";
import { useState } from "react";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const sidebarContent = (
    <Box p={4}>
      {/* Sidebar content */}
    </Box>
  );

  return (
    <Flex h="100vh">
      {/* Desktop: push panel */}
      {!isMobile && sidebarOpen && (
        <Box
          w={SIDEBAR_WIDTH}
          minW="280px"
          bg="white"
          borderRight="1px solid"
          borderColor="gray.200"
          overflowY="auto"
        >
          {sidebarContent}
        </Box>
      )}

      {/* Mobile: drawer */}
      {isMobile && (
        <Drawer.Root
          open={sidebarOpen}
          onOpenChange={(e) => setSidebarOpen(e.open)}
          placement="start"
        >
          <Drawer.Backdrop />
          <Drawer.Positioner>
            <Drawer.Content>
              <Drawer.Header borderBottomWidth="1px">
                <Drawer.Title>Menu</Drawer.Title>
                <Drawer.CloseTrigger />
              </Drawer.Header>
              <Drawer.Body p={0}>
                {sidebarContent}
              </Drawer.Body>
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>
      )}

      <Box flex={1} position="relative">
        <IconButton
          aria-label="Toggle sidebar"
          position="absolute"
          top={3}
          left={3}
          zIndex={1}
          onClick={() => setSidebarOpen((v) => !v)}
          size="sm"
        >
          ☰
        </IconButton>

        <DeckGL /* ... */>
          <Map /* ... */ />
        </DeckGL>
      </Box>
    </Flex>
  );
}
