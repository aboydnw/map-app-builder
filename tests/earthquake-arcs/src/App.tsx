import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Input, List } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator } from "@deck.gl/core";
import type { MapViewState } from "@deck.gl/core";
import { ArcLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  MapLegend,
  FeatureTooltip,
  AnimationTimeline,
  useFeatureState,
  useAnimationClock
} from "@maptool/core";

import { fetchFlightRoutes, type FlightRoute } from "./flight-data";
import { searchLocation, type GeocodingResult } from "./geocoding";

const TOTAL_FRAMES = 60;

const INITIAL_VIEW: MapViewState = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const timestamps = Array.from({ length: TOTAL_FRAMES }, (_, i) => ({
  time: i,
  label: `Frame ${i + 1}`
}));

function App() {
  const [routes, setRoutes] = useState<FlightRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const { hoveredFeature, hoverCoordinates, onHover, getCursor } =
    useFeatureState();

  const clock = useAnimationClock({
    totalFrames: TOTAL_FRAMES,
    fps: 10,
    loop: true
  });

  useEffect(() => {
    fetchFlightRoutes()
      .then(setRoutes)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      const results = await searchLocation(value);
      setSearchResults(results);
      setShowResults(true);
    }, 1000);
  }, []);

  const handleSelectLocation = useCallback((result: GeocodingResult) => {
    setViewState((prev) => ({
      ...prev,
      longitude: result.lng,
      latitude: result.lat,
      zoom: 6,
      transitionDuration: 1500,
      transitionInterpolator: new FlyToInterpolator()
    }));
    setSearchQuery(result.name);
    setShowResults(false);
  }, []);

  const layers = useMemo(
    () =>
      routes.length > 0
        ? [
            new ArcLayer<FlightRoute>({
              id: "flight-arcs",
              data: routes,
              getSourcePosition: (d) => d.source,
              getTargetPosition: (d) => d.target,
              getSourceColor: [0, 128, 255],
              getTargetColor: [255, 100, 0],
              getWidth: 1,
              getTilt: clock.currentIndex * 6,
              pickable: true,
              updateTriggers: {
                getTilt: clock.currentIndex
              }
            })
          ]
        : [],
    [routes, clock.currentIndex]
  );

  if (error) {
    return (
      <Box p={5} color="red.500">
        Error: {error}
      </Box>
    );
  }

  return (
    <Box w="100%" h="100%" position="relative">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as MapViewState)
        }
        layers={layers}
        controller
        onHover={onHover as any}
        getCursor={getCursor as any}
      >
        <Map reuseMaps mapStyle={BASEMAP_STYLE} />
      </DeckGL>

      <Box position="absolute" top={4} left={4} zIndex={10} w="320px">
        <Input
          placeholder="Search location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          bg="white"
          color="black"
          size="sm"
        />
        {showResults && searchResults.length > 0 && (
          <List.Root
            bg="white"
            borderRadius="md"
            boxShadow="md"
            mt={1}
            maxH="200px"
            overflowY="auto"
          >
            {searchResults.map((result, i) => (
              <List.Item
                key={i}
                px={3}
                py={2}
                fontSize="sm"
                color="black"
                cursor="pointer"
                _hover={{ bg: "gray.100" }}
                onClick={() => handleSelectLocation(result)}
              >
                {result.name}
              </List.Item>
            ))}
          </List.Root>
        )}
      </Box>

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
          Loading flight data...
        </Box>
      )}

      {hoveredFeature && hoverCoordinates && (
        <FeatureTooltip x={hoverCoordinates.x} y={hoverCoordinates.y}>
          <Box
            bg="white"
            p={2}
            borderRadius="md"
            boxShadow="md"
            fontSize="sm"
          >
            <Box fontWeight="bold" mb={1}>
              {(hoveredFeature as FlightRoute).sourceAirport}
            </Box>
            <Box>To: {(hoveredFeature as FlightRoute).targetAirport}</Box>
            <Box>Routes: {(hoveredFeature as FlightRoute).count}</Box>
          </Box>
        </FeatureTooltip>
      )}

      <MapLegend
        layers={[
          {
            type: "categorical",
            id: "arcs",
            title: "Flight Routes",
            categories: [
              { value: "source", color: "rgb(0, 128, 255)", label: "Origin" },
              {
                value: "target",
                color: "rgb(255, 100, 0)",
                label: "Destination"
              }
            ],
            shape: "line"
          }
        ]}
        position="bottom-left"
      />

      <AnimationTimeline
        timestamps={timestamps}
        currentIndex={clock.currentIndex}
        onIndexChange={clock.setIndex}
        isPlaying={clock.isPlaying}
        onPlayingChange={clock.setPlaying}
        speed={clock.speed}
        onSpeedChange={clock.setSpeed}
        formatLabel={(_time, index) => `Frame ${index + 1}`}
      />
    </Box>
  );
}

export default App;
