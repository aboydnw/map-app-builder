import { useState, useMemo } from "react";
import { Box, Flex, NativeSelect, Text } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import Map from "react-map-gl/maplibre";
import { useTitiler, createCOGLayer, useColorScale, MapLegend, COLORMAPS } from "@maptool/core";
import type { Dataset } from "../types";
import "maplibre-gl/dist/maplibre-gl.css";

const BASEMAPS: Record<string, string> = {
  streets: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

interface RasterMapProps {
  dataset: Dataset;
}

export function RasterMap({ dataset }: RasterMapProps) {
  const [opacity, setOpacity] = useState(0.8);
  const [basemap, setBasemap] = useState("streets");

  const tileUrl = dataset.tile_url;
  const { tileJson, statistics } = useTitiler({ tileUrl });
  const { colorScale, setColormap, colormap } = useColorScale({
    min: statistics?.[0]?.min,
    max: statistics?.[0]?.max,
  });

  const layer = useMemo(() => {
    if (!tileJson) return null;
    return createCOGLayer({
      tileJson,
      opacity,
      colorScale,
    });
  }, [tileJson, opacity, colorScale]);

  const initialViewState = useMemo(() => {
    if (!dataset.bounds) {
      return { longitude: 0, latitude: 0, zoom: 2 };
    }
    const [west, south, east, north] = dataset.bounds;
    return {
      longitude: (west + east) / 2,
      latitude: (south + north) / 2,
      zoom: 3,
    };
  }, [dataset.bounds]);

  return (
    <Box position="relative" w="100%" h="100%">
      <DeckGL
        initialViewState={initialViewState}
        controller
        layers={layer ? [layer] : []}
        views={new MapView({ repeat: true })}
      >
        <Map mapStyle={BASEMAPS[basemap]} />
      </DeckGL>

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

      {tileJson && (
        <Box position="absolute" bottom={3} left={3}>
          <MapLegend
            title={dataset.filename}
            colorScale={colorScale}
          />
        </Box>
      )}

      <Flex
        position="absolute"
        bottom={3}
        right={3}
        bg="white"
        borderRadius="6px"
        shadow="sm"
        p={2}
        direction="column"
        gap={2}
      >
        <Box>
          <Text fontSize="10px" color="brand.textSecondary" fontWeight={500} mb={1}>
            Colormap
          </Text>
          <NativeSelect
            size="xs"
            value={colormap}
            onChange={(e) => setColormap(e.target.value)}
          >
            {COLORMAPS.map((cm) => (
              <option key={cm} value={cm}>{cm}</option>
            ))}
          </NativeSelect>
        </Box>
        <Box>
          <Text fontSize="10px" color="brand.textSecondary" fontWeight={500} mb={1}>
            Opacity
          </Text>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            style={{ width: 80, accentColor: "#CF3F02" }}
          />
        </Box>
      </Flex>
    </Box>
  );
}
