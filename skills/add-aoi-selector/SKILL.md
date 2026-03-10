# Skill: Add an AOI Selector

## When to use
When users need to define an area of interest on the map — for example, to spatially filter STAC search results, clip raster statistics, or scope a data download. Supports file upload of GeoJSON polygons and an optional draw mode toggle for integration with terra-draw.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (AOISelector uses Chakra's `Box`, `HStack`, `Text`)
- For draw-on-map functionality: `npm install terra-draw` (optional — the component works without it for file-upload-only use)

## Steps

### 1. Import the component

```tsx
import { AOISelector } from "@maptool/core";
import type { Polygon } from "geojson";
```

### 2. Set up AOI state

```tsx
import { useState } from "react";

const [aoi, setAOI] = useState<Polygon | null>(null);
const [drawActive, setDrawActive] = useState(false);
```

### 3. Render the AOISelector (file upload only)

For a minimal setup with only file upload (no drawing):

```tsx
<div style={{ width: "100%", height: "100%", position: "relative" }}>
  <DeckGL viewState={viewState} layers={layers} onViewStateChange={...}>
    <Map mapStyle="..." />
  </DeckGL>
  <AOISelector
    onAOIChange={setAOI}
    currentAOI={aoi}
    position="top-right"
  />
</div>
```

Users can click "Upload" to load a `.geojson` or `.json` file. The component accepts `Polygon`, `Feature<Polygon>`, or `FeatureCollection` (extracts the first polygon feature).

### 4. Add draw mode toggle (optional)

To enable the "Draw AOI" button, pass `onToggle` and `active`:

```tsx
<AOISelector
  onAOIChange={setAOI}
  currentAOI={aoi}
  active={drawActive}
  onToggle={() => setDrawActive((v) => !v)}
  position="top-right"
/>
```

The component only provides the toggle button UI. You must wire `drawActive` to an actual drawing library like terra-draw:

```tsx
import { TerraDraw, TerraDrawMapLibreGLAdapter, TerraDrawRectangleMode } from "terra-draw";

// Initialize terra-draw (once, after the map loads)
const draw = new TerraDraw({
  adapter: new TerraDrawMapLibreGLAdapter({ map: mapRef.current }),
  modes: [new TerraDrawRectangleMode()],
});

// Start/stop drawing based on toggle state
useEffect(() => {
  if (drawActive) {
    draw.start();
    draw.setMode("rectangle");
  } else {
    draw.stop();
  }
}, [drawActive]);

// Listen for completed shapes
useEffect(() => {
  const handler = (ids: string[]) => {
    const snapshot = draw.getSnapshot();
    const feature = snapshot.find((f) => ids.includes(f.id as string));
    if (feature?.geometry.type === "Polygon") {
      setAOI(feature.geometry as Polygon);
      setDrawActive(false);
    }
  };
  draw.on("finish", handler);
  return () => draw.off("finish", handler);
}, []);
```

### 5. Use the AOI to filter data

Pass the polygon to STAC search or other queries:

```tsx
const stac = useSTAC({
  catalogUrl: "https://planetarycomputer.microsoft.com/api/stac/v1",
  collectionId: "sentinel-2-l2a",
  intersects: aoi ?? undefined,
  datetime: "2024-06-01/2024-06-30",
});
```

### 6. Verify

Run `npm run dev` and confirm:
- [ ] The AOI selector appears in the chosen corner
- [ ] Uploading a GeoJSON file sets the AOI and shows "AOI active"
- [ ] Clicking "Clear" removes the AOI
- [ ] If draw mode is enabled, the toggle button highlights when active
- [ ] Data queries update to reflect the AOI bounds

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onAOIChange` | `(geojson: Polygon \| null) => void` | required | Called with the polygon or `null` on clear |
| `currentAOI` | `Polygon \| null` | — | Current AOI polygon (shows "AOI active" badge and clear button) |
| `active` | `boolean` | `false` | Whether draw mode is currently active |
| `onToggle` | `() => void` | — | Called when "Draw AOI" button is clicked. Omit to hide the draw button entirely. |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"top-right"` | Corner placement on the map |

## Common mistakes
- **Expecting the component to handle drawing** — AOISelector is a UI shell only. The "Draw AOI" button toggles state, but you must integrate a drawing library (terra-draw) separately.
- **Uploading non-polygon GeoJSON** — the component's `extractPolygon` helper only supports `Polygon` geometry. `MultiPolygon`, `LineString`, and `Point` geometries are silently ignored.
- **Not passing `currentAOI`** — without this prop, the "Clear" button and "AOI active" badge won't appear, even if you have an AOI in state.

## Reference files
- `src/components/AOISelector/AOISelector.tsx` — component source, `AOISelectorProps`
