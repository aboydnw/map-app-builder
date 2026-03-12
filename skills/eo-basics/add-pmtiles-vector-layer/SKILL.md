# Skill: Add a PMTiles Vector Layer with Styling and Tooltips

## When to use
When you have a vector PMTiles archive (e.g. Overture Maps buildings, admin boundaries, infrastructure) and want to display it with color mapping and feature interaction.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `pmtiles` and `@tanstack/react-query` installed (see `setup-map-app` skill, PMTiles section)
- A publicly accessible vector PMTiles URL

## Template files

| File | Description |
|------|-------------|
| `templates/pmtiles-vector-example.tsx` | Complete app with categorical colors, tooltip, and legend |
| `templates/continuous-vector.tsx` | Alternative using continuous color mapping for numeric properties |

## Steps

### 1. Register the PMTiles protocol

The MapLibre `pmtiles://` protocol must be registered so the basemap can co-exist with PMTiles sources. Use `createPMTilesProtocol()` in a `useEffect` and clean up on unmount. See `templates/pmtiles-vector-example.tsx` for the full pattern.

### 2. Fetch metadata with `usePMTiles`

Call `usePMTiles({ url })` to fetch the archive's metadata. The returned `metadata` includes a `layers` array listing vector layer names and `tileType` confirming it's `"vector"`. Wait for metadata before creating layers.

### 3. Create a vector layer

Use `createPMTilesVectorLayer()` with a `colorMapping` option:

- **Categorical** — provide a `categories` array of `{ value, color, label }` entries and set `colorProperty` to the feature property name. See `templates/pmtiles-vector-example.tsx`.
- **Continuous** — provide a `domain` (min/max) and `colormap` name. See `templates/continuous-vector.tsx`.

### 4. Add feature interaction and tooltips

Use `useFeatureState()` to get hover/click handlers and cursor logic. Pass them to `<DeckGL>` props. Render `<FeatureTooltip>` when a feature is hovered. Both templates demonstrate this pattern.

### 5. Add a legend

Use `<MapLegend>` with a `layers` array describing each legend entry. Use `type: "categorical"` with a `categories` array, or `type: "continuous"` with `domain` and `colormap`. Both templates include a legend.

### 6. Verify

Run `npm run dev` and confirm:
- [ ] Vector features render on the map with correct colors
- [ ] Hovering highlights features and changes the cursor
- [ ] Tooltip appears with feature properties
- [ ] Legend reflects the color scheme
- [ ] Zooming in reveals more detail at higher zoom levels

## Common mistakes
- **Not registering the PMTiles protocol** — the MapLibre `pmtiles://` protocol must be registered for the basemap to co-exist with PMTiles sources. Note: `createPMTilesVectorLayer` uses deck.gl's `MVTLayer` which loads tiles directly via the PMTiles library — it does **not** use the MapLibre protocol. The protocol registration is only needed if you also use PMTiles sources in MapLibre styles.
- **Using `pmtiles://` prefix in the URL** — pass the raw HTTPS URL (e.g. `https://example.com/data.pmtiles`) to `createPMTilesVectorLayer`. The `pmtiles://` scheme is for MapLibre's protocol handler and is **not understood** by deck.gl's `MVTLayer`. Passing a `pmtiles://` URL will cause "URL scheme not supported" fetch errors.
- **Wrong `colorProperty` name** — vector PMTiles properties depend on how the archive was built. Use the metadata `layers` field and inspect sample features in the console to find valid property names.
- **Forgetting `pickable: true`** — enabled by default in `createPMTilesVectorLayer`, but if you override it to `false`, hover/click won't fire.
- **Confusing with raw MVT endpoints** — `createPMTilesVectorLayer` wraps deck.gl's `MVTLayer`. For raw `{z}/{x}/{y}.pbf` MVT endpoints, use `MVTLayer` directly (see `add-vector-layer` skill).
- **Large archives causing slow initial load** — PMTiles uses HTTP range requests, so the initial metadata fetch is fast. But very dense datasets at low zoom levels can be slow to render. Use `minZoom` on the layer to prevent rendering at zoom levels with too many features.

## Reference files
- `src/utils/pmtiles.ts` — `createPMTilesProtocol`, `fetchPMTilesMetadata`, `PMTilesMetadata`
- `src/hooks/usePMTiles.ts` — `usePMTiles` hook
- `src/layers/PMTilesVectorLayer.ts` — `createPMTilesVectorLayer`, `PMTilesVectorLayerOptions`
- `src/utils/color-accessors.ts` — `buildContinuousAccessor`, `buildCategoricalAccessor` used internally
- `src/layers/GeoJSONLayer.ts` — `ColorMapping`, `ContinuousColorMapping`, `CategoricalColorMapping` types
