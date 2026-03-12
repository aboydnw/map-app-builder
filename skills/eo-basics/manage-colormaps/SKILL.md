# Skill: Manage Colormaps and Nodata Transparency

## When to use
When you need to control how raster data maps to colors — choosing colormaps, making zero or nodata values transparent, or building custom colormaps for TiTiler tile URLs.

## Template files

| File | Contents |
|------|----------|
| `templates/custom-colormaps.ts` | Custom colormap with transparent zero, `buildTransparentColormap` function, ColorBrewer-based colormap pattern |
| `templates/color-accessors.ts` | `buildCategoricalAccessor`, `buildContinuousAccessor` usage patterns, `hexToRgba` utility |

## Key concepts

**Rescale + colormap pipeline**: TiTiler rescales raw raster values to bytes (0–255) using the `rescale` parameter, then maps each byte to an RGBA color using the `colormap` (or `colormap_name`) parameter. Pixels matching the `nodata` value are rendered transparent.

**Two colormap parameters** (mutually exclusive):
- `colormap_name` — a built-in TiTiler colormap name (e.g. `ylgnbu`, `viridis`)
- `colormap` — a JSON interval array for custom RGBA mappings, including per-entry alpha control

## Recipes

### Use a built-in colormap

Pass `colormap_name` as a URL parameter. Available names: any matplotlib colormap supported by TiTiler (e.g. `viridis`, `magma`, `inferno`, `plasma`, `ylgnbu`, `rdylgn`, `blues`). Names are lowercase.

### Make zero-value pixels transparent

Built-in colormaps always map byte 0 to an opaque color. To make zero-value pixels transparent (common for precipitation, where 0 = no rain), replace `colormap_name` with a custom `colormap` where the first interval has alpha=0. See `templates/custom-colormaps.ts` for the full pattern.

The `nodata` parameter handles the file's native nodata value (-1 in this case), while the custom colormap's transparent first interval handles the "valid but visually empty" zero values.

### Handle multiple "transparent" values

TiTiler's `nodata` parameter only accepts a single value. When you need multiple values transparent (e.g. both -1 file-nodata and 0 no-rain), combine both strategies:

1. Set `nodata` to the file's native nodata value (handles out-of-coverage pixels)
2. Use a custom `colormap` with alpha=0 for byte 0 (handles valid-but-empty pixels that rescale to 0)

### Build a custom colormap from ColorBrewer stops

The interval format is `[[byte_min, byte_max], [r, g, b, a]]`. Intervals are half-open: `[min, max)`. Divide the 0–255 byte range evenly across your color stops. See `buildTransparentColormap` in `templates/custom-colormaps.ts`.

### Keep legend colors in sync

When using a custom colormap, the `useColorScale` hook still needs the same visual stops. Make sure the colormap name you pass to `useColorScale` matches the colors in your custom colormap.

Note: `colormap_name` in TiTiler URLs is lowercase (`ylgnbu`), while `useColorScale` uses the key from `src/utils/colormaps.ts` (`YlGnBu`).

### Categorical color mapping for vector layers

For vector layers (GeoJSON or PMTiles), use the shared color accessor utilities in `src/utils/color-accessors.ts` instead of TiTiler colormaps. These work at the deck.gl layer level, not through tile server URLs. See `templates/color-accessors.ts` for usage patterns.

These accessors are used internally by `createGeoJSONLayer` and `createPMTilesVectorLayer` when you pass `colorProperty` and `colorMapping`. You only need to call them directly if building custom deck.gl layers.

## Common mistakes
- **Using `colormap_name` when you need per-entry alpha control** — built-in colormaps are fully opaque. Switch to the `colormap` JSON parameter for transparency at specific value ranges.
- **Setting `nodata=nan` expecting it to handle zero values** — `nodata=nan` tells TiTiler to read the file's native nodata from metadata. If the file's nodata is -1, pixels with value 0 still render as the low end of the colormap (often yellow/white). Use a custom colormap with transparent byte 0 instead.
- **Overlapping intervals in custom colormaps** — intervals are `[min, max)` (half-open). Overlapping ranges cause unpredictable color assignment. Ensure each interval's max equals the next interval's min.
- **Forgetting `nodata` when using a custom colormap** — the custom colormap handles rescaled byte values, but the file's native nodata must still be declared via the `nodata` parameter so TiTiler masks those pixels before rescaling.
- **Mismatched colormap casing** — TiTiler built-in names are lowercase (`ylgnbu`), but `useColorScale` uses the keys from `src/utils/colormaps.ts` which are mixed-case (`YlGnBu`).

## Reference files
- `src/utils/colormaps.ts` — built-in colormap hex definitions used by `useColorScale`
- `src/utils/color-accessors.ts` — `hexToRgba`, `buildContinuousAccessor`, `buildCategoricalAccessor` for vector layer styling
- `src/hooks/useTitiler.ts` — auto-constructs tile URLs with `colormap_name`
- `src/utils/titiler.ts` — `buildTileUrl` function
- `tests/precipitation-viewer/src/pc-stac.ts` — working example of custom colormap with transparent zero
