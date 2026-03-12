// PMTiles raster layer with metadata-driven bounds fitting and manual legend.
// Replace PMTILES_URL and legend categories/colors to match your dataset.

import { useEffect, useMemo, useState } from "react";
import { Map } from "react-map-gl/maplibre";
import DeckGL from "@deck.gl/react";
import { WebMercatorViewport } from "@deck.gl/core";
import type { MapViewState } from "@deck.gl/core";
import { addProtocol, removeProtocol } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createPMTilesProtocol,
  createPMTilesRasterLayer,
  usePMTiles,
  MapLegend,
} from "@maptool/core";

const PMTILES_URL = "https://example.com/land-cover-2023.pmtiles";

const INITIAL_VIEW: MapViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

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

  const { metadata, isLoading, error } = usePMTiles({ url: PMTILES_URL });

  useEffect(() => {
    if (!metadata?.bounds) return;
    const [minLng, minLat, maxLng, maxLat] = metadata.bounds;
    const vp = new WebMercatorViewport({ width: 800, height: 600 });
    const fitted = vp.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      { padding: 40 }
    );
    setViewState((prev) => ({ ...prev, ...fitted }));
  }, [metadata]);

  const layers = useMemo(() => {
    if (!metadata) return [];
    return [
      createPMTilesRasterLayer({
        id: "land-cover",
        url: `pmtiles://${PMTILES_URL}`,
        bounds: metadata.bounds,
        minZoom: metadata.minZoom,
        maxZoom: metadata.maxZoom,
      }),
    ];
  }, [metadata]);

  if (error) return <div>Error loading PMTiles: {error.message}</div>;
  if (isLoading) return <div>Loading...</div>;

  return (
    <DeckGL
      viewState={viewState}
      onViewStateChange={({ viewState: vs }) =>
        setViewState(vs as MapViewState)
      }
      layers={layers}
      controller
    >
      <Map mapStyle={MAP_STYLE} />
      <MapLegend
        layers={[
          {
            type: "categorical",
            id: "land-cover",
            title: "Land Cover 2023",
            categories: [
              { value: "forest", color: "#1a9850", label: "Forest" },
              { value: "cropland", color: "#fee08b", label: "Cropland" },
              { value: "urban", color: "#d73027", label: "Urban" },
              { value: "water", color: "#4575b4", label: "Water" },
            ],
            shape: "square",
          },
        ]}
        position="bottom-left"
        collapsible
      />
    </DeckGL>
  );
}
