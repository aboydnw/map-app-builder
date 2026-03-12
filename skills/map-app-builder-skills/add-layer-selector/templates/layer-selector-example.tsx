// Complete example showing LayerSelector with visibility state management
// and deck.gl layer integration.

import { useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import {
  LayerSelector,
  createPMTilesVectorLayer,
  createCOGLayer,
  createGeoJSONLayer,
} from "@maptool/core";
import type { LayerConfig } from "@maptool/core";
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

  const [visibility, setVisibility] = useState<Record<string, boolean>>({
    buildings: true,
    satellite: true,
    fires: false,
  });

  function handleToggle(id: string) {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  const layerConfigs: LayerConfig[] = [
    { id: "buildings", label: "Buildings", visible: visibility.buildings, color: "#f59e0b" },
    { id: "satellite", label: "Satellite Imagery", visible: visibility.satellite },
    { id: "fires", label: "Fire Detections", visible: visibility.fires, color: "#ef4444" },
  ];

  const layers = useMemo(() => [
    createPMTilesVectorLayer({
      id: "buildings",
      url: "BUILDINGS_URL",
      visible: visibility.buildings,
    }),
    createCOGLayer({
      id: "satellite",
      tileUrl: "SATELLITE_TILE_URL",
      visible: visibility.satellite,
    }),
    createGeoJSONLayer({
      id: "fires",
      data: [],
      visible: visibility.fires,
    }),
  ], [visibility]);

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>
      <LayerSelector
        layers={layerConfigs}
        onToggle={handleToggle}
        position="top-right"
        collapsible
      />
    </div>
  );
}
