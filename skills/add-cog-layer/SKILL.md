# Skill: Add a COG Layer with Legend

## When to use
When you have a Cloud Optimized GeoTIFF URL and want to visualize it with TiTiler tiles and a color legend.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A running TiTiler instance (see `setup-map-app` skill, step 0)
- `VITE_TITILER_URL` set in `.env` (e.g. `http://localhost:8000`)
- A publicly accessible COG URL

## Steps

### 1. Import maptool pieces

```tsx
import { MapLegend, createCOGLayer, useColorScale, useTitiler } from "@maptool/core";
```

### 2. Connect TiTiler

Inside your component:
```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: "YOUR_COG_URL_HERE",
  colormap: "viridis",
});
```

The hook will:
1. Fetch COG info (bounds, zoom levels, band metadata)
2. Fetch band statistics (min, max, percentiles)
3. Auto-detect rescale range from percentile_2/percentile_98
4. Construct an XYZ tile URL with the colormap applied

To use a fixed domain instead of auto-detection, pass `rescale`:
```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: "https://example.com/ndvi.tif",
  colormap: "RdYlGn",
  rescale: [-1, 1],  // overrides auto-detection
});
```

### 3. Build matching legend colors

```tsx
const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: "viridis",  // must match the colormap in useTitiler
  steps: 8,
});
```

### 4. Create layer

```tsx
import { useMemo } from "react";

const layers = useMemo(
  () =>
    titiler.tileUrl
      ? [createCOGLayer({ id: "my-cog", tileUrl: titiler.tileUrl })]
      : [],
  [titiler.tileUrl]
);
```

Pass `layers` to the `<DeckGL>` component's `layers` prop.

### 5. Add legend overlay

Place this inside your map container div, as a sibling to `<DeckGL>`:
```tsx
{titiler.rescaleRange ? (
  <MapLegend
    layers={[{
      type: "continuous",
      id: "my-cog",
      title: "My Data Layer",
      unit: "m",
      domain: titiler.rescaleRange,
      colors: colorScale.colors,
      ticks: 5,
    }]}
    position="bottom-left"
    collapsible
  />
) : null}
```

### 6. Handle loading and error states

```tsx
{titiler.loading ? <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm">Loading...</div> : null}
{titiler.error ? <div className="absolute top-4 left-4 bg-red-50 text-red-700 p-2 rounded shadow text-sm">{titiler.error}</div> : null}
```

### 7. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles load and are visible on the map
- [ ] Legend panel appears in bottom-left with correct colormap gradient
- [ ] Tick labels show the data domain range
- [ ] If `toggler: true` is set, clicking the checkbox hides/shows the layer
- [ ] Collapsing the legend header hides the content

## Common mistakes
- **Passing `bounds` to `createCOGLayer` when you want free panning** — `bounds` sets a tile extent that restricts tile fetching to that area, preventing the user from panning or zooming beyond it. Only pass `bounds` if you intentionally want to lock the viewport to the data extent. Most apps should omit `bounds` so the map is fully interactive and data simply appears where it exists.
- **Not setting `nodata` for transparency** — raster tiles often have nodata values (e.g. `-3`, `-9999`) that should render as transparent. Set `nodata` to the file's native nodata value so those pixels are see-through. For `useTitiler`, TiTiler auto-detects nodata from COG metadata. When constructing tile URLs manually, pass the actual nodata value (e.g. `nodata=-1`). If you also need zero-value pixels transparent (common for precipitation), see the `manage-colormaps` skill for custom colormap techniques.
- **TiTiler not running** — if `VITE_TITILER_URL` is unset or the instance is down, all tile/stats requests will fail
- **Mismatched colormap names** between `useTitiler` and `useColorScale` — legend colors won't match tiles
- **Not guarding null `tileUrl`** before creating the layer — will crash on first render before stats load
- **Private COG URLs** that TiTiler can't access — tiles will 404 silently; the COG must be reachable from where TiTiler is running
- **Using `isLoading` instead of `loading`** — the hook returns `loading`, not `isLoading`

## Reference files
- `src/hooks/useTitiler.ts` — hook source, `UseTitilerOptions` interface
- `src/utils/titiler.ts` — `buildTileUrl` function
- `src/utils/colormaps.ts` — available colormap names: viridis, magma, inferno, plasma, cividis, coolwarm, RdYlGn, RdBu, YlOrRd, Blues, Greens
- `src/layers/COGLayer.ts` — `createCOGLayer` and `COGLayerOptions`
- `src/components/MapLegend/types.ts` — all legend configuration types
