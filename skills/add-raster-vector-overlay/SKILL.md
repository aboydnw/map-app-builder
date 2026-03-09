# Skill: Add a Raster + Vector Overlay

## When to use
When you want to combine a COG raster layer (e.g. satellite-derived data) with a vector layer (GeoJSON or PMTiles) on top — for example, NO2 concentration raster with air quality monitoring station points, or land surface temperature with city boundary polygons.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A running TiTiler instance for the raster layer
- A COG URL for the raster data
- GeoJSON data or a vector PMTiles URL for the overlay

## Steps

### 1. Import maptool pieces

```tsx
import {
  createCOGLayer,
  useTitiler,
  useColorScale,
  createGeoJSONLayer,
  useFeatureState,
  FeatureTooltip,
  MapLegend,
} from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";
```

For PMTiles vector overlay, also import:
```tsx
import { createPMTilesVectorLayer, createPMTilesProtocol, usePMTiles } from "@maptool/core";
```

### 2. Set up the raster layer

```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: "https://example.com/no2-tropospheric.tif",
  colormap: "RdYlGn",
  rescale: [0, 0.0005],
});

const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: "RdYlGn",
  steps: 8,
});
```

### 3. Set up the vector layer

With GeoJSON:
```tsx
const categories: CategoryEntry[] = [
  { value: "good", color: "#4CAF50", label: "Good" },
  { value: "moderate", color: "#FFC107", label: "Moderate" },
  { value: "unhealthy", color: "#F44336", label: "Unhealthy" },
];

const stationLayer = createGeoJSONLayer({
  id: "stations",
  data: "https://example.com/air-quality-stations.geojson",
  colorProperty: "aqi_category",
  colorMapping: { type: "categorical", categories },
  pointRadius: 6,
});
```

With PMTiles vector:
```tsx
const stationLayer = createPMTilesVectorLayer({
  id: "stations",
  url: "https://example.com/stations.pmtiles",
  colorProperty: "aqi_category",
  colorMapping: { type: "categorical", categories },
  pointRadius: 6,
});
```

### 4. Combine layers with correct ordering

Raster layers go first (bottom), vector layers on top. deck.gl renders layers in array order — earlier items are drawn below later items:

```tsx
const layers = useMemo(() => {
  const result = [];

  if (titiler.tileUrl) {
    result.push(createCOGLayer({ id: "no2-raster", tileUrl: titiler.tileUrl }));
  }

  result.push(stationLayer);

  return result;
}, [titiler.tileUrl, stationLayer]);
```

### 5. Add feature interaction for the vector layer

```tsx
const featureState = useFeatureState();

<DeckGL
  viewState={viewState}
  onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
  layers={layers}
  onHover={featureState.onHover}
  onClick={featureState.onClick}
  getCursor={featureState.getCursor}
  controller
>
  <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
</DeckGL>

{featureState.hoveredFeature && featureState.hoverCoordinates && (
  <FeatureTooltip x={featureState.hoverCoordinates.x} y={featureState.hoverCoordinates.y}>
    <strong>{String(featureState.hoveredFeature.properties?.station_name ?? "Station")}</strong>
    <div>AQI: {String(featureState.hoveredFeature.properties?.aqi_value)}</div>
    <div>Category: {String(featureState.hoveredFeature.properties?.aqi_category)}</div>
  </FeatureTooltip>
)}
```

### 6. Add a dual legend

Show both the raster and vector legends together:

```tsx
{titiler.rescaleRange && (
  <MapLegend
    layers={[
      {
        type: "continuous",
        id: "no2-raster",
        title: "NO₂ Concentration",
        unit: "mol/m²",
        domain: titiler.rescaleRange,
        colors: colorScale.colors,
        ticks: 5,
      },
      {
        type: "categorical",
        id: "stations",
        title: "Air Quality Stations",
        categories,
        shape: "circle",
      },
    ]}
    position="bottom-left"
    collapsible
  />
)}
```

### 7. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles render as the base data layer
- [ ] Vector features (points/polygons) render on top of the raster
- [ ] Hovering over vector features shows a tooltip
- [ ] Raster is visible through semi-transparent vector fills
- [ ] Both legends appear in the same panel
- [ ] Toggling vector layer visibility doesn't affect the raster

## Common mistakes
- **Wrong layer order** — if the raster layer is added after the vector layer in the array, it will draw on top and hide the vector features. Always put raster layers first.
- **Opaque vector fills hiding the raster** — for polygon overlays, use a low `fillOpacity` (e.g. `100` out of 255) so the underlying raster remains visible. Point layers are usually fine at full opacity.
- **Tooltip not firing on vector features** — only layers with `pickable: true` respond to hover/click. `createGeoJSONLayer` and `createPMTilesVectorLayer` enable this by default, but `createCOGLayer` raster tiles are not pickable.
- **Legend colors not matching** — ensure the colormap name in `useTitiler` and `useColorScale` match (see `add-cog-layer` skill).
- **Missing `stationLayer` in `useMemo` dependencies** — if the vector layer reference is recreated on every render (e.g. inline `createGeoJSONLayer`), it will cause infinite re-renders. Memoize or stabilize the layer reference.

## Reference files
- `src/layers/COGLayer.ts` — `createCOGLayer`
- `src/layers/GeoJSONLayer.ts` — `createGeoJSONLayer`
- `src/layers/PMTilesVectorLayer.ts` — `createPMTilesVectorLayer`
- `src/hooks/useTitiler.ts` — `useTitiler`
- `src/hooks/useFeatureState.ts` — `useFeatureState`
- `src/components/MapLegend/types.ts` — legend configuration types
