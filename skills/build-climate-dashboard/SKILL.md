# Skill: Build a Climate Dashboard

## When to use
When building a full-featured climate or environmental dashboard that combines animated raster data, vector overlays, a timeline, legend, and pixel inspection — for example, an animated sea surface temperature (SST) viewer with earthquake/station point overlays.

This is a comprehensive recipe that ties together multiple skills. Read the individual skills for detailed guidance on each piece.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A running TiTiler instance (see `setup-map-app` skill, step 0)
- A set of time-series COG URLs (one per timestep)
- GeoJSON or PMTiles vector data for point/polygon overlays
- Dependencies: `@maptool/core`, `@deck.gl/*`, `maplibre-gl`, `react-map-gl`, `@chakra-ui/react`
- For PMTiles overlays: `pmtiles`, `@tanstack/react-query`

## Architecture overview

A climate dashboard typically has five layers of functionality:

1. **Animated raster** — time-series COG tiles rendered through TiTiler with a colormap
2. **Vector overlay** — point or polygon features on top (stations, boundaries, events)
3. **Timeline control** — play/pause/scrub through timesteps
4. **Legend** — continuous colormap for raster + categorical for vector
5. **Pixel inspector** — hover to see raster values at a point

```
┌─────────────────────────────────────────────┐
│  App                                        │
│  ├── viewState (shared)                     │
│  ├── useAnimationClock (timestep control)   │
│  ├── useTitiler (per-timestep tile URLs)    │
│  ├── useColorScale (legend colors)          │
│  ├── usePixelInspector (hover values)       │
│  │                                          │
│  ├── <DeckGL>                               │
│  │   ├── COGLayer (animated raster)         │
│  │   └── GeoJSONLayer (vector overlay)      │
│  │                                          │
│  ├── <AnimationTimeline />                  │
│  ├── <MapLegend />                          │
│  ├── <PixelInspector />                     │
│  └── <FeatureTooltip />                     │
└─────────────────────────────────────────────┘
```

## Steps

### 1. Define your time-series data

```tsx
const TIMESTEPS = [
  { label: "Jan 2024", url: "https://example.com/sst/sst-2024-01.tif" },
  { label: "Feb 2024", url: "https://example.com/sst/sst-2024-02.tif" },
  { label: "Mar 2024", url: "https://example.com/sst/sst-2024-03.tif" },
];
```

### 2. Set up the animation clock

See the `add-animation` skill for full details.

```tsx
import { useAnimationClock } from "@maptool/core";

const clock = useAnimationClock({
  frameCount: TIMESTEPS.length,
  intervalMs: 1000,
});
```

### 3. Connect TiTiler to the current timestep

```tsx
import { useTitiler, useColorScale } from "@maptool/core";

const currentCog = TIMESTEPS[clock.currentFrame].url;

const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: currentCog,
  colormap: "coolwarm",
  rescale: [-2, 35],
});

const colorScale = useColorScale({
  domain: [-2, 35],
  colormap: "coolwarm",
  steps: 8,
});
```

Use a fixed `rescale` range for animation so colors stay consistent across frames. Auto-detection would recalculate per frame, causing visual jumps.

### 4. Create the raster layer

```tsx
import { createCOGLayer } from "@maptool/core";

const rasterLayer = useMemo(
  () =>
    titiler.tileUrl
      ? [createCOGLayer({ id: "sst", tileUrl: titiler.tileUrl })]
      : [],
  [titiler.tileUrl]
);
```

### 5. Add a vector overlay layer

See the `add-raster-vector-overlay` skill for full details.

```tsx
import { createGeoJSONLayer } from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";

const categories: CategoryEntry[] = [
  { value: "buoy", color: "#2196F3", label: "Buoy" },
  { value: "ship", color: "#FF9800", label: "Ship" },
  { value: "argo", color: "#9C27B0", label: "Argo Float" },
];

const stationLayer = useMemo(
  () =>
    createGeoJSONLayer({
      id: "stations",
      data: "https://example.com/ocean-stations.geojson",
      colorProperty: "platform_type",
      colorMapping: { type: "categorical", categories },
      pointRadius: 5,
    }),
  []
);
```

### 6. Combine layers and add interaction

