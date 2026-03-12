# Skill: Build a Climate Dashboard

## When to use
When building a full-featured climate or environmental dashboard that combines animated raster data, vector overlays, a timeline, legend, and pixel inspection — for example, an animated sea surface temperature (SST) viewer with earthquake/station point overlays.

This is a comprehensive recipe that ties together multiple skills. Read the individual skills for detailed guidance on each piece.

## Template files

| File | Purpose |
|------|---------|
| `templates/climate-dashboard-app.tsx` | Complete App.tsx integrating animated raster, vector overlay, timeline, legend, pixel inspector, and tooltip |
| `templates/timesteps.ts` | TIMESTEPS array definition with typed interface |

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

Create a `timesteps.ts` file with your COG URLs and labels. See `templates/timesteps.ts` for the structure.

### 2. Set up the animation clock

See the `add-animation` skill for full details. Use `useAnimationClock` with `frameCount` matching the number of timesteps and an `intervalMs` controlling playback speed.

### 3. Connect TiTiler to the current timestep

Use `useTitiler` with the current frame's COG URL and a **fixed** `rescale` range. Pair with `useColorScale` using the same domain and colormap for legend colors.

Use a fixed `rescale` range for animation so colors stay consistent across frames. Auto-detection would recalculate per frame, causing visual jumps.

### 4. Create the raster layer

Use `createCOGLayer` with the tile URL from `useTitiler`. Wrap in `useMemo` keyed on `titiler.tileUrl`.

### 5. Add a vector overlay layer

See the `add-raster-vector-overlay` skill for full details. Use `createGeoJSONLayer` with categorical color mapping.

### 6. Combine layers and add interaction

Wire up `useFeatureState` for vector tooltips and `usePixelInspector` for raster value queries. Pass both handlers to `DeckGL`'s `onHover`. Raster layers must come before vector layers in the array.

### 7. Add the UI controls

Add `AnimationTimeline`, `MapLegend`, `PixelInspector`, and `FeatureTooltip` components. All require `MapToolProvider` wrapper in `main.tsx`.

See `templates/climate-dashboard-app.tsx` for the complete integration of all hooks, layers, and UI controls.

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
