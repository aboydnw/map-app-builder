// Example showing usePixelInspector + PixelInspector integration with DeckGL.
// Demonstrates hover-to-inspect, custom formatting, and combined feature interaction.

import { useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  usePixelInspector,
  PixelInspector,
  useFeatureState,
  FeatureTooltip,
  createCOGLayer,
  useTitiler,
} from "@maptool/core";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  const COG_URL = "https://example.com/temperature.tif";

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: COG_URL,
    colormap: "coolwarm",
  });

  const inspector = usePixelInspector({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    cogUrl: COG_URL,
    debounceMs: 150,
  });

  const featureState = useFeatureState();

  const layers = useMemo(
    () =>
      titiler.tileUrl
        ? [createCOGLayer({ id: "temp", tileUrl: titiler.tileUrl })]
        : [],
    [titiler.tileUrl]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        onHover={(info) => {
          featureState.onHover(info);
          if (info.coordinate) {
            inspector.inspect(info.coordinate[0], info.coordinate[1]);
          } else {
            inspector.clear();
          }
        }}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      <PixelInspector
        value={inspector.value}
        isLoading={inspector.isLoading}
        position="top-right"
        formatValue={(bandName, val) => {
          if (bandName === "b1") return `${val.toFixed(1)} °C`;
          return String(val);
        }}
      />

      {featureState.hoveredFeature && featureState.hoverCoordinates && (
        <FeatureTooltip
          x={featureState.hoverCoordinates.x}
          y={featureState.hoverCoordinates.y}
        >
          <div>{String(featureState.hoveredFeature.name)}</div>
        </FeatureTooltip>
      )}
    </div>
  );
}
