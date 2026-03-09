# Skill: Add a PMTiles Raster Layer with Legend

## When to use
When you have a pre-rendered raster PMTiles archive (e.g. climate data, land cover, satellite imagery) and want to display it on the map with a manually configured legend.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `pmtiles` and `@tanstack/react-query` installed (see `setup-map-app` skill, PMTiles section)
- A publicly accessible raster PMTiles URL

## Steps

### 1. Import maptool pieces

```tsx
import {
  createPMTilesProtocol,
  createPMTilesRasterLayer,
  usePMTiles,
  MapLegend,
} from "@maptool/core";
```

### 2. Register the PMTiles protocol

The protocol must be registered once before any PMTiles layers load. Do this in your App component or a top-level effect:

```tsx
import { useEffect } from "react";
import { addProtocol, removeProtocol } from "maplibre-gl";

useEffect(() => {
  const { protocol, cleanup } = createPMTilesProtocol();
  addProtocol("pmtiles", protocol.tile);
  return () => {
    removeProtocol("pmtiles");
    cleanup();
  };
}, []);
```

### 3. Fetch metadata and fit the map

```tsx
const PMTILES_URL = "https://example.com/land-cover-2023.pmtiles";

const { metadata, isLoading, error } = usePMTiles({ url: PMTILES_URL });
```

Use the metadata bounds to set the initial view:
```tsx
import { WebMercatorViewport } from "@deck.gl/core";

useEffect(() => {
  if (!metadata?.bounds) return;
  const [minLng, minLat, maxLng, maxLat] = metadata.bounds;
  const vp = new WebMercatorViewport({ width: 800, height: 600 });
  const fitted = vp.fitBounds(
    [[minLng, minLat], [maxLng, maxLat]],
    { padding: 40 }
  );
  setViewState((prev) => ({ ...prev, ...fitted }));
}, [metadata]);
```

### 4. Create the raster layer

```tsx
import { useMemo } from "react";

const layers = useMemo(() => {
  if (!metadata) return [];
  return [
    createPMTilesRasterLayer({
      id: "land-cover",
      url: `pmtiles://${PMTILES_URL}`,
      bounds: metadata.bounds,
      minZoom: metadata.minZoom,
      maxZoom: metadata.maxZoom,
    }),
  ];
}, [metadata]);
```

Pass `layers` to the `<DeckGL>` component's `layers` prop.

### 5. Add a manual legend

Raster PMTiles have baked-in colors — the archive contains pre-rendered image tiles, so there is no colormap to apply at runtime. You must configure the legend manually to match the source's color scheme:

```tsx
<MapLegend
  layers={[{
    type: "categorical",
    id: "land-cover",
    title: "Land Cover 2023",
    categories: [
      { value: "forest", color: "#1a9850", label: "Forest" },
      { value: "cropland", color: "#fee08b", label: "Cropland" },
      { value: "urban", color: "#d73027", label: "Urban" },
      { value: "water", color: "#4575b4", label: "Water" },
    ],
    shape: "square",
  }]}
  position="bottom-left"
  collapsible
/>
```

For continuous data (e.g. temperature), use a continuous legend with hardcoded colors:
```tsx
<MapLegend
  layers={[{
    type: "continuous",
    id: "temperature",
    title: "Temperature",
    unit: "°C",
    domain: [-20, 40],
    colors: ["#2166ac", "#67a9cf", "#fddbc7", "#ef8a62", "#b2182b"],
    ticks: 5,
  }]}
  position="bottom-left"
/>
```

### 6. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles load and are visible on the map
- [ ] Map fits to the data extent on load
- [ ] Legend appears with colors matching the raster tiles
- [ ] Zoom in/out works within the min/max zoom range
- [ ] No console errors about pmtiles protocol

## Common mistakes
- **Forgetting to register the PMTiles protocol** — tiles will fail to load with a `pmtiles://` URL scheme error. The `addProtocol` call must happen before any layer tries to fetch tiles.
- **Not prefixing the URL with `pmtiles://`** — the layer URL must start with `pmtiles://` for the protocol handler to intercept tile requests. The raw HTTPS URL won't work.
- **Trying to apply a colormap at runtime** — raster PMTiles contain pre-rendered image tiles. Unlike COG layers served through TiTiler, you cannot change the colormap. The legend must be manually configured to match whatever colors were baked in during tile generation.
- **Missing `@tanstack/react-query`** — `usePMTiles` requires a `QueryClientProvider` ancestor. See `setup-map-app` skill for provider setup.
- **Using `loading` instead of `isLoading`** — `usePMTiles` returns `isLoading` (React Query convention), not `loading` like `useTitiler`.

## Reference files
- `src/utils/pmtiles.ts` — `createPMTilesProtocol`, `fetchPMTilesMetadata`
- `src/hooks/usePMTiles.ts` — `usePMTiles` hook, `UsePMTilesOptions`
- `src/layers/PMTilesRasterLayer.ts` — `createPMTilesRasterLayer`, `PMTilesRasterLayerOptions`
- `src/components/MapLegend/types.ts` — legend configuration types
