// GeoJSON layer with categorical color mapping and legend.
// Replace data URL, colorProperty, and categories to match your dataset.

import { createGeoJSONLayer, MapLegend } from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";

const categories: CategoryEntry[] = [
  { value: "residential", color: "#4CAF50", label: "Residential" },
  { value: "commercial", color: "#2196F3", label: "Commercial" },
  { value: "industrial", color: "#FF9800", label: "Industrial" },
];

const layer = createGeoJSONLayer({
  id: "parcels",
  data: "https://example.com/parcels.geojson",
  colorProperty: "land_use",
  colorMapping: { type: "categorical", categories },
});

const legend = (
  <MapLegend
    layers={[{
      type: "categorical",
      id: "parcels",
      title: "Land Use",
      categories,
      shape: "square",
    }]}
    position="bottom-left"
  />
);
