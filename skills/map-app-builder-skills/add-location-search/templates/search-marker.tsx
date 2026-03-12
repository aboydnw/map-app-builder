// Search marker — ScatterplotLayer that shows a red dot at the searched location.
// Add searchMarker state to your App, set it in handleLocationSelect, and include markerLayer in your layers array.

import { useState } from "react";
import { ScatterplotLayer } from "@deck.gl/layers";

// Add this state to your App component:
const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);

// In your handleLocationSelect, add:
// setSearchMarker([lng, lat]);

// Add this layer to your layers array:
const markerLayer = searchMarker
  ? new ScatterplotLayer({
      id: "search-marker",
      data: [{ position: searchMarker }],
      getPosition: (d) => d.position,
      getRadius: 8,
      getFillColor: [255, 64, 64],
      radiusUnits: "pixels",
      stroked: true,
      getLineColor: [255, 255, 255],
      getLineWidth: 2,
      lineWidthUnits: "pixels",
    })
  : null;

export { markerLayer, searchMarker, setSearchMarker };
