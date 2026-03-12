# Skill: Add an AOI Selector

## When to use
When users need to define an area of interest on the map — for example, to spatially filter STAC search results, clip raster statistics, or scope a data download. Supports file upload of GeoJSON polygons and an optional draw mode toggle for integration with terra-draw.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (AOISelector uses Chakra's `Box`, `HStack`, `Text`)
- For draw-on-map functionality: `npm install terra-draw` (optional — the component works without it for file-upload-only use)

## Template files

| File | Description |
|------|-------------|
| `templates/aoi-example.tsx` | Complete App with AOISelector, file upload, and draw toggle |
| `templates/terra-draw-integration.tsx` | terra-draw setup for draw-on-map polygon creation |

## Steps

### 1. Set up the AOISelector

See `templates/aoi-example.tsx` for the complete integration. The component supports two modes:

- **File upload only** — omit `active` and `onToggle` props. Users can upload `.geojson` or `.json` files. The component accepts `Polygon`, `Feature<Polygon>`, or `FeatureCollection` (extracts the first polygon feature).
- **File upload + draw mode** — pass `active` and `onToggle` to show the "Draw AOI" button. The component only provides the toggle button UI — you must wire the drawing library separately.

### 2. Add draw-on-map support (optional)

The `AOISelector` component does not handle drawing itself. See `templates/terra-draw-integration.tsx` for the terra-draw integration that connects `drawActive` state to rectangle drawing and feeds completed polygons back to `setAOI`.

### 3. Use the AOI to filter data

Pass the polygon to STAC search or other queries:
```tsx
const stac = useSTAC({
  catalogUrl: "https://planetarycomputer.microsoft.com/api/stac/v1",
  collectionId: "sentinel-2-l2a",
  intersects: aoi ?? undefined,
  datetime: "2024-06-01/2024-06-30",
});
```

### 4. Verify

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
