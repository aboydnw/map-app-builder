# Skill: Add a STAC Layer

## When to use
When you want to search a STAC catalog, select items, and render assets on the map.

## Popular public STAC APIs
- **Earth Search (Element 84)**: `https://earth-search.aws.element84.com/v1`
  - Collections: sentinel-2-l2a, landsat-c2-l2, cop-dem-glo-30, naip
- **Microsoft Planetary Computer**: `https://planetarycomputer.microsoft.com/api/stac/v1`
  - Note: Requires token signing for asset URLs
- **NASA CMR STAC**: `https://cmr.earthdata.nasa.gov/stac`

## Steps

### 1. Search the STAC catalog

```tsx
import { useSTAC, useTitiler, useColorScale, MapLegend, createCOGLayer } from "@maptool/core";

// Note: pass `collections` as an array, not `collectionId`
const stac = useSTAC({
  apiUrl: "https://earth-search.aws.element84.com/v1",
  collections: ["sentinel-2-l2a"],
  bbox: [-122.5, 37.5, -122.0, 38.0],
  datetime: "2024-06-01/2024-06-30",
  limit: 10,
  autoSearch: true,
});
```

### 2. Select an item and get its COG URL

```tsx
import { useEffect } from "react";

useEffect(() => {
  if (!stac.selectedItem && stac.items.length > 0) {
    stac.selectItem(stac.items[0]);
  }
}, [stac.items, stac.selectedItem]);

const cogAssets = stac.getCOGUrls();
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
      title: stac.selectedItem?.collection ?? "STAC Layer",
      domain: titiler.rescaleRange,
      colors: colorScale.colors,
      ticks: 5,
    }]}
  />
) : null}

{stac.selectedItem ? (
  <div className="absolute top-4 right-4 bg-white p-3 rounded shadow max-w-xs text-sm">
    <div className="font-semibold">{stac.selectedItem.id}</div>
    <div className="text-gray-500">{String(stac.selectedItem.properties.datetime)}</div>
    <div className="text-gray-500">Collection: {stac.selectedItem.collection}</div>
  </div>
) : null}
```

### 5. Alternative: use `createSTACLayer` shortcut

For simpler cases, skip `useTitiler` and use the STAC layer wrapper directly:
```tsx
import { createSTACLayer } from "@maptool/core";

const layers = stac.selectedItem
  ? [createSTACLayer({
      id: "stac-quick",
      baseUrl: import.meta.env.VITE_TITILER_URL,
      item: stac.selectedItem,
      assetName: "visual",  // optional — defaults to first compatible asset
      colormap: "viridis",
    })]
  : [];
```

Note: `createSTACLayer` throws if no compatible asset is found, so guard with `stac.selectedItem` check.

## Common mistakes
- **TiTiler not running** — ensure your local TiTiler instance is up (see `setup-map-app` skill, step 0) and `VITE_TITILER_URL` is set in `.env`
- **Using `collectionId` instead of `collections`** — `useSTAC` extends `STACSearchParams` which expects `collections: string[]`
- **Planetary Computer URLs expire** — you need their `planetary-computer` npm package to sign asset URLs before passing to TiTiler
- **Asset names vary by collection** — always inspect `stac.getCOGUrls()` output to find the right asset name
- **POST search not supported everywhere** — some STAC APIs only support GET. Check the API docs if searches fail.

## Reference files
- `src/hooks/useSTAC.ts` — `UseSTACOptions` interface (extends `STACSearchParams`)
- `src/utils/stac.ts` — `STACSearchParams`, `getSTACItemAssets`, `extractTimestamps`
- `src/layers/STACLayer.ts` — `createSTACLayer` and `STACLayerOptions`
