// Custom colormap patterns for TiTiler tile URLs.
// Colormaps are JSON interval arrays: [[byte_min, byte_max], [r, g, b, a]]
// Intervals are half-open [min, max). Byte range is 0–255.

// --- Transparent-zero colormap (YlGnBu) ---
// Use when byte 0 should be invisible (e.g. precipitation where 0 = no rain).
// Replaces `colormap_name` with a custom `colormap` parameter.
const YLGNBU_TRANSPARENT_ZERO = JSON.stringify([
  [[0, 1], [0, 0, 0, 0]], // byte 0 -> transparent
  [[1, 32], [255, 255, 217, 255]],
  [[32, 64], [237, 248, 177, 255]],
  [[64, 96], [199, 233, 180, 255]],
  [[96, 128], [127, 205, 187, 255]],
  [[128, 160], [65, 182, 196, 255]],
  [[160, 192], [29, 145, 192, 255]],
  [[192, 224], [34, 94, 168, 255]],
  [[224, 256], [37, 52, 148, 255]],
]);

const params = new URLSearchParams({
  colormap: YLGNBU_TRANSPARENT_ZERO,
  rescale: "0,25",
  nodata: "-1",
});

// --- Build a transparent-zero colormap from any ColorBrewer stops ---
// Pass an array of [r, g, b] stops; byte 0 is always transparent.
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

// Example: RdYlGn with transparent zero
const RD_YL_GN_STOPS: [number, number, number][] = [
  [215, 48, 39],
  [252, 141, 89],
  [254, 224, 139],
  [217, 239, 139],
  [145, 207, 96],
  [26, 152, 80],
];

const rdYlGnColormap = JSON.stringify(buildTransparentColormap(RD_YL_GN_STOPS));
