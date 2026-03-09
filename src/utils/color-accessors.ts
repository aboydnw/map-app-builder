import type { CategoryEntry } from "../components/MapLegend/types";
import { getColormap } from "./colormaps";

export type RGBAColor = [number, number, number, number];

export type ColorAccessor = (f: {
  properties: Record<string, unknown>;
}) => RGBAColor;

/** Converts a hex color string to an RGBA tuple. */
export function hexToRgba(hex: string, alpha = 255): RGBAColor {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
}

/** Builds a color accessor that maps a numeric property to a continuous colormap. */
export function buildContinuousAccessor(
  property: string,
  domain: [number, number],
  colormapName: string,
  alpha: number
): ColorAccessor {
  const palette = getColormap(colormapName);
  const [min, max] = domain;
  const range = max - min || 1;

  return (f) => {
    const val = Number(f.properties[property]);
    if (isNaN(val)) return [0, 0, 0, 0];
    const t = Math.max(0, Math.min(1, (val - min) / range));
    const idx = Math.round(t * (palette.length - 1));
    return hexToRgba(palette[idx], alpha);
  };
}

/** Builds a color accessor that maps a string property to categorical colors. */
export function buildCategoricalAccessor(
  property: string,
  categories: CategoryEntry[],
  fallback: RGBAColor,
  alpha: number
): ColorAccessor {
  const lookup = new Map(
    categories.map((c) => [c.value, hexToRgba(c.color, alpha)])
  );

  return (f) => lookup.get(String(f.properties[property])) ?? fallback;
}
