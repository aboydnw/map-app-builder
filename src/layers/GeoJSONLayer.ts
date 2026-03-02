import { GeoJsonLayer } from "@deck.gl/layers";
import type { CategoryEntry } from "../components/MapLegend/types";
import { getColormap } from "../utils/colormaps";

type RGBAColor = [number, number, number, number];

export interface ContinuousColorMapping {
  type: "continuous";
  domain: [number, number];
  colormap?: string;
}

export interface CategoricalColorMapping {
  type: "categorical";
  categories: CategoryEntry[];
  fallbackColor?: RGBAColor;
}

export type ColorMapping = ContinuousColorMapping | CategoricalColorMapping;

export interface GeoJSONLayerOptions {
  id: string;
  data: string | GeoJSON.FeatureCollection | GeoJSON.Feature[];
  colorProperty?: string;
  colorMapping?: ColorMapping;
  fillOpacity?: number;
  lineWidth?: number;
  lineColor?: RGBAColor;
  pointRadius?: number;
  pickable?: boolean;
  visible?: boolean;
  opacity?: number;
}

function hexToRgba(hex: string, alpha = 255): RGBAColor {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
}

function buildContinuousAccessor(
  property: string,
  domain: [number, number],
  colormapName: string,
  alpha: number
): (f: { properties: Record<string, unknown> }) => RGBAColor {
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

function buildCategoricalAccessor(
  property: string,
  categories: CategoryEntry[],
  fallback: RGBAColor,
  alpha: number
): (f: { properties: Record<string, unknown> }) => RGBAColor {
  const lookup = new Map(categories.map((c) => [c.value, hexToRgba(c.color, alpha)]));

  return (f) => lookup.get(String(f.properties[property])) ?? fallback;
}

export function createGeoJSONLayer({
  id,
  data,
  colorProperty,
  colorMapping,
  fillOpacity = 200,
  lineWidth = 1,
  lineColor = [0, 0, 0, 180],
  pointRadius = 5,
  pickable = true,
  visible = true,
  opacity = 1
}: GeoJSONLayerOptions) {
  let getFillColor: RGBAColor | ((f: { properties: Record<string, unknown> }) => RGBAColor) = [0, 128, 255, fillOpacity];

  if (colorProperty && colorMapping) {
    if (colorMapping.type === "continuous") {
      getFillColor = buildContinuousAccessor(colorProperty, colorMapping.domain, colorMapping.colormap ?? "viridis", fillOpacity);
    } else {
      getFillColor = buildCategoricalAccessor(colorProperty, colorMapping.categories, colorMapping.fallbackColor ?? [200, 200, 200, fillOpacity], fillOpacity);
    }
  }

  return new GeoJsonLayer({
    id,
    data,
    getFillColor: getFillColor as any,
    getLineColor: lineColor,
    getLineWidth: lineWidth,
    getPointRadius: pointRadius,
    lineWidthUnits: "pixels",
    pointRadiusUnits: "pixels",
    pickable,
    visible,
    opacity,
    autoHighlight: pickable,
    highlightColor: [255, 255, 0, 100]
  });
}
