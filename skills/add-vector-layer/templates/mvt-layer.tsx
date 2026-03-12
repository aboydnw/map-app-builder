// Raw MVT (Mapbox Vector Tiles) layer using deck.gl directly.
// Use this when your tile source serves {z}/{x}/{y}.pbf endpoints.
// Wire onHover/onClick the same way as the feature-interaction template.

import { MVTLayer } from "@deck.gl/geo-layers";

const mvtLayer = new MVTLayer({
  id: "boundaries",
  data: "https://tiles.example.com/{z}/{x}/{y}.pbf",
  getFillColor: [200, 200, 200, 100],
  getLineColor: [0, 0, 0, 255],
  getLineWidth: 1,
  lineWidthUnits: "pixels",
  pickable: true,
});
