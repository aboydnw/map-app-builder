// terra-draw integration for AOISelector draw mode.
// Initialize terra-draw after the map loads, then wire the drawActive
// state to start/stop drawing and listen for completed shapes.

import { useEffect, useState } from "react";
import { TerraDraw, TerraDrawMapLibreGLAdapter, TerraDrawRectangleMode } from "terra-draw";
import type { Polygon } from "geojson";

// --- In your App component: ---

const [aoi, setAOI] = useState<Polygon | null>(null);
const [drawActive, setDrawActive] = useState(false);

// Initialize terra-draw (once, after the map loads)
const draw = new TerraDraw({
  adapter: new TerraDrawMapLibreGLAdapter({ map: mapRef.current }),
  modes: [new TerraDrawRectangleMode()],
});

// Start/stop drawing based on toggle state
useEffect(() => {
  if (drawActive) {
    draw.start();
    draw.setMode("rectangle");
  } else {
    draw.stop();
  }
}, [drawActive]);

// Listen for completed shapes
useEffect(() => {
  const handler = (ids: string[]) => {
    const snapshot = draw.getSnapshot();
    const feature = snapshot.find((f) => ids.includes(f.id as string));
    if (feature?.geometry.type === "Polygon") {
      setAOI(feature.geometry as Polygon);
      setDrawActive(false);
    }
  };
  draw.on("finish", handler);
  return () => draw.off("finish", handler);
}, []);
