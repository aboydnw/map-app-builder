# Skill: Add a Vector Layer

## When to use
When you want to display GeoJSON or MVT (Mapbox Vector Tile) data on the map with feature interaction (hover, click, tooltips).

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- GeoJSON data (URL or inline) or an MVT tile endpoint

## Steps

### 1. Add a GeoJSON layer with color mapping

```tsx
import { createGeoJSONLayer, useFeatureState, FeatureTooltip, MapLegend } from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";

const categories: CategoryEntry[] = [
  { value: "residential", color: "#4CAF50", label: "Residential" },
  { value: "commercial", color: "#2196F3", label: "Commercial" },
  { value: "industrial", color: "#FF9800", label: "Industrial" },
];

const layer = createGeoJSONLayer({
  id: "parcels",
  data: "https://example.com/parcels.geojson",
  colorProperty: "land_use",
  colorMapping: { type: "categorical", categories },
});
```

For continuous data:
```tsx
const layer = createGeoJSONLayer({
  id: "temperature",
  data: temperatureData,
  colorProperty: "temp_c",
  colorMapping: { type: "continuous", domain: [-10, 40], colormap: "coolwarm" },
});
```

### 2. Add feature interaction

```tsx
const featureState = useFeatureState();

// Pass to DeckGL
<DeckGL
  viewState={viewState}
  onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
  layers={[layer]}
  onHover={featureState.onHover}
  onClick={featureState.onClick}
  getCursor={featureState.getCursor}
  controller
>
  <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
</DeckGL>
```

### 3. Add a tooltip

```tsx
{featureState.hoveredFeature && featureState.hoverCoordinates && (
  <FeatureTooltip x={featureState.hoverCoordinates.x} y={featureState.hoverCoordinates.y}>
    <strong>{String(featureState.hoveredFeature.properties?.name ?? "Feature")}</strong>
    <div>Type: {String(featureState.hoveredFeature.properties?.land_use)}</div>
  </FeatureTooltip>
)}
```

### 4. Add a categorical legend

```tsx
<MapLegend
  layers={[{
    type: "categorical",
    id: "parcels",
    title: "Land Use",
    categories,
    shape: "square",
  }]}
  position="bottom-left"
/>
```

### 5. Using MVT (Mapbox Vector Tiles) instead

For MVT sources, use deck.gl's `MVTLayer` directly. It's not wrapped in the library because MVT sources vary significantly:

```tsx
import { MVTLayer } from "@deck.gl/geo-layers";

const mvtLayer = new MVTLayer({
  id: "boundaries",
  data: "https://tiles.example.com/{z}/{x}/{y}.pbf",
  getFillColor: [200, 200, 200, 100],
  getLineColor: [0, 0, 0, 255],
  getLineWidth: 1,
  lineWidthUnits: "pixels",
  pickable: true,
});
```

Wire `onHover`/`onClick` the same way as GeoJSON above.

### 6. Verify

Run `npm run dev` and confirm:
- [ ] Vector features render on the map
- [ ] Hovering highlights features and shows cursor change
- [ ] Clicking selects a feature
- [ ] Tooltip appears near the cursor with feature properties
- [ ] Legend reflects the color scheme

## Common mistakes
- **GeoJSON with wrong CRS** — deck.gl expects WGS84 (EPSG:4326). Reproject if needed.
- **Missing `pickable: true`** — hover/click won't fire without it (enabled by default in `createGeoJSONLayer`)
- **Large GeoJSON files** — for datasets > 10MB, consider MVT or simplifying geometry with tools like Tippecanoe
- **Forgetting to pass `onHover`/`onClick` to DeckGL** — `useFeatureState` returns handlers but they must be connected
- **`colorProperty` doesn't match data** — check the actual property names in your GeoJSON `properties` object

## Reference files
- `src/hooks/useFeatureState.ts` — hover/click/selection state management
- `src/layers/GeoJSONLayer.ts` — `createGeoJSONLayer` factory with color mapping
- `src/components/FeatureTooltip/FeatureTooltip.tsx` — cursor-following tooltip
- `src/components/MapLegend/types.ts` — `CategoryEntry` type for categorical legends
