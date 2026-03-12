# Skill: Add a Raster + Vector Overlay

## When to use
When you want to combine a COG raster layer (e.g. satellite-derived data) with a vector layer (GeoJSON or PMTiles) on top — for example, NO2 concentration raster with air quality monitoring station points, or land surface temperature with city boundary polygons.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A running TiTiler instance for the raster layer
- A COG URL for the raster data
- GeoJSON data or a vector PMTiles URL for the overlay

## Template files

| File | Description |
|------|-------------|
| `templates/overlay-example.tsx` | Complete App with COG raster + GeoJSON vector overlay, dual legend, feature interaction, and tooltips |

Copy `overlay-example.tsx` as your starting `App.tsx` and replace the placeholder URLs. For PMTiles vector overlays, swap `createGeoJSONLayer` with `createPMTilesVectorLayer` and add the PMTiles protocol imports (see `add-pmtiles-vector-layer` skill).

## Steps

### 1. Layer ordering

deck.gl renders layers in array order — earlier items are drawn below later items. Always put the raster layer first and vector layers after it:

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

### 2. Feature interaction

Only vector layers respond to hover/click (raster tiles are not pickable). Wire `useFeatureState` to DeckGL and render a `FeatureTooltip` for the vector layer. The template shows the full pattern — the key props on DeckGL are `onHover`, `onClick`, and `getCursor` from `featureState`.

### 3. Dual legend

`MapLegend` accepts an array of layer configs, so you can show both a continuous raster legend and a categorical vector legend in a single panel. Use `type: "continuous"` for the raster and `type: "categorical"` for the vector layer.

### 4. PMTiles vector variant

For PMTiles vector overlays, replace `createGeoJSONLayer` with `createPMTilesVectorLayer`:

```tsx
import { createPMTilesVectorLayer, createPMTilesProtocol, usePMTiles } from "@maptool/core";

const stationLayer = createPMTilesVectorLayer({
  id: "stations",
  url: "https://example.com/stations.pmtiles",
  colorProperty: "aqi_category",
  colorMapping: { type: "categorical", categories },
  pointRadius: 6,
});
```

### 5. Verify

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
