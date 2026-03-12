# Skill: Add a Compare Swipe View

## When to use
When you want side-by-side comparison of two map layer sets with a draggable divider — for example, comparing two time periods of land cover, before/after imagery, or two different datasets covering the same area.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- At least two sets of layers to compare (COG, PMTiles raster, PMTiles vector, or any deck.gl layers)
- `@chakra-ui/react` installed (CompareSwipe uses Chakra's `Box` and `Text`)

## Template files

| File | Description |
|------|-------------|
| `templates/compare-app.tsx` | Complete App.tsx with shared view state, left/right COG layers, CompareSwipe, and a shared legend |

## Steps

### 1. Import the component

```tsx
import { CompareSwipe } from "@maptool/core";
```

### 2. Build the compare-swipe App

Use `templates/compare-app.tsx` as your starting point. The template demonstrates the key patterns:

- **Shared view state** — Both sides share a single `viewState` and `onViewStateChange` so panning/zooming stays synchronized. Never create separate view states per side.
- **Unique layer IDs** — Left and right layers must have distinct IDs (`lc-2020` vs `lc-2023`). If both sides use the same ID, deck.gl may render incorrectly.
- **`useTitiler` per side** — Each side gets its own hook call pointing at a different COG URL, but they can share the same colormap.
- **`initialPosition`** — Sets the divider's starting position as a percentage (0–100).
- **Shared legend** — Placed as a sibling to `CompareSwipe` inside a `position: relative` container so it overlays correctly.

Adapt the template to your data by replacing the COG URLs, colormap, initial view coordinates, and labels.

**PMTiles alternative:** The template uses COG layers, but any layer type works. For PMTiles raster layers, replace the `useTitiler` + `createCOGLayer` pattern with:
```tsx
const leftLayers = useMemo(() => [
  createPMTilesRasterLayer({ id: "imagery-before", url: `pmtiles://${BEFORE_URL}` }),
], []);
```

### 3. Verify

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
