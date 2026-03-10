# Skill: Add a Globe View

## When to use
When you want a 3D globe visualization instead of (or in addition to) a flat Mercator map. Common for global datasets, climate data, or satellite imagery.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@deck.gl/core` installed

## Steps

### 1. Import GlobeView

```tsx
import { _GlobeView as GlobeView } from "@deck.gl/core";
```

> **Note:** `GlobeView` is experimental in deck.gl 9 and must be imported as `_GlobeView`.

### 2. Set up the globe

Replace the standard `DeckGL` + `Map` setup. Globe view does **not** use MapLibre — deck.gl renders the globe directly:

```tsx
import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { SolidPolygonLayer } from "@deck.gl/layers";

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
};

type ViewState = typeof INITIAL_VIEW;

export default function GlobeApp() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  const views = new GlobeView({ id: "globe", controller: true });

  const backgroundLayer = new SolidPolygonLayer({
    id: "background",
    data: [[[-180, 90], [0, 90], [180, 90], [180, -90], [0, -90], [-180, -90]]],
    getPolygon: (d) => d,
    filled: true,
    getFillColor: [14, 36, 62],
  });

  return (
    <div style={{ width: "100%", height: "100%", background: "#0a1929" }}>
      <DeckGL
        views={views}
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={[backgroundLayer, ...yourDataLayers]}
      />
    </div>
  );
}
```

### 3. Add auto-rotation

```tsx
import { useEffect, useRef } from "react";

const animationRef = useRef<number>();
const [rotating, setRotating] = useState(true);

useEffect(() => {
  if (!rotating) {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    return;
  }
  const animate = () => {
    setViewState((prev) => ({ ...prev, longitude: prev.longitude + 0.1 }));
    animationRef.current = requestAnimationFrame(animate);
  };
  animationRef.current = requestAnimationFrame(animate);
  return () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };
}, [rotating]);

// Pause rotation on user interaction via onInteractionStateChange
<DeckGL
  onViewStateChange={({ viewState: vs }) => {
    setViewState(vs as ViewState);
  }}
  onInteractionStateChange={({ isDragging, isZooming, isPanning }) => {
    if (isDragging || isZooming || isPanning) setRotating(false);
  }}
/>
```

### 4. Add a land boundary layer

GlobeView has **no MapLibre basemap** — you must use `SolidPolygonLayer` or `GeoJsonLayer` to render land masses:

```tsx
import { GeoJsonLayer } from "@deck.gl/layers";

const LAND_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";

const landLayer = new GeoJsonLayer({
  id: "land",
  data: LAND_GEOJSON_URL,
  filled: true,
  stroked: true,
  getFillColor: [40, 80, 120],
  getLineColor: [100, 150, 200],
  getLineWidth: 1,
  lineWidthUnits: "pixels",
  pickable: true,
});
```

### 5. Switching between globe and flat map

To support both views, conditionally render:

```tsx
import { MapView, _GlobeView as GlobeView } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";

const [globeMode, setGlobeMode] = useState(false);

const views = globeMode
  ? new GlobeView({ id: "globe", controller: true })
  : new MapView({ id: "map", controller: true });

<DeckGL views={views} /* ... */>
  {!globeMode && (
    <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
  )}
</DeckGL>
```

### 6. Verify

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
