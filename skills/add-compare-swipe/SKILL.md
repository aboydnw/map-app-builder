# Skill: Add a Compare Swipe View

## When to use
When you want side-by-side comparison of two map layer sets with a draggable divider — for example, comparing two time periods of land cover, before/after imagery, or two different datasets covering the same area.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- At least two sets of layers to compare (COG, PMTiles raster, PMTiles vector, or any deck.gl layers)
- `@chakra-ui/react` installed (CompareSwipe uses Chakra's `Box` and `Text`)

## Steps

### 1. Import the component

```tsx
import { CompareSwipe } from "@maptool/core";
```

### 2. Set up shared view state

Both sides of the swipe share a single view state so panning/zooming stays synchronized:

```tsx
import { useState } from "react";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);
```

### 3. Create left and right layers

```tsx
import { useMemo } from "react";
import { createCOGLayer, useTitiler } from "@maptool/core";

const titilerBase = import.meta.env.VITE_TITILER_URL;

const left = useTitiler({
  baseUrl: titilerBase,
  url: "https://example.com/land-cover-2020.tif",
  colormap: "viridis",
});

const right = useTitiler({
  baseUrl: titilerBase,
  url: "https://example.com/land-cover-2023.tif",
  colormap: "viridis",
});

const leftLayers = useMemo(
  () => left.tileUrl ? [createCOGLayer({ id: "lc-2020", tileUrl: left.tileUrl })] : [],
  [left.tileUrl]
);

const rightLayers = useMemo(
  () => right.tileUrl ? [createCOGLayer({ id: "lc-2023", tileUrl: right.tileUrl })] : [],
  [right.tileUrl]
);
```

This works with any layer type. For PMTiles:
```tsx
const leftLayers = useMemo(() => [
  createPMTilesRasterLayer({ id: "imagery-before", url: `pmtiles://${BEFORE_URL}` }),
], []);
```

### 4. Render the CompareSwipe component

Replace the `<DeckGL>` + `<Map>` setup with `<CompareSwipe>`:

```tsx
<div style={{ width: "100%", height: "100%" }}>
  <CompareSwipe
    leftLayers={leftLayers}
    rightLayers={rightLayers}
    leftLabel="2020"
    rightLabel="2023"
    initialPosition={50}
    viewState={viewState}
    onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
    mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
  />
</div>
```

### 5. Add a shared legend (optional)

Place the legend as a sibling to CompareSwipe inside the container:

```tsx
<div style={{ width: "100%", height: "100%", position: "relative" }}>
  <CompareSwipe
    leftLayers={leftLayers}
    rightLayers={rightLayers}
    leftLabel="2020"
    rightLabel="2023"
    viewState={viewState}
    onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
  />
  <MapLegend
    layers={[{
      type: "continuous",
      id: "land-cover",
      title: "Land Cover Index",
      domain: [0, 1],
      colors: colorScale.colors,
      ticks: 5,
    }]}
    position="bottom-left"
    collapsible
  />
</div>
```

### 6. Verify

Run `npm run dev` and confirm:
- [ ] Both sides render with their respective layers
- [ ] Dragging the divider reveals/hides each side
- [ ] Panning or zooming on either side keeps both sides in sync
- [ ] Labels appear in top-left and top-right corners
- [ ] The divider handle is visible and responds to drag

## Common mistakes
- **Dual WebGL contexts** — `CompareSwipe` renders two `<DeckGL>` instances, each creating its own WebGL context. This doubles GPU memory usage. On low-end devices or with many layers, this can cause context loss. Keep layer counts minimal on each side.
- **Passing `mapStyle` without MapLibre CSS** — if using a basemap, make sure `maplibre-gl/dist/maplibre-gl.css` is imported.
- **Not sharing view state** — if you create separate view states for each side, panning won't sync. Both sides must use the same `viewState` and `onViewStateChange`.
- **Forgetting the `as ViewState` cast** — same as the base map setup, the `onViewStateChange` callback needs the type assertion.
- **Layer ID conflicts** — left and right layers must have unique IDs. If both sides use the same layer ID, deck.gl may render incorrectly.
- **Large initial position jumps** — `initialPosition` is a percentage (0-100). Values outside this range will clip to 0 or 100.
- **STAC spatial search returning the wrong tile for each side** — when comparing two time periods from a multi-tile STAC collection (e.g. ESA WorldCover, Esri LULC), a spatial intersection query may return multiple items per year. The first match may be a wide antimeridian-spanning tile whose bounds don't include your viewport at the tile server level, causing blank tiles. Always pick the item with the **smallest bounding box** that contains your area of interest. See the `add-stac-layer` skill's "Planetary Computer gotchas" section for a bbox-sorting pattern.
- **STAC property values not matching expectations** — collection-specific properties like version strings may differ from documentation. Always inspect the raw STAC response (e.g. `"1.0.0"` vs `"V1.0.0"`) before filtering items.

## Reference files
- `src/components/CompareSwipe/CompareSwipe.tsx` — component source, `CompareSwipeProps`
- `src/components/CompareSwipe/useSwipePosition.ts` — drag logic, returns position as 0-100 percentage
