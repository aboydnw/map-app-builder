// DetailsPanel in overlay mode — floats on top of the map with slide-in animation.
// Requires the map container to have position: relative.

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

  function handleFeatureClick(feature: Record<string, unknown>) {
    setSelectedFeature(feature);
    setPanelOpen(true);
  }

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <DeckGL
        viewState={viewState}
        layers={[]}
        onClick={(info) => {
          if (info.object) handleFeatureClick(info.object.properties);
        }}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      <DetailsPanel
        title="Feature Details"
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        side="right"
        width={350}
      >
        {selectedFeature && (
          <div>
            {Object.entries(selectedFeature).map(([key, val]) => (
              <div key={key} style={{ marginBottom: 8 }}>
                <strong>{key}:</strong> {String(val)}
              </div>
            ))}
          </div>
        )}
      </DetailsPanel>
    </div>
  );
}
