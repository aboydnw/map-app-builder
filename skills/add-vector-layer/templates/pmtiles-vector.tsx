// PMTiles vector layer alternative.
// Requires PMTiles protocol registration (see setup-map-app skill).
// For full setup with metadata fetching, see add-pmtiles-vector-layer skill.

import { createPMTilesVectorLayer } from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";

const categories: CategoryEntry[] = [
  { value: "residential", color: "#4CAF50", label: "Residential" },
  { value: "commercial", color: "#2196F3", label: "Commercial" },
];

const pmtilesLayer = createPMTilesVectorLayer({
  id: "buildings",
  url: "https://example.com/overture-buildings.pmtiles",
  colorProperty: "class",
  colorMapping: { type: "categorical", categories },
});
