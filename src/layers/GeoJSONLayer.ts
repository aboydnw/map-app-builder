import { GeoJsonLayer } from "@deck.gl/layers";
import type { CategoryEntry } from "../components/MapLegend/types";
import type { RGBAColor } from "../utils/color-accessors";
import { buildContinuousAccessor, buildCategoricalAccessor } from "../utils/color-accessors";

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
