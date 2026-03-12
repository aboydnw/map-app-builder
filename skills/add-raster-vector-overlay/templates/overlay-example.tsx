// Complete example: COG raster layer + GeoJSON vector overlay with dual legend,
// feature interaction, and tooltips. Replace placeholder URLs with real data sources.

import { useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import {
  createCOGLayer,
  createGeoJSONLayer,
  useTitiler,
  useColorScale,
  useFeatureState,
  FeatureTooltip,
  MapLegend,
} from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

const CATEGORIES: CategoryEntry[] = [
  { value: "good", color: "#4CAF50", label: "Good" },
  { value: "moderate", color: "#FFC107", label: "Moderate" },
  { value: "unhealthy", color: "#F44336", label: "Unhealthy" },
];

export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const featureState = useFeatureState();

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: "YOUR_COG_URL_HERE",
    colormap: "RdYlGn",
    rescale: [0, 0.0005],
  });

  const colorScale = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: "RdYlGn",
    steps: 8,
  });

  const stationLayer = useMemo(
    () =>
      createGeoJSONLayer({
        id: "stations",
        data: "YOUR_GEOJSON_URL_HERE",
        colorProperty: "aqi_category",
        colorMapping: { type: "categorical", categories: CATEGORIES },
        pointRadius: 6,
      }),
    []
  );

  // Raster first (bottom), vector second (top) — deck.gl draws in array order
  const layers = useMemo(() => {
    const result = [];
    if (titiler.tileUrl) {
      result.push(createCOGLayer({ id: "no2-raster", tileUrl: titiler.tileUrl }));
    }
    result.push(stationLayer);
    return result;
  }, [titiler.tileUrl, stationLayer]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        onHover={featureState.onHover}
        onClick={featureState.onClick}
        getCursor={featureState.getCursor}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      {featureState.hoveredFeature && featureState.hoverCoordinates && (
        <FeatureTooltip
          x={featureState.hoverCoordinates.x}
          y={featureState.hoverCoordinates.y}
        >
          <strong>
            {String(featureState.hoveredFeature.properties?.station_name ?? "Station")}
          </strong>
          <div>AQI: {String(featureState.hoveredFeature.properties?.aqi_value)}</div>
          <div>Category: {String(featureState.hoveredFeature.properties?.aqi_category)}</div>
        </FeatureTooltip>
      )}

      {titiler.rescaleRange && (
        <MapLegend
          layers={[
            {
              type: "continuous",
              id: "no2-raster",
              title: "NO\u2082 Concentration",
              unit: "mol/m\u00B2",
              domain: titiler.rescaleRange,
              colors: colorScale.colors,
              ticks: 5,
            },
            {
              type: "categorical",
              id: "stations",
              title: "Air Quality Stations",
              categories: CATEGORIES,
              shape: "circle",
            },
          ]}
          position="bottom-left"
          collapsible
        />
      )}

      {titiler.loading && (
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow text-sm">
          Loading...
        </div>
      )}
      {titiler.error && (
        <div className="absolute top-4 left-4 bg-red-50 text-red-700 p-2 rounded shadow text-sm">
          {titiler.error}
        </div>
      )}
    </div>
  );
}
