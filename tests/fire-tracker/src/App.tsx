import { useEffect, useMemo, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import type { LayersList } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MapLegend,
  FeatureTooltip,
  createGeoJSONLayer,
  useFeatureState,
  useColorScale
} from "@maptool/core";

import { fetchFIRMSData, type FireCollection } from "./firms-data";

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const BRIGHTNESS_DOMAIN: [number, number] = [300, 500];

function App() {
  const [data, setData] = useState<FireCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hoveredFeature, hoverCoordinates, onHover, getCursor } =
    useFeatureState();

  const colorScale = useColorScale({
    domain: BRIGHTNESS_DOMAIN,
    colormap: "YlOrRd",
    steps: 8
  });

  useEffect(() => {
    fetchFIRMSData()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const layers = useMemo(
    () =>
      data
        ? ([
            createGeoJSONLayer({
              id: "fires",
              data,
              colorProperty: "bright_ti4",
              colorMapping: {
                type: "continuous",
                domain: BRIGHTNESS_DOMAIN,
                colormap: "YlOrRd"
              },
              fillOpacity: 180,
              pointRadius: 3,
              lineWidth: 0
            })
          ] as unknown as LayersList)
        : [],
    [data]
  );

  if (error) {
    return <Box p={5} color="red.500">Error: {error}</Box>;
  }

  return (
    <Box w="100%" h="100%" position="relative">
      <DeckGL
        initialViewState={INITIAL_VIEW}
        layers={layers}
        controller
        onHover={onHover as any}
        getCursor={getCursor as any}
      >
        <Map reuseMaps mapStyle={BASEMAP_STYLE} />
      </DeckGL>

      {loading && (
        <Box
          position="absolute"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          bg="rgba(0,0,0,0.7)"
          color="white"
          px={4}
          py={2}
          rounded="lg"
          zIndex={10}
        >
          Loading FIRMS data...
        </Box>
      )}

      {hoveredFeature && hoverCoordinates && (
        <FeatureTooltip x={hoverCoordinates.x} y={hoverCoordinates.y}>
          <Box bg="white" p={2} borderRadius="md" boxShadow="md" fontSize="sm">
            <Text fontWeight="bold" mb={1}>Active Fire</Text>
            <Text>Brightness: {(hoveredFeature as any).properties?.bright_ti4?.toFixed(1)} K</Text>
            <Text>Confidence: {(hoveredFeature as any).properties?.confidence}</Text>
            <Text>FRP: {(hoveredFeature as any).properties?.frp?.toFixed(1)} MW</Text>
            <Text>Date: {(hoveredFeature as any).properties?.acq_date}</Text>
            <Text>Day/Night: {(hoveredFeature as any).properties?.daynight === "D" ? "Day" : "Night"}</Text>
          </Box>
        </FeatureTooltip>
      )}

      <MapLegend
        layers={[
          {
            type: "continuous",
            id: "fires",
            title: "Brightness Temp (K)",
            domain: BRIGHTNESS_DOMAIN,
            colors: colorScale.colors,
            ticks: 5
          }
        ]}
        position="bottom-left"
      />
    </Box>
  );
}

export default App;
