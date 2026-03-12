// DetailsPanel in push mode — resizes the map container via flexbox.
// The parent must use display: flex for push mode to work.

import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { DetailsPanel } from "@maptool/core";
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Record<string, unknown> | null>(null);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex" }}>
      <div style={{ flex: 1, position: "relative" }}>
        <DeckGL
          viewState={viewState}
          layers={[]}
          onClick={(info) => {
            if (info.object) {
              setSelectedFeature(info.object.properties);
              setPanelOpen(true);
            }
          }}
          onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
          controller
        >
          <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
        </DeckGL>
      </div>

      <DetailsPanel
        title="Feature Details"
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        mode="push"
        side="right"
        width={350}
      >
        {selectedFeature && <div>...</div>}
      </DetailsPanel>
    </div>
  );
}
