# Skill: Manage Colormaps and Nodata Transparency

## When to use
When you need to control how raster data maps to colors — choosing colormaps, making zero or nodata values transparent, or building custom colormaps for TiTiler tile URLs.

## Key concepts

**Rescale + colormap pipeline**: TiTiler rescales raw raster values to bytes (0–255) using the `rescale` parameter, then maps each byte to an RGBA color using the `colormap` (or `colormap_name`) parameter. Pixels matching the `nodata` value are rendered transparent.

**Two colormap parameters** (mutually exclusive):
- `colormap_name` — a built-in TiTiler colormap name (e.g. `ylgnbu`, `viridis`)
- `colormap` — a JSON interval array for custom RGBA mappings, including per-entry alpha control

## Recipes

### Use a built-in colormap

```ts
const params = new URLSearchParams({
  colormap_name: "viridis",
  rescale: "0,100",
  nodata: "-9999",
});
```

Available built-in names: any matplotlib colormap supported by TiTiler (e.g. `viridis`, `magma`, `inferno`, `plasma`, `ylgnbu`, `rdylgn`, `blues`). Names are lowercase.

### Make zero-value pixels transparent

Built-in colormaps always map byte 0 to an opaque color. To make zero-value pixels transparent (common for precipitation, where 0 = no rain), replace `colormap_name` with a custom `colormap` where the first interval has alpha=0:

```ts
const YLGNBU_TRANSPARENT_ZERO = JSON.stringify([
  [[0, 1], [0, 0, 0, 0]],          // byte 0 → transparent
  [[1, 32], [255, 255, 217, 255]],
  [[32, 64], [237, 248, 177, 255]],
  [[64, 96], [199, 233, 180, 255]],
  [[96, 128], [127, 205, 187, 255]],
  [[128, 160], [65, 182, 196, 255]],
  [[160, 192], [29, 145, 192, 255]],
  [[192, 224], [34, 94, 168, 255]],
  [[224, 256], [37, 52, 148, 255]]
]);

const params = new URLSearchParams({
  colormap: YLGNBU_TRANSPARENT_ZERO,
  rescale: "0,25",
  nodata: "-1",
});
```

The `nodata` parameter handles the file's native nodata value (-1 in this case), while the custom colormap's transparent first interval handles the "valid but visually empty" zero values.

### Handle multiple "transparent" values

TiTiler's `nodata` parameter only accepts a single value. When you need multiple values transparent (e.g. both -1 file-nodata and 0 no-rain), combine both strategies:

1. Set `nodata` to the file's native nodata value (handles out-of-coverage pixels)
2. Use a custom `colormap` with alpha=0 for byte 0 (handles valid-but-empty pixels that rescale to 0)

### Build a custom colormap from ColorBrewer stops

The interval format is `[[byte_min, byte_max], [r, g, b, a]]`. Intervals are half-open: `[min, max)`. Divide the 0–255 byte range evenly across your color stops:

```ts
function buildTransparentColormap(
  stops: [number, number, number][],
): number[][][] {
  const intervals: number[][][] = [[[0, 1], [0, 0, 0, 0]]];
  const step = Math.floor(255 / stops.length);
  stops.forEach((rgb, i) => {
    const lo = Math.max(i * step, 1);
    const hi = i === stops.length - 1 ? 256 : (i + 1) * step;
    intervals.push([[lo, hi], [...rgb, 255]]);
  });
  return intervals;
}
```

### Keep legend colors in sync

When using a custom colormap, the `useColorScale` hook still needs the same visual stops. Make sure the colormap name you pass to `useColorScale` matches the colors in your custom colormap:

```tsx
const colorScale = useColorScale({
  domain: [0, 25],
  colormap: "YlGnBu",  // case-sensitive — matches COLORMAPS keys
  steps: 8,
});
```

Note: `colormap_name` in TiTiler URLs is lowercase (`ylgnbu`), while `useColorScale` uses the key from `src/utils/colormaps.ts` (`YlGnBu`).

## Common mistakes
- **Using `colormap_name` when you need per-entry alpha control** — built-in colormaps are fully opaque. Switch to the `colormap` JSON parameter for transparency at specific value ranges.
- **Setting `nodata=nan` expecting it to handle zero values** — `nodata=nan` tells TiTiler to read the file's native nodata from metadata. If the file's nodata is -1, pixels with value 0 still render as the low end of the colormap (often yellow/white). Use a custom colormap with transparent byte 0 instead.
- **Overlapping intervals in custom colormaps** — intervals are `[min, max)` (half-open). Overlapping ranges cause unpredictable color assignment. Ensure each interval's max equals the next interval's min.
- **Forgetting `nodata` when using a custom colormap** — the custom colormap handles rescaled byte values, but the file's native nodata must still be declared via the `nodata` parameter so TiTiler masks those pixels before rescaling.
- **Mismatched colormap casing** — TiTiler built-in names are lowercase (`ylgnbu`), but `useColorScale` uses the keys from `src/utils/colormaps.ts` which are mixed-case (`YlGnBu`).

## Reference files
- `src/utils/colormaps.ts` — built-in colormap hex definitions used by `useColorScale`
- `src/hooks/useTitiler.ts` — auto-constructs tile URLs with `colormap_name`
- `src/utils/titiler.ts` — `buildTileUrl` function
- `tests/precipitation-viewer/src/pc-stac.ts` — working example of custom colormap with transparent zero
