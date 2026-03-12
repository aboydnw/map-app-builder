// Complete example showing useTitiler + useColorScale + createCOGLayer + MapLegend.
// Replace YOUR_COG_URL_HERE with an actual COG URL.

import { useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import {
  MapLegend,
  createCOGLayer,
  useColorScale,
  useTitiler,
} from "@maptool/core";
import "maplibre-gl/dist/maplibre-gl.css";

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

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: "YOUR_COG_URL_HERE",
    colormap: "viridis",
  });

  const colorScale = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: "viridis",
    steps: 8,
  });

  const layers = useMemo(
    () =>
      titiler.tileUrl
        ? [createCOGLayer({ id: "my-cog", tileUrl: titiler.tileUrl })]
        : [],
    [titiler.tileUrl]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      {titiler.rescaleRange && (
        <MapLegend
          layers={[{
            type: "continuous",
            id: "my-cog",
            title: "My Data Layer",
            unit: "m",
            domain: titiler.rescaleRange,
            colors: colorScale.colors,
            ticks: 5,
          }]}
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
