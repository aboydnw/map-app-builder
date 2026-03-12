// PMTiles vector layer with continuous color mapping for numeric properties.
// Replace PMTILES_URL and colorProperty/domain to match your dataset.

import { useEffect, useMemo } from "react";
import { Box, Text } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import type { LayersList } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  createPMTilesProtocol,
  createPMTilesVectorLayer,
  usePMTiles,
  useFeatureState,
  FeatureTooltip,
  MapLegend,
} from "@maptool/core";

const PMTILES_URL =
  "https://data.source.coop/cholmes/overture/overture-buildings.pmtiles";

const INITIAL_VIEW = {
  longitude: -73.98,
  latitude: 40.74,
  zoom: 14,
  pitch: 0,
  bearing: 0,
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const COLOR_DOMAIN: [number, number] = [0, 5000];
const COLORMAP = "viridis";

function App() {
  const { metadata, isLoading } = usePMTiles({ url: PMTILES_URL });
  const { hoveredFeature, hoverCoordinates, onHover, getCursor } =
    useFeatureState();

  useEffect(() => {
    const { protocol, cleanup } = createPMTilesProtocol();
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
      cleanup();
    };
  }, []);

  const layers = useMemo(
    () =>
      metadata
        ? ([
            createPMTilesVectorLayer({
              id: "population",
              url: PMTILES_URL,
              colorProperty: "pop_density",
              colorMapping: {
                type: "continuous",
                domain: COLOR_DOMAIN,
                colormap: COLORMAP,
              },
              fillOpacity: 200,
              lineWidth: 0.5,
            }),
          ] as unknown as LayersList)
        : [],
    [metadata]
  );

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

      {isLoading && (
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
          Loading PMTiles metadata...
        </Box>
      )}

      {hoveredFeature && hoverCoordinates && (
        <FeatureTooltip x={hoverCoordinates.x} y={hoverCoordinates.y}>
          <Box
            bg="white"
            p={2}
            borderRadius="md"
            boxShadow="md"
            fontSize="xs"
            maxW="300px"
          >
            <Text fontWeight="bold" mb={1}>Feature</Text>
            <Text>
              Population density:{" "}
              {String(
                (hoveredFeature as any).properties?.pop_density ?? "N/A"
              )}
            </Text>
          </Box>
        </FeatureTooltip>
      )}

      <MapLegend
        layers={[
          {
            type: "continuous",
            id: "population",
            title: "Population Density",
            domain: COLOR_DOMAIN,
            colormap: COLORMAP,
          },
        ]}
        position="bottom-left"
        collapsible
      />
    </Box>
  );
}

export default App;
