# Skill: Add a PMTiles Vector Layer with Styling and Tooltips

## When to use
When you have a vector PMTiles archive (e.g. Overture Maps buildings, admin boundaries, infrastructure) and want to display it with color mapping and feature interaction.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `pmtiles` and `@tanstack/react-query` installed (see `setup-map-app` skill, PMTiles section)
- A publicly accessible vector PMTiles URL

## Steps

### 1. Import maptool pieces

```tsx
import {
  createPMTilesProtocol,
  createPMTilesVectorLayer,
  usePMTiles,
  useFeatureState,
  FeatureTooltip,
  MapLegend,
} from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";
```

### 2. Register the PMTiles protocol

```tsx
import { useEffect } from "react";
import { addProtocol, removeProtocol } from "maplibre-gl";

useEffect(() => {
  const { protocol, cleanup } = createPMTilesProtocol();
  addProtocol("pmtiles", protocol.tile);
  return () => {
    removeProtocol("pmtiles");
    cleanup();
  };
}, []);
```

### 3. Fetch metadata to understand the data

```tsx
const PMTILES_URL = "https://example.com/overture-buildings.pmtiles";

const { metadata, isLoading } = usePMTiles({ url: PMTILES_URL });
```

The metadata includes a `layers` array listing the vector layer names inside the archive and `tileType` confirming it's `"vector"`. Use `metadata.layers` to verify which layer names are available for styling.

### 4. Create a vector layer with categorical colors

```tsx
const categories: CategoryEntry[] = [
  { value: "residential", color: "#4CAF50", label: "Residential" },
  { value: "commercial", color: "#2196F3", label: "Commercial" },
  { value: "industrial", color: "#FF9800", label: "Industrial" },
];

const layers = useMemo(() => {
  if (!metadata) return [];
  return [
    createPMTilesVectorLayer({
      id: "buildings",
      url: PMTILES_URL,
      colorProperty: "class",
      colorMapping: { type: "categorical", categories },
      fillOpacity: 180,
      lineWidth: 1,
    }),
  ];
}, [metadata]);
```

For continuous data:
```tsx
const layer = createPMTilesVectorLayer({
  id: "population",
  url: PMTILES_URL,
  colorProperty: "pop_density",
  colorMapping: { type: "continuous", domain: [0, 5000], colormap: "viridis" },
});
```

### 5. Add feature interaction and tooltips

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
    <strong>{String(featureState.hoveredFeature.properties?.name ?? "Feature")}</strong>
    <div>Class: {String(featureState.hoveredFeature.properties?.class)}</div>
  </FeatureTooltip>
)}
```

### 6. Add a legend

```tsx
<MapLegend
  layers={[{
    type: "categorical",
    id: "buildings",
    title: "Building Type",
    categories,
    shape: "square",
  }]}
  position="bottom-left"
  collapsible
/>
```

### 7. Verify

Run `npm run dev` and confirm:
- [ ] Vector features render on the map with correct colors
- [ ] Hovering highlights features and changes the cursor
- [ ] Tooltip appears with feature properties
- [ ] Legend reflects the color scheme
- [ ] Zooming in reveals more detail at higher zoom levels

## Common mistakes
- **Not registering the PMTiles protocol** — same as raster PMTiles, the protocol must be registered before any layers load. See step 2.
- **Manually prefixing `pmtiles://` to the URL** — `createPMTilesVectorLayer` automatically adds the `pmtiles://` prefix if it's missing. You can pass either the raw HTTPS URL or the prefixed URL.
- **Wrong `colorProperty` name** — vector PMTiles properties depend on how the archive was built. Use the metadata `layers` field and inspect sample features in the console to find valid property names.
- **Forgetting `pickable: true`** — enabled by default in `createPMTilesVectorLayer`, but if you override it to `false`, hover/click won't fire.
- **Confusing with raw MVT endpoints** — `createPMTilesVectorLayer` wraps deck.gl's `MVTLayer` and handles the PMTiles URL scheme. For raw `{z}/{x}/{y}.pbf` MVT endpoints, use `MVTLayer` directly (see `add-vector-layer` skill).
- **Large archives causing slow initial load** — PMTiles uses HTTP range requests, so the initial metadata fetch is fast. But very dense datasets at low zoom levels can be slow to render. Use `minZoom` on the layer to prevent rendering at zoom levels with too many features.

## Reference files
- `src/utils/pmtiles.ts` — `createPMTilesProtocol`, `fetchPMTilesMetadata`, `PMTilesMetadata`
- `src/hooks/usePMTiles.ts` — `usePMTiles` hook
- `src/layers/PMTilesVectorLayer.ts` — `createPMTilesVectorLayer`, `PMTilesVectorLayerOptions`
- `src/utils/color-accessors.ts` — `buildContinuousAccessor`, `buildCategoricalAccessor` used internally
- `src/layers/GeoJSONLayer.ts` — `ColorMapping`, `ContinuousColorMapping`, `CategoricalColorMapping` types
