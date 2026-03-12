// Complete globe setup: GlobeView + ocean background + Natural Earth land layer.
// Replace `yourDataLayers` with your actual deck.gl data layers.

import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView } from "@deck.gl/core";
import { SolidPolygonLayer, GeoJsonLayer } from "@deck.gl/layers";

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
};

type ViewState = typeof INITIAL_VIEW;

const LAND_GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";

export default function GlobeApp() {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);

  const views = new GlobeView({ id: "globe", controller: true });

  const backgroundLayer = new SolidPolygonLayer({
    id: "background",
    data: [
      [
        [-180, 90],
        [0, 90],
        [180, 90],
        [180, -90],
        [0, -90],
        [-180, -90],
      ],
    ],
    getPolygon: (d: number[][]) => d,
    filled: true,
    getFillColor: [14, 36, 62],
  });

  const landLayer = new GeoJsonLayer({
    id: "land",
    data: LAND_GEOJSON_URL,
    filled: true,
    stroked: true,
    getFillColor: [40, 80, 120],
    getLineColor: [100, 150, 200],
    getLineWidth: 1,
    lineWidthUnits: "pixels" as const,
  });

  const yourDataLayers: never[] = []; // Replace with your data layers

  return (
    <div style={{ width: "100%", height: "100%", background: "#0a1929" }}>
      <DeckGL
        views={views}
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as ViewState)
        }
        layers={[backgroundLayer, landLayer, ...yourDataLayers]}
      />
    </div>
  );
}
