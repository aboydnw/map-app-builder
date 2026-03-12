// Add this useEffect inside your App component when using PMTiles layers.
// Registers the pmtiles:// protocol with MapLibre so tiles can be fetched
// from PMTiles archives.

import { useEffect } from "react";
import { addProtocol, removeProtocol } from "maplibre-gl";
import { createPMTilesProtocol } from "@maptool/core";

useEffect(() => {
  const { protocol, cleanup } = createPMTilesProtocol();
  addProtocol("pmtiles", protocol.tile);
  return () => {
    removeProtocol("pmtiles");
    cleanup();
  };
}, []);
