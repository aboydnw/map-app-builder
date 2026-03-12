# Skill: Add a Vector Layer

## When to use
When you want to display GeoJSON or MVT (Mapbox Vector Tile) data on the map with feature interaction (hover, click, tooltips).

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- GeoJSON data (URL or inline) or an MVT tile endpoint

## Template files

| File | Purpose |
|------|---------|
| `templates/geojson-categorical.tsx` | GeoJSON layer with categorical colors + legend |
| `templates/geojson-continuous.tsx` | GeoJSON layer with continuous color scale |
| `templates/feature-interaction.tsx` | `useFeatureState` + `FeatureTooltip` integration |
| `templates/pmtiles-vector.tsx` | PMTiles vector layer alternative |
| `templates/mvt-layer.tsx` | Raw MVT layer using deck.gl directly |

## Steps

### 1. Add a GeoJSON layer with color mapping

Use `createGeoJSONLayer` with a `colorMapping` config. See `templates/geojson-categorical.tsx` for categorical colors with a legend, or `templates/geojson-continuous.tsx` for continuous scales.

```tsx
import { createGeoJSONLayer, MapLegend } from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";
```

### 2. Add feature interaction

Wire `useFeatureState` handlers (`onHover`, `onClick`, `getCursor`) into the `DeckGL` component. See `templates/feature-interaction.tsx` for the full pattern including tooltip rendering.

```tsx
import { useFeatureState, FeatureTooltip } from "@maptool/core";
```

### 3. Using PMTiles vector as an alternative

For vector data distributed as PMTiles archives (e.g. Overture Maps), use `createPMTilesVectorLayer`. It wraps deck.gl's `MVTLayer` and handles the `pmtiles://` URL scheme automatically. See `templates/pmtiles-vector.tsx`.

This requires the PMTiles protocol to be registered first (see `setup-map-app` skill). For the full setup including metadata fetching and protocol registration, see the `add-pmtiles-vector-layer` skill.

```tsx
import { createPMTilesVectorLayer } from "@maptool/core";
```

### 4. Using raw MVT (Mapbox Vector Tiles) endpoints

For raw MVT tile endpoints (`{z}/{x}/{y}.pbf`), use deck.gl's `MVTLayer` directly. It's not wrapped in the library because MVT sources vary significantly. See `templates/mvt-layer.tsx`.

Wire `onHover`/`onClick` the same way as GeoJSON above.

```tsx
import { MVTLayer } from "@deck.gl/geo-layers";
```

### 5. Verify

Run `npm run dev` and confirm:
- [ ] Vector features render on the map
- [ ] Hovering highlights features and shows cursor change
- [ ] Clicking selects a feature
- [ ] Tooltip appears near the cursor with feature properties
- [ ] Legend reflects the color scheme

## Common mistakes
- **GeoJSON with wrong CRS** — deck.gl expects WGS84 (EPSG:4326). Reproject if needed.
- **Missing `pickable: true`** — hover/click won't fire without it (enabled by default in `createGeoJSONLayer`)
- **Large GeoJSON files** — for datasets > 10MB, consider PMTiles vector (see `add-pmtiles-vector-layer` skill) or simplifying geometry with tools like Tippecanoe
- **Forgetting to pass `onHover`/`onClick` to DeckGL** — `useFeatureState` returns handlers but they must be connected
- **`colorProperty` doesn't match data** — check the actual property names in your GeoJSON `properties` object

## Reference files
- `src/hooks/useFeatureState.ts` — hover/click/selection state management
- `src/layers/GeoJSONLayer.ts` — `createGeoJSONLayer` factory with color mapping
- `src/layers/PMTilesVectorLayer.ts` — `createPMTilesVectorLayer`, wraps `MVTLayer` for PMTiles archives
- `src/components/FeatureTooltip/FeatureTooltip.tsx` — cursor-following tooltip
- `src/components/MapLegend/types.ts` — `CategoryEntry` type for categorical legends
