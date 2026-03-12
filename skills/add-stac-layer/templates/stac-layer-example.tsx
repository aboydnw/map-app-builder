// Full STAC layer example: search catalog, select item, render with TiTiler + legend.
// Requires: stac-react, @tanstack/react-query, @maptool/core, @chakra-ui/react
// The app must be wrapped with QueryClientProvider and StacApiProvider.

import { useState, useEffect, useMemo } from "react";
import { useStacSearch } from "stac-react";
import { Box, Text } from "@chakra-ui/react";
import {
  useTitiler,
  useColorScale,
  createCOGLayer,
  MapLegend,
  getSTACItemAssets,
} from "@maptool/core";

const TITILER_URL = import.meta.env.VITE_TITILER_URL;

export default function STACLayerExample() {
  const { result, search, setCollections, setBbox, setDatetime } =
    useStacSearch();

  // Configure and trigger the STAC search
  useEffect(() => {
    setCollections(["sentinel-2-l2a"]);
    setBbox([-122.5, 37.5, -122.0, 38.0]);
    setDatetime("2024-06-01/2024-06-30");
  }, []);

  useEffect(() => {
    search();
  }, [search]);

  // Auto-select the first returned item
  const items = result?.features ?? [];
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => {
    if (!selectedItem && items.length > 0) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  // Resolve the COG asset URL from the selected item
  const cogAssets = selectedItem ? getSTACItemAssets(selectedItem) : [];
  const activeUrl =
    cogAssets.find((a) => a.name === "visual")?.href ??
    cogAssets[0]?.href ??
    "";

  // Build tile URL and rescale info via TiTiler
  const titiler = useTitiler({
    baseUrl: TITILER_URL,
    url: activeUrl,
    colormap: "viridis",
  });

  const colorScale = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: "viridis",
    steps: 8,
  });

  // Create the deck.gl layer
  const layers = useMemo(
    () =>
      titiler.tileUrl
        ? [
            createCOGLayer({
              id: "stac-item",
              tileUrl: titiler.tileUrl,
              bounds: titiler.info?.bounds,
            }),
          ]
        : [],
    [titiler.tileUrl, titiler.info?.bounds]
  );

  return (
    <>
      {/* Pass `layers` to your DeckGL component */}

      {titiler.rescaleRange ? (
        <MapLegend
          layers={[
            {
              type: "continuous",
              id: "stac-item",
              title: selectedItem?.collection ?? "STAC Layer",
              domain: titiler.rescaleRange,
              colors: colorScale.colors,
              ticks: 5,
            },
          ]}
        />
      ) : null}

      {selectedItem ? (
        <Box
          position="absolute"
          top={4}
          right={4}
          bg="white"
          p={3}
          borderRadius="md"
          boxShadow="md"
          maxW="xs"
          fontSize="sm"
        >
          <Text fontWeight="semibold">{selectedItem.id}</Text>
          <Text color="gray.500">
            {String(selectedItem.properties.datetime)}
          </Text>
          <Text color="gray.500">Collection: {selectedItem.collection}</Text>
        </Box>
      ) : null}
    </>
  );
}
