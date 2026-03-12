# Skill: Add a Globe View

## When to use
When you want a 3D globe visualization instead of (or in addition to) a flat Mercator map. Common for global datasets, climate data, or satellite imagery.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@deck.gl/core` installed

## Template files

| File | Purpose |
|------|---------|
| `templates/GlobeApp.tsx` | Complete globe component with GlobeView, ocean background, and Natural Earth land layer |
| `templates/auto-rotation.tsx` | useEffect + ref pattern for auto-rotation with pause-on-interaction |
| `templates/globe-flat-toggle.tsx` | Conditional switching between GlobeView and MapView |

## Steps

### 1. Import GlobeView

```tsx
import { _GlobeView as GlobeView } from "@deck.gl/core";
```

> **Note:** `GlobeView` is experimental in deck.gl 9 and must be imported as `_GlobeView`.

### 2. Set up the globe with background and land layers

Globe view does **not** use MapLibre — deck.gl renders the globe directly. You need a `SolidPolygonLayer` for the ocean background and a `GeoJsonLayer` for land masses.

Use **`templates/GlobeApp.tsx`** as your starting point. It provides:
- `GlobeView` with controller enabled
- Ocean background via `SolidPolygonLayer` (dark blue fill covering the full globe)
- Land boundaries via `GeoJsonLayer` loading Natural Earth 110m land polygons
- Placeholder for your data layers

Replace the `yourDataLayers` array with your actual deck.gl layers.

### 3. Add auto-rotation

Merge the patterns from **`templates/auto-rotation.tsx`** into your component:
- `rotating` state + `animationRef` ref
- `useEffect` that increments longitude on each animation frame
- `onViewStateChange` handler that pauses rotation when the user drags the globe

### 4. Switching between globe and flat map

To support both views, use the pattern from **`templates/globe-flat-toggle.tsx`**:
- Toggle `globeMode` state to switch between `GlobeView` and `MapView`
- Only render the MapLibre `<Map>` component when in flat mode

### 5. Verify

- [ ] Globe renders with dark background
- [ ] Data layers appear on the globe surface
- [ ] Drag to rotate, scroll to zoom
- [ ] Auto-rotation pauses on user interaction
- [ ] No MapLibre errors in console (globe mode doesn't use MapLibre)

## Common mistakes
- **Using `<Map>` with GlobeView** — MapLibre doesn't support globe projection; omit it when in globe mode
- **Forgetting the background layer** — without it, the globe shows transparent gaps between land
- **Tiles not wrapping** — TileLayer doesn't fully support GlobeView; use GeoJsonLayer or ScatterplotLayer for globe data
- **Performance with large datasets** — globe view re-renders the full scene; use data decimation for large point clouds

## Reference files
- `@deck.gl/core` — `_GlobeView` (experimental in deck.gl 9)
- `@deck.gl/layers` — `SolidPolygonLayer`, `GeoJsonLayer`

## Reference test app
- `tests/wind-globe/` — working globe with auto-rotation, Natural Earth land layer, and wind particle visualization
