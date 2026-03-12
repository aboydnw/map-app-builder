// Complete example showing AOISelector with file upload and draw toggle,
// plus using the AOI to filter a STAC search.

import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { AOISelector } from "@maptool/core";
import type { Polygon } from "geojson";
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
  const [aoi, setAOI] = useState<Polygon | null>(null);
  const [drawActive, setDrawActive] = useState(false);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={[]}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      <AOISelector
        onAOIChange={setAOI}
        currentAOI={aoi}
        active={drawActive}
        onToggle={() => setDrawActive((v) => !v)}
        position="top-right"
      />
    </div>
  );
}
