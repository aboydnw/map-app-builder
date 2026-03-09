import { MVTLayer } from "@deck.gl/geo-layers";
import type { CategoryEntry } from "../components/MapLegend/types";
import type { RGBAColor, ColorAccessor } from "../utils/color-accessors";
import { buildContinuousAccessor, buildCategoricalAccessor } from "../utils/color-accessors";
import type { ContinuousColorMapping, CategoricalColorMapping, ColorMapping } from "./GeoJSONLayer";

export interface PMTilesVectorLayerOptions {
  id: string;
  url: string;
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

/** Creates a deck.gl MVTLayer for vector PMTiles archives. */
export function createPMTilesVectorLayer({
  id,
  url,
  colorProperty,
  colorMapping,
  fillOpacity = 200,
  lineWidth = 1,
  lineColor = [0, 0, 0, 180],
  pointRadius = 5,
  pickable = true,
  visible = true,
  opacity = 1
}: PMTilesVectorLayerOptions) {
  let getFillColor: RGBAColor | ColorAccessor = [0, 128, 255, fillOpacity];

  if (colorProperty && colorMapping) {
    if (colorMapping.type === "continuous") {
      getFillColor = buildContinuousAccessor(
        colorProperty,
        colorMapping.domain,
        colorMapping.colormap ?? "viridis",
        fillOpacity
      );
    } else {
      getFillColor = buildCategoricalAccessor(
        colorProperty,
        colorMapping.categories,
        colorMapping.fallbackColor ?? [200, 200, 200, fillOpacity],
        fillOpacity
      );
    }
  }

  return new MVTLayer({
    id,
    data: url,
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
