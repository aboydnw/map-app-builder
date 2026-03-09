import { useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import type { LayersList } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  CompareSwipe,
  MapLegend,
  createCOGLayer,
  type CategoryEntry
} from "@maptool/core";

import { fetchLULCItems, buildLULCTileUrl } from "./pc-lulc";

const INITIAL_VIEW = {
  longitude: -55,
  latitude: -5,
  zoom: 8,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const LULC_CATEGORIES: CategoryEntry[] = [
  { value: "No Data", color: "#FFFFFF", label: "No Data" },
  { value: "Water", color: "#419BDF", label: "Water" },
  { value: "Trees", color: "#397D49", label: "Trees" },
  { value: "Flooded Vegetation", color: "#7A87C6", label: "Flooded Vegetation" },
  { value: "Crops", color: "#E49635", label: "Crops" },
  { value: "Built Area", color: "#E04006", label: "Built Area" },
  { value: "Bare Ground", color: "#A59B8F", label: "Bare Ground" },
  { value: "Snow/Ice", color: "#B39FE1", label: "Snow/Ice" },
  { value: "Clouds", color: "#7B7B7B", label: "Clouds" },
  { value: "Rangeland", color: "#88B053", label: "Rangeland" }
];

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [tileUrl2020, setTileUrl2020] = useState<string | null>(null);
  const [tileUrl2023, setTileUrl2023] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLULCItems(INITIAL_VIEW.longitude, INITIAL_VIEW.latitude)
      .then(({ item2020, item2023 }) => {
        if (item2020) setTileUrl2020(buildLULCTileUrl(item2020.id));
        if (item2023) setTileUrl2023(buildLULCTileUrl(item2023.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const leftLayers = useMemo(
    () =>
      tileUrl2020
        ? ([
            createCOGLayer({ id: "lulc-2020", tileUrl: tileUrl2020, opacity: 0.9 })
          ] as unknown as LayersList)
        : [],
    [tileUrl2020]
  );

  const rightLayers = useMemo(
    () =>
      tileUrl2023
        ? ([
            createCOGLayer({ id: "lulc-2023", tileUrl: tileUrl2023, opacity: 0.9 })
          ] as unknown as LayersList)
        : [],
    [tileUrl2023]
  );

  if (error) {
    return <Box p={5} color="red.500">Error: {error}</Box>;
  }

  return (
    <Box w="100%" h="100%" position="relative">
      <CompareSwipe
        leftLayers={leftLayers as any}
        rightLayers={rightLayers as any}
        leftLabel="2020"
        rightLabel="2023"
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as typeof INITIAL_VIEW)
        }
        mapStyle={BASEMAP_STYLE}
      />

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
          Loading STAC items...
        </Box>
      )}

      <MapLegend
        layers={[
          {
            type: "categorical",
            id: "lulc",
            title: "Esri Land Use/Land Cover",
            categories: LULC_CATEGORIES
          }
        ]}
        position="bottom-left"
      />
    </Box>
  );
}

export default App;
