import { useState, useCallback, useRef, useEffect } from "react";
import { Map } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { DetailsPanel } from "@maptool/core";
import { Box, Input, Text, VStack, Button, Flex } from "@chakra-ui/react";
import { searchLocation, type SearchResult } from "./geocoding";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW = {
  longitude: -122.4,
  latitude: 37.8,
  zoom: 9,
  pitch: 60,
  bearing: -20,
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const protocolRef = useRef<Protocol | null>(null);

  useEffect(() => {
    const protocol = new Protocol();
    protocolRef.current = protocol;
    maplibregl.addProtocol("pmtiles", protocol.tile);
    return () => {
      maplibregl.removeProtocol("pmtiles");
    };
  }, []);

  const handleMapLoad = useCallback(
    (e: { target: maplibregl.Map }) => {
      const map = e.target;
      mapRef.current = map;

      map.addSource("terrain-dem", {
        type: "raster-dem",
        url: "pmtiles://https://download.mapterhorn.com/planet.pmtiles",
        encoding: "terrarium",
        tileSize: 512,
      });

      map.setTerrain({ source: "terrain-dem", exaggeration: 1.5 });

      map.addLayer({
        id: "hillshade",
        type: "hillshade",
        source: "terrain-dem",
        paint: {
          "hillshade-exaggeration": 0.5,
        },
      });
    },
    []
  );

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    const found = await searchLocation(query);
    setResults(found);
    setSearching(false);
  }, [query]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const handleSelectResult = useCallback((result: SearchResult) => {
    mapRef.current?.flyTo({
      center: [result.lng, result.lat],
      zoom: 10,
    });
    setResults([]);
    setQuery(result.name.split(",")[0]);
  }, []);

  return (
    <Flex width="100vw" height="100vh">
      <DetailsPanel
        title="Coastal Explorer"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode="push"
        side="left"
        width={300}
      >
        <VStack gap={3} align="stretch">
          <Input
            placeholder="Search location..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            size="sm"
          />
          <Button size="sm" onClick={handleSearch} disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </Button>

          {results.length > 0 && (
            <VStack gap={1} align="stretch">
              {results.map((r, i) => (
                <Box
                  key={i}
                  p={2}
                  bg="gray.50"
                  _dark={{ bg: "gray.700" }}
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.100", _dark: { bg: "gray.600" } }}
                  onClick={() => handleSelectResult(r)}
                >
                  <Text fontSize="xs">{r.name}</Text>
                </Box>
              ))}
            </VStack>
          )}

          <Box mt={4}>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
              About
            </Text>
            <Text fontSize="xs" color="gray.600" _dark={{ color: "gray.400" }}>
              3D terrain visualization using Mapterhorn DEM tiles
              (Copernicus GLO-30, Terrarium-encoded). Terrain exaggeration
              is set to 1.5x for visual clarity.
            </Text>
          </Box>

          <Box mt={4}>
            <Text fontSize="sm" fontWeight="semibold" mb={2}>
              Elevation Guide
            </Text>
            <VStack gap={1} align="stretch">
              {[
                { label: "Sea level", color: "#71abd8" },
                { label: "Low (0-200m)", color: "#94bf8b" },
                { label: "Mid (200-1000m)", color: "#efebc0" },
                { label: "High (1000-3000m)", color: "#aa8753" },
                { label: "Peak (3000m+)", color: "#ffffff" },
              ].map((item) => (
                <Flex key={item.label} align="center" gap={2}>
                  <Box
                    width="16px"
                    height="16px"
                    borderRadius="sm"
                    bg={item.color}
                    border="1px solid"
                    borderColor="gray.300"
                    flexShrink={0}
                  />
                  <Text fontSize="xs">{item.label}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>

          {!sidebarOpen && (
            <Button
              position="absolute"
              left="8px"
              top="8px"
              size="sm"
              onClick={() => setSidebarOpen(true)}
            >
              Menu
            </Button>
          )}
        </VStack>
      </DetailsPanel>

      <Box flex={1} position="relative">
        {!sidebarOpen && (
          <Button
            position="absolute"
            left="8px"
            top="8px"
            zIndex={10}
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            Menu
          </Button>
        )}
        <Map
          initialViewState={INITIAL_VIEW}
          mapStyle={BASEMAP_STYLE}
          onLoad={handleMapLoad}
          style={{ width: "100%", height: "100%" }}
        />
      </Box>
    </Flex>
  );
}
