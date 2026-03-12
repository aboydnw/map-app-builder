// GeoJSON layer with continuous color mapping.
// Adjust colorProperty, domain, and colormap to match your dataset.

import { createGeoJSONLayer } from "@maptool/core";

const layer = createGeoJSONLayer({
  id: "temperature",
  data: "https://example.com/stations.geojson",
  colorProperty: "temp_c",
  colorMapping: { type: "continuous", domain: [-10, 40], colormap: "coolwarm" },
});
