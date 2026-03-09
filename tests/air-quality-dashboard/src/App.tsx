import { useEffect, useMemo, useState } from "react";
import { Box, Text } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import type { LayersList } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MapLegend,
  FeatureTooltip,
  PixelInspector,
  createCOGLayer,
  createGeoJSONLayer,
  useFeatureState,
  usePixelInspector,
  useColorScale,
  type STACItem
} from "@maptool/core";

import {
  fetchLatestNO2Item,
  buildVedaTileUrl,
  getCOGAssetUrl,
  VEDA_RASTER_BASE
} from "./veda-stac";

const EARTHQUAKE_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

const INITIAL_VIEW = {
  longitude: -30,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const NO2_DOMAIN: [number, number] = [0, 15000000000000000];
const MAG_DOMAIN: [number, number] = [0, 7];

function App() {
  const [no2Item, setNo2Item] = useState<STACItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { hoveredFeature, hoverCoordinates, onHover, getCursor } =
    useFeatureState();

  const no2ColorScale = useColorScale({
    domain: NO2_DOMAIN,
    colormap: "RdBu",
    steps: 8
  });

  const magColorScale = useColorScale({
    domain: MAG_DOMAIN,
    colormap: "YlOrRd",
    steps: 8
  });

  const cogUrl = no2Item ? getCOGAssetUrl(no2Item) : "";

  const pixelInspector = usePixelInspector({
    baseUrl: VEDA_RASTER_BASE,
    cogUrl,
    enabled: !!cogUrl
  });

  useEffect(() => {
    fetchLatestNO2Item()
      .then(setNo2Item)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tileUrl = useMemo(
    () => (no2Item ? buildVedaTileUrl(no2Item.id) : null),
    [no2Item]
  );

  const no2Colors = useMemo(
    () => [...no2ColorScale.colors].reverse(),
    [no2ColorScale.colors]
  );

  const layers = useMemo(
    () =>
      [
        tileUrl &&
          createCOGLayer({
            id: "no2-layer",
            tileUrl,
            opacity: 0.7
          }),
        createGeoJSONLayer({
          id: "earthquakes",
          data: EARTHQUAKE_URL,
          colorProperty: "mag",
          colorMapping: {
            type: "continuous",
            domain: MAG_DOMAIN,
            colormap: "YlOrRd"
          },
          fillOpacity: 180,
          pointRadius: 4,
          lineWidth: 0
        })
      ].filter(Boolean) as unknown as LayersList,
    [tileUrl]
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
        onHover={(info: any) => {
          onHover(info);
          if (info.coordinate) {
            pixelInspector.inspect(info.coordinate[0], info.coordinate[1]);
          } else {
            pixelInspector.clear();
          }
        }}
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
          Loading data...
        </Box>
      )}

      <PixelInspector
        value={pixelInspector.value}
        isLoading={pixelInspector.isLoading}
        position="top-right"
      />

      {hoveredFeature && hoverCoordinates && (
        <FeatureTooltip x={hoverCoordinates.x} y={hoverCoordinates.y}>
          <Box bg="white" p={2} borderRadius="md" boxShadow="md" fontSize="sm">
            <Text fontWeight="bold" mb={1}>Earthquake</Text>
            <Text>Magnitude: {(hoveredFeature as any).properties?.mag?.toFixed(1)}</Text>
            <Text>Location: {(hoveredFeature as any).properties?.place}</Text>
            <Text>
              Time:{" "}
              {new Date((hoveredFeature as any).properties?.time).toLocaleString()}
            </Text>
          </Box>
        </FeatureTooltip>
      )}

      <MapLegend
        layers={[
          {
            type: "continuous",
            id: "no2-layer",
            title: "NO\u2082 (molecules/cm\u00B2)",
            domain: NO2_DOMAIN,
            colors: no2Colors,
            ticks: 5,
            tickFormat: ".2e"
          },
          {
            type: "continuous",
            id: "earthquakes",
            title: "Earthquake Magnitude",
            domain: MAG_DOMAIN,
            colors: magColorScale.colors,
            ticks: 5
          }
        ]}
        position="bottom-left"
      />
    </Box>
  );
}

export default App;
