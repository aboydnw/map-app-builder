# Skill: Set Application Layout

## When to use
When you need to arrange panels, sidebars, bottom bars, or other UI regions around the map. Use this skill **first** to establish the spatial structure, then fill panels with content using other skills.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed and app wrapped with `MapToolProvider`

## Concepts

### Panel modes

**Push panels** take space away from the map via flex layout. The map resizes to fill whatever space remains. Use push panels for primary navigation, persistent controls, or content-heavy sidebars.

**Overlay panels** float over the map with absolute positioning and a semi-transparent background. The map stays full-screen underneath. Use overlay panels for legends, compact toolbars, or secondary info that shouldn't shrink the map.

### Z-index hierarchy

All overlay elements must follow this z-index scale to avoid conflicts:

| z-index | Purpose |
|---------|---------|
| 1 | Toggle buttons, minor controls |
| 10 | Panels, legends, timeline bars |
| 1000 | Tooltips, popovers |

### Non-overlap rules

When combining multiple overlay elements, offset them so they don't stack on top of each other. Common approach:
- If a bottom bar exists, shift `bottom-left` and `bottom-right` legends up by the bar's height
- If a left push panel exists, overlay elements on the map start after the panel's width
- Use CSS custom properties or constants to share dimensions between elements

## Steps

### 1. Choose your layout regions

Decide which regions your app needs. Common configurations:

| Layout | Regions |
|--------|---------|
| Explorer | Left push sidebar + map |
| Dashboard | Left push sidebar + map + bottom overlay bar |
| Viewer | Map + right overlay panel + bottom overlay bar |
| Compare | Left push sidebar + map + right push sidebar |
| Minimal | Map + small overlay controls |

### 2. Push panel layout (sidebar + map)

Use Chakra's `Flex` to split the viewport. The map container gets `flex={1}` to fill remaining space.

```tsx
import { useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

// Define panel width as a constant so other elements can reference it
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
```

For a **right** sidebar, move the `<Box>` after the map container and change `borderRight` to `borderLeft`.

For a **partial-height** push panel, add `h="75vh"` (or any fraction) and `alignSelf="flex-start"` (top-anchored) or `alignSelf="flex-end"` (bottom-anchored) to the panel Box.

### 3. Overlay panel layout

Overlay panels sit inside the map's `position: relative` container using absolute positioning:

```tsx
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
```

The shared `BOTTOM_BAR_HEIGHT` constant prevents the right panel from overlapping the bottom bar. Apply the same pattern for any overlapping regions — extract the dimension as a constant and reference it in the adjacent panel's offset.

### 4. Combined push + overlay layout

For apps with a push sidebar AND overlay elements on the map:

```tsx
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
```

Overlay elements only live inside the map container, so they automatically avoid the push sidebar.

### 5. Responsive behavior

On mobile, push sidebars should collapse into a drawer. Use Chakra's `Drawer` component and show/hide based on breakpoint:

```tsx
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
```

For overlay panels on mobile, reduce width to full-screen or hide behind a toggle:

```tsx
<Box
  position="absolute"
  top={4}
  right={4}
  w={{ base: "calc(100% - 32px)", md: "320px" }}
  /* ... */
>
```

### 6. Dark mode overlays

For dark basemaps, use dark overlay backgrounds:

```tsx
<Box
  bg="rgba(26, 32, 44, 0.92)"
  backdropFilter="blur(8px)"
  color="white"
  /* ... */
>
```

### 7. Verify

- [ ] Push panels resize the map (not overlap it)
- [ ] Overlay panels don't overlap each other
- [ ] Shared dimension constants keep offsets in sync
- [ ] Sidebar collapses to drawer on mobile viewports
- [ ] Overlay panels adapt width on mobile
- [ ] Map interaction (pan, zoom) works in all uncovered areas
- [ ] Z-index hierarchy is consistent (1 → 10 → 1000)

## Common mistakes
- **Overlay panels overlapping** — always extract shared dimensions as constants and use them as offsets on adjacent panels
- **Map not resizing on sidebar toggle** — deck.gl auto-detects container resize, but if it doesn't, add a `key={String(sidebarOpen)}` to force remount
- **Forgetting `position: relative`** — the map container must have `position="relative"` for absolute overlay children to anchor correctly
- **Z-index conflicts with MapLegend/AnimationTimeline** — these components use `zIndex={10}` internally; custom overlay panels should use the same level or adjust accordingly
- **Mobile drawer not closing on navigation** — call `setSidebarOpen(false)` in any sidebar action that should dismiss the drawer

## Reference files
- `src/components/MapToolProvider.tsx` — Chakra provider wrapper
- `src/components/MapLegend/MapLegend.tsx` — legend positioning and z-index patterns
- `src/components/AnimationTimeline/AnimationTimeline.tsx` — bottom bar positioning
