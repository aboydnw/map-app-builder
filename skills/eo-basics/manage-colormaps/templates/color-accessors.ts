// Color accessor patterns for vector layers (GeoJSON / PMTiles).
// These work at the deck.gl layer level, not through TiTiler tile URLs.
// Source: src/utils/color-accessors.ts

import {
  hexToRgba,
  buildCategoricalAccessor,
  buildContinuousAccessor,
} from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";

// --- hexToRgba: convert hex colors to RGBA tuples for deck.gl ---
const color = hexToRgba("#4CAF50", 200); // [76, 175, 80, 200]

// --- Categorical accessor: map discrete property values to colors ---
const categories: CategoryEntry[] = [
  { value: "forest", color: "#1a9850", label: "Forest" },
  { value: "urban", color: "#d73027", label: "Urban" },
];

const getCategoryColor = buildCategoricalAccessor(
  "land_use", // feature property name
  categories, // category definitions
  [200, 200, 200, 180], // fallback for unmatched values
  180, // alpha for all colors
);

// --- Continuous accessor: interpolate across a colormap ---
const getTemperatureColor = buildContinuousAccessor(
  "temperature", // feature property name
  [-10, 40], // domain [min, max]
  "coolwarm", // colormap name (from src/utils/colormaps.ts)
  200, // alpha
);

// Note: these accessors are used internally by createGeoJSONLayer and
// createPMTilesVectorLayer when you pass colorProperty + colorMapping.
// Call them directly only when building custom deck.gl layers.
