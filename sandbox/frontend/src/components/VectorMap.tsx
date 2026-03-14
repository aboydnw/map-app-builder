import { useEffect, useRef, useState, useCallback } from "react";
import { Box, NativeSelect } from "@chakra-ui/react";
import maplibregl from "maplibre-gl";
import { config } from "../config";
import type { Dataset } from "../types";
import "maplibre-gl/dist/maplibre-gl.css";

const BASEMAPS: Record<string, string> = {
  streets: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const FILL_COLOR = "#CF3F02";
const LINE_COLOR = "#CF3F02";
const CIRCLE_COLOR = "#CF3F02";

interface VectorMapProps {
  dataset: Dataset;
}

export function VectorMap({ dataset }: VectorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [basemap, setBasemap] = useState("streets");

  const tableName = dataset.pg_table || `sandbox_${dataset.id}`;

  const addVectorLayers = useCallback((map: maplibregl.Map) => {
    const sourceUrl = `${config.vectorTilerUrl}/collections/${tableName}/tiles/{z}/{x}/{y}`;

    map.addSource("vector-data", {
      type: "vector",
      tiles: [sourceUrl],
    });

    map.addLayer({
      id: "vector-fill",
      type: "fill",
      source: "vector-data",
      "source-layer": tableName,
      paint: { "fill-color": FILL_COLOR, "fill-opacity": 0.3 },
    });

    map.addLayer({
      id: "vector-line",
      type: "line",
      source: "vector-data",
      "source-layer": tableName,
      paint: { "line-color": LINE_COLOR, "line-width": 1.5 },
    });

    map.addLayer({
      id: "vector-circle",
      type: "circle",
      source: "vector-data",
      "source-layer": tableName,
      paint: {
        "circle-color": CIRCLE_COLOR,
        "circle-radius": 4,
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1,
      },
    });

    map.on("click", ["vector-fill", "vector-line", "vector-circle"], (e) => {
      if (!e.features?.length) return;
      const props = e.features[0].properties;
      const html = Object.entries(props)
        .map(([k, v]) => `<strong>${k}:</strong> ${v}`)
        .join("<br>");
      new maplibregl.Popup()
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
    });

    map.on("mouseenter", "vector-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "vector-fill", () => {
      map.getCanvas().style.cursor = "";
    });
  }, [tableName]);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAPS[basemap],
      center: dataset.bounds
        ? [(dataset.bounds[0] + dataset.bounds[2]) / 2, (dataset.bounds[1] + dataset.bounds[3]) / 2]
        : [0, 0],
      zoom: dataset.bounds ? 3 : 2,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      addVectorLayers(map);

      if (dataset.bounds) {
        map.fitBounds(
          [
            [dataset.bounds[0], dataset.bounds[1]],
            [dataset.bounds[2], dataset.bounds[3]],
          ],
          { padding: 40 },
        );
      }
    });

    mapRef.current = map;
    return () => map.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataset]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    map.setStyle(BASEMAPS[basemap]);
    map.once("style.load", () => {
      addVectorLayers(map);
    });
  }, [basemap, addVectorLayers]);

  return (
    <Box position="relative" w="100%" h="100%">
      <Box ref={containerRef} w="100%" h="100%" />
      <Box position="absolute" top={3} left={3} bg="white" borderRadius="4px" shadow="sm" p={1}>
        <NativeSelect
          size="xs"
          value={basemap}
          onChange={(e) => setBasemap(e.target.value)}
        >
          <option value="streets">Streets</option>
          <option value="satellite">Satellite</option>
          <option value="dark">Dark</option>
        </NativeSelect>
      </Box>
    </Box>
  );
}
