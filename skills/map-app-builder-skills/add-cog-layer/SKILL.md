# Skill: Add a COG Layer with Legend

## When to use
When you have a Cloud Optimized GeoTIFF URL and want to visualize it with TiTiler tiles and a color legend.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A running TiTiler instance (see `setup-map-app` skill, step 0)
- `VITE_TITILER_URL` set in `.env` (e.g. `http://localhost:8000`)
- A publicly accessible COG URL

## Template files

| File | Description |
|------|-------------|
| `templates/cog-layer-example.tsx` | Complete App with useTitiler, useColorScale, createCOGLayer, and MapLegend |
| `templates/planetary-computer-tiles.tsx` | Direct tile URL construction for Planetary Computer (no local TiTiler) |

## Steps

### 1. Add a COG layer with legend

See `templates/cog-layer-example.tsx` for the complete integration. The key pieces:

- **`useTitiler` hook** — fetches COG info, band statistics, auto-detects rescale range, and constructs an XYZ tile URL with the colormap applied. To use a fixed domain instead of auto-detection, pass `rescale: [-1, 1]`.
- **`useColorScale` hook** — builds matching legend colors. The `colormap` parameter must match the one passed to `useTitiler`.
- **`createCOGLayer`** — creates the deck.gl TileLayer. Guard against null `tileUrl` with a conditional in `useMemo`.
- **`MapLegend`** — renders the color legend overlay. Place as a sibling to `<DeckGL>` inside the map container.

### 2. Verify

Run `npm run dev` and confirm:
- [ ] Raster tiles load and are visible on the map
- [ ] Legend panel appears in bottom-left with correct colormap gradient
- [ ] Tick labels show the data domain range
- [ ] If `toggler: true` is set, clicking the checkbox hides/shows the layer
- [ ] Collapsing the legend header hides the content

## Alternative: Planetary Computer tiler (no local TiTiler)

For data hosted on Microsoft Planetary Computer, you can skip running your own TiTiler and use PC's built-in tile rendering API. See `templates/planetary-computer-tiles.tsx` for the pattern.

Key differences from local TiTiler:
- No `VITE_TITILER_URL` or Docker needed
- PC handles colormap application server-side via `colormap_name` or custom `colormap` JSON
- You must know the rescale range in advance (no auto-detection from stats)
- Use `nodata` parameter to make nodata pixels transparent (e.g. `nodata=-1`)
- Build legend colors client-side with `useColorScale` to match the `colormap_name`

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
