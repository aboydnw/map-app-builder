# Skill: Add a Sidebar Layout

## When to use
When your map app needs a side panel for controls, charts, feature details, or layer settings alongside the map.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed and app wrapped with `MapToolProvider`

## Steps

### 1. Create the layout structure

Use Chakra's `Flex` to split the viewport into sidebar + map:

```tsx
import { Box, Flex } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

export default function App() {
  return (
    <Flex h="100vh">
      <Box
        w={{ base: "100%", md: "360px" }}
        minW="280px"
        bg="white"
        borderRight="1px solid"
        borderColor="gray.200"
        overflowY="auto"
        p={4}
      >
        <Sidebar />
      </Box>
      <Box flex={1} position="relative">
        <DeckGL
          viewState={viewState}
          onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
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

### 2. Add a collapsible sidebar toggle

```tsx
import { useState } from "react";
import { IconButton } from "@chakra-ui/react";

const [sidebarOpen, setSidebarOpen] = useState(true);

<Flex h="100vh">
  {sidebarOpen && (
    <Box w={{ base: "100%", md: "360px" }} /* ...rest as above */ >
      <Sidebar />
    </Box>
  )}
  <Box flex={1} position="relative">
    <IconButton
      aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      position="absolute"
      top={3}
      left={3}
      zIndex={1}
      onClick={() => setSidebarOpen(!sidebarOpen)}
      size="sm"
    >
      {sidebarOpen ? "←" : "→"}
    </IconButton>
    {/* DeckGL + Map */}
  </Box>
</Flex>
```

### 3. Pass state between sidebar and map

Lift shared state to the parent component:

```tsx
function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filter layers based on sidebar selection
  const layers = useMemo(() => {
    const data = selectedCategory
      ? features.filter(f => f.properties.category === selectedCategory)
      : features;
    return [createGeoJSONLayer({ id: "main", data })];
  }, [selectedCategory]);

  return (
    <Flex h="100vh">
      <Box w="360px" /* ... */>
        <Sidebar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
      </Box>
      <Box flex={1} position="relative">
        {/* DeckGL with layers */}
      </Box>
    </Flex>
  );
}
```

### 4. Add charts in the sidebar

For data charts, install a charting library. Recharts is a good default:

```bash
npm install recharts
```

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

function Sidebar({ data }) {
  return (
    <Box>
      <Heading size="sm" mb={3}>Distribution</Heading>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#3182CE" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}
```

### 5. Verify

- [ ] Sidebar renders alongside the map
- [ ] Map fills remaining viewport width
- [ ] Sidebar scrolls independently when content overflows
- [ ] Sidebar collapses and expands on toggle click
- [ ] State changes in sidebar update map layers
- [ ] On narrow viewports, sidebar stacks above map

## Common mistakes
- **Map not filling remaining space** — ensure the map container has `flex={1}` and `position="relative"`
- **DeckGL doesn't resize on sidebar toggle** — deck.gl auto-detects container resize, but if it doesn't, call `deck.redraw()` or remount with a key change
- **Z-index conflicts** — sidebar toggle and map overlays may need explicit `zIndex` values
- **Not lifting state** — sidebar and map need shared state in a common parent; avoid duplicating state

## Reference files
- `src/components/MapToolProvider.tsx` — Chakra provider wrapper
