# Skill: Add a STAC Layer

## When to use
When you want to search a STAC catalog, select items, and render assets on the map.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `stac-react` and `@tanstack/react-query` installed
- App wrapped with `QueryClientProvider` and `StacApiProvider` (see `setup-map-app` skill)

## Popular public STAC APIs
- **Earth Search (Element 84)**: `https://earth-search.aws.element84.com/v1`
  - Collections: sentinel-2-l2a, landsat-c2-l2, cop-dem-glo-30, naip
- **Microsoft Planetary Computer**: `https://planetarycomputer.microsoft.com/api/stac/v1`
  - Note: Requires token signing for asset URLs
- **NASA CMR STAC**: `https://cmr.earthdata.nasa.gov/stac`

## Steps

### 1. Search the STAC catalog with stac-react

```tsx
import { useStacSearch } from "stac-react";
import { useTitiler, useColorScale, MapLegend, createCOGLayer } from "@maptool/core";
import { getSTACItemAssets } from "@maptool/core";

const {
  result,       // search result with .features array
  search,       // trigger search
  setCollections,
  setBbox,
  setDatetime,
} = useStacSearch();

// Configure the search
useEffect(() => {
  setCollections(["sentinel-2-l2a"]);
  setBbox([-122.5, 37.5, -122.0, 38.0]);
  setDatetime("2024-06-01/2024-06-30");
}, []);

// Trigger the search
useEffect(() => { search(); }, [search]);
```

### 2. Select an item and get its COG URL

```tsx
import { useState, useEffect } from "react";

const items = result?.features ?? [];
const [selectedItem, setSelectedItem] = useState(null);

useEffect(() => {
  if (!selectedItem && items.length > 0) {
    setSelectedItem(items[0]);
  }
}, [items, selectedItem]);

const cogAssets = selectedItem ? getSTACItemAssets(selectedItem) : [];
// Common asset names: "visual", "B04", "red", "data" — varies by collection
const activeUrl = cogAssets.find((a) => a.name === "visual")?.href
  ?? cogAssets[0]?.href
  ?? "";
```

### 3. Visualize with TiTiler + legend

```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: activeUrl,
  colormap: "viridis",
});

const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: "viridis",
  steps: 8,
});

const layers = useMemo(
  () => titiler.tileUrl
    ? [createCOGLayer({ id: "stac-item", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
    : [],
  [titiler.tileUrl, titiler.info?.bounds]
);
```

### 4. Add legend and metadata display

```tsx
{titiler.rescaleRange ? (
  <MapLegend
    layers={[{
      type: "continuous",
      id: "stac-item",
      title: selectedItem?.collection ?? "STAC Layer",
      domain: titiler.rescaleRange,
      colors: colorScale.colors,
      ticks: 5,
    }]}
  />
) : null}

{selectedItem ? (
  <Box position="absolute" top={4} right={4} bg="white" p={3} borderRadius="md" boxShadow="md" maxW="xs" fontSize="sm">
    <Text fontWeight="semibold">{selectedItem.id}</Text>
    <Text color="gray.500">{String(selectedItem.properties.datetime)}</Text>
    <Text color="gray.500">Collection: {selectedItem.collection}</Text>
  </Box>
) : null}
```

### 5. Alternative: use `createSTACLayer` shortcut

For simpler cases, skip `useTitiler` and use the STAC layer wrapper directly:
```tsx
import { createSTACLayer } from "@maptool/core";

const layers = selectedItem
  ? [createSTACLayer({
      id: "stac-quick",
      baseUrl: import.meta.env.VITE_TITILER_URL,
      item: selectedItem,
      assetName: "visual",  // optional — defaults to first compatible asset
      colormap: "viridis",
    })]
  : [];
```

Note: `createSTACLayer` throws if no compatible asset is found, so guard with `selectedItem` check.

## Common mistakes
- **TiTiler not running** — ensure your local TiTiler instance is up (see `setup-map-app` skill, step 0) and `VITE_TITILER_URL` is set in `.env`
- **Missing `StacApiProvider`** — stac-react hooks require the provider to be set up (see `setup-map-app` skill)
- **Planetary Computer URLs expire** — you need their `planetary-computer` npm package to sign asset URLs before passing to TiTiler
- **Asset names vary by collection** — always inspect `getSTACItemAssets()` output to find the right asset name
- **POST search not supported everywhere** — some STAC APIs only support GET. Check the API docs if searches fail.

## Reference files
- [`stac-react`](https://github.com/developmentseed/stac-react) — `useStacSearch`, `useItem`, `StacApiProvider`
- `src/utils/stac-helpers.ts` — `getSTACItemAssets`, `extractTimestamps`
- `src/layers/STACLayer.ts` — `createSTACLayer` and `STACLayerOptions`
