// MapLibre 3D terrain using Mapterhorn global DEM served as PMTiles.
// Requires PMTiles protocol registration before the map loads.
// The Mapterhorn DEM uses Terrarium encoding (not Mapbox encoding).

import { useEffect, useState } from "react";
import { Map } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import type { MapViewState } from "@deck.gl/core";
import { addProtocol, removeProtocol } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { createPMTilesProtocol } from "@maptool/core";

const TERRAIN_URL = "https://download.mapterhorn.com/planet.pmtiles";

const INITIAL_VIEW: MapViewState = {
  longitude: 7.65,
  latitude: 45.97,
  zoom: 10,
  pitch: 60,
  bearing: -20,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW);

  useEffect(() => {
    const { protocol, cleanup } = createPMTilesProtocol();
    addProtocol("pmtiles", protocol.tile);
    return () => {
      removeProtocol("pmtiles");
      cleanup();
    };
  }, []);

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState: vs }) =>
        setViewState(vs as MapViewState)
      }
      controller
    >
      <Map
        mapStyle={MAP_STYLE}
        terrain={{ source: "terrain-dem", exaggeration: 1.5 }}
        onLoad={(e) => {
          const map = e.target;
          map.addSource("terrain-dem", {
            type: "raster-dem",
            tiles: [`pmtiles://${TERRAIN_URL}/{z}/{x}/{y}`],
            tileSize: 256,
            encoding: "terrarium",
          });
        }}
      />
    </DeckGL>
  );
}
