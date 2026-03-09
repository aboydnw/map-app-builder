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

import { fetchWorldCoverItems, buildWorldCoverTileUrl } from "./pc-worldcover";

const INITIAL_VIEW = {
  longitude: 5,
  latitude: 50,
  zoom: 10,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

const WORLDCOVER_CATEGORIES: CategoryEntry[] = [
  { value: "Tree cover", color: "#006400", label: "Tree cover" },
  { value: "Shrubland", color: "#FFBB22", label: "Shrubland" },
  { value: "Grassland", color: "#FFFF4C", label: "Grassland" },
  { value: "Cropland", color: "#F096FF", label: "Cropland" },
  { value: "Built-up", color: "#FA0000", label: "Built-up" },
  { value: "Bare/sparse", color: "#B4B4B4", label: "Bare/sparse" },
  { value: "Snow/ice", color: "#F0F0F0", label: "Snow/ice" },
  { value: "Water", color: "#0064C8", label: "Water" },
  { value: "Wetland", color: "#0096A0", label: "Wetland" },
  { value: "Mangroves", color: "#00CF75", label: "Mangroves" },
  { value: "Moss/lichen", color: "#FAE6A0", label: "Moss/lichen" }
];

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [tileUrl2020, setTileUrl2020] = useState<string | null>(null);
  const [tileUrl2021, setTileUrl2021] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWorldCoverItems(INITIAL_VIEW.longitude, INITIAL_VIEW.latitude)
      .then(({ item2020, item2021 }) => {
        if (item2020) setTileUrl2020(buildWorldCoverTileUrl(item2020.id));
        if (item2021) setTileUrl2021(buildWorldCoverTileUrl(item2021.id));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const leftLayers = useMemo(
    () =>
      tileUrl2020
        ? ([
            createCOGLayer({ id: "wc-2020", tileUrl: tileUrl2020, opacity: 0.9 })
          ] as unknown as LayersList)
        : [],
    [tileUrl2020]
  );

  const rightLayers = useMemo(
    () =>
      tileUrl2021
        ? ([
            createCOGLayer({ id: "wc-2021", tileUrl: tileUrl2021, opacity: 0.9 })
          ] as unknown as LayersList)
        : [],
    [tileUrl2021]
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
        rightLabel="2021"
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
            id: "worldcover",
            title: "ESA WorldCover",
            categories: WORLDCOVER_CATEGORIES
          }
        ]}
        position="bottom-left"
      />
    </Box>
  );
}

export default App;