```tsx
import { useFeatureState, usePixelInspector } from "@maptool/core";

const featureState = useFeatureState();
const inspector = usePixelInspector({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  cogUrl: currentCog,
});

const layers = useMemo(
  () => [...rasterLayer, stationLayer],
  [rasterLayer, stationLayer]
);

<DeckGL
  viewState={viewState}
  onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
  layers={layers}
  onHover={(info) => {
    featureState.onHover(info);
    if (info.coordinate) {
      inspector.inspect(info.coordinate[0], info.coordinate[1]);
    } else {
      inspector.clear();
    }
  }}
  onClick={featureState.onClick}
  getCursor={featureState.getCursor}
  controller
>
  <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
</DeckGL>
```

### 7. Add the UI controls

```tsx
import { AnimationTimeline, MapLegend, PixelInspector, FeatureTooltip } from "@maptool/core";

{/* Timeline at bottom */}
<AnimationTimeline
  currentFrame={clock.currentFrame}
  frameCount={TIMESTEPS.length}
  isPlaying={clock.isPlaying}
  onPlay={clock.play}
  onPause={clock.pause}
  onFrameChange={clock.setFrame}
  labels={TIMESTEPS.map((t) => t.label)}
/>

{/* Legend */}
<MapLegend
  layers={[
    {
      type: "continuous",
      id: "sst",
      title: "Sea Surface Temperature",
      unit: "°C",
      domain: [-2, 35],
      colors: colorScale.colors,
      ticks: 5,
    },
    {
      type: "categorical",
      id: "stations",
      title: "Observation Stations",
      categories,
      shape: "circle",
    },
  ]}
  position="bottom-left"
  collapsible
/>

{/* Pixel inspector */}
<PixelInspector
  value={inspector.value}
  isLoading={inspector.isLoading}
  position="top-right"
  formatValue={(band, val) => `${val.toFixed(1)} °C`}
/>

{/* Feature tooltip */}
{featureState.hoveredFeature && featureState.hoverCoordinates && (
  <FeatureTooltip x={featureState.hoverCoordinates.x} y={featureState.hoverCoordinates.y}>
    <strong>{String(featureState.hoveredFeature.properties?.station_name ?? "Station")}</strong>
    <div>Type: {String(featureState.hoveredFeature.properties?.platform_type)}</div>
  </FeatureTooltip>
)}
```

### 8. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles load for the initial timestep
- [ ] Playing the animation cycles through timesteps with smooth tile transitions
- [ ] Vector points render on top of the raster
- [ ] Hovering over a station shows a tooltip
- [ ] Hovering over the raster updates the pixel inspector with band values
- [ ] Timeline scrubber reflects the current frame
- [ ] Legend shows both raster colormap and vector categories
- [ ] Pausing the animation freezes on the current frame

## Common mistakes
- **Auto-detecting rescale per frame** — omitting the fixed `rescale` parameter causes `useTitiler` to recalculate min/max per COG, making colors inconsistent across frames. Always set a fixed domain for animated data.
- **Inspector querying a stale COG URL** — `usePixelInspector` uses the `cogUrl` prop. When the animation advances, update `cogUrl` to the current frame's COG so the point query hits the right timestep.
- **Too many concurrent TiTiler requests** — rapid animation can flood the tile server. Increase `intervalMs` (e.g. 1500–2000ms) or pre-cache frames.
- **Layer ordering** — raster must come before vector in the layers array, or vector features will be hidden behind tiles. See `add-raster-vector-overlay` skill.
- **Missing CSS reset** — the full-screen layout requires the CSS reset from `setup-map-app` step 3. Without it, the map won't fill the viewport and UI controls will be mispositioned.
- **Forgetting `MapToolProvider`** — `AnimationTimeline`, `MapLegend`, and `PixelInspector` all require the Chakra provider wrapper.

## Reference files
- `src/hooks/useAnimationClock.ts` — animation frame control
- `src/hooks/useTitiler.ts` — TiTiler integration
- `src/hooks/usePixelInspector.ts` — raster point queries
- `src/hooks/useFeatureState.ts` — vector interaction state
- `src/components/AnimationTimeline/AnimationTimeline.tsx` — timeline UI
- `src/components/MapLegend/MapLegend.tsx` — legend component
- `src/components/PixelInspector/PixelInspector.tsx` — pixel value display
- `src/components/FeatureTooltip/FeatureTooltip.tsx` — cursor tooltip
- `src/layers/COGLayer.ts` — raster layer factory
- `src/layers/GeoJSONLayer.ts` — vector layer factory
