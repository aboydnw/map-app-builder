import { useEffect, useMemo, useState } from "react";
import { Box } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import type { LayersList } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  AnimationTimeline,
  MapLegend,
  createCOGLayer,
  useAnimationClock,
  useColorScale,
  extractTimestamps,
  type STACItem
} from "@maptool/core";

import { fetchRecentItems, buildPCTileUrl } from "./pc-stac";

const INITIAL_VIEW = {
  longitude: -95,
  latitude: 38,
  zoom: 4,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const RESCALE: [number, number] = [0, 25];
const BOTTOM_BAR_HEIGHT = "96px";

function App() {
  const [visible, setVisible] = useState(true);
  const [items, setItems] = useState<STACItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecentItems(48)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const temporal = useMemo(() => extractTimestamps(items), [items]);

  const timestamps = useMemo(
    () =>
      temporal.map(({ time }) => ({
        time,
        label: new Date(time).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "numeric"
        })
      })),
    [temporal]
  );

  const clock = useAnimationClock({
    totalFrames: timestamps.length || 1,
    fps: 4,
    loop: true
  });

  const currentItem = temporal[clock.currentIndex];

  const tileUrl = useMemo(
    () => (currentItem ? buildPCTileUrl(currentItem.itemId) : null),
    [currentItem]
  );

  const colorScale = useColorScale({
    domain: RESCALE,
    colormap: "YlGnBu",
    steps: 8
  });

  const layers = useMemo(
    () =>
      tileUrl
        ? ([
            createCOGLayer({
              id: "precip-layer",
              tileUrl,
              bounds: [-125, 24, -66, 50],
              opacity: 0.8,
              visible
            })
          ] as unknown as LayersList)
        : [],
    [tileUrl, visible]
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
          Loading STAC items...
        </Box>
      )}

      <Box position="absolute" top={0} left={0} right={0} bottom={BOTTOM_BAR_HEIGHT} pointerEvents="none">
        <MapLegend
          layers={[
            {
              type: "continuous",
              id: "precip-layer",
              title: "Precipitation (mm/hr)",
              domain: RESCALE,
              colors: colorScale.colors,
              ticks: 5,
              toggler: true,
              visible
            }
          ]}
          position="bottom-left"
          onLayerToggle={(_, nextVisible) => setVisible(nextVisible)}
        />
      </Box>

      {timestamps.length > 0 && (
        <AnimationTimeline
          timestamps={timestamps}
          currentIndex={clock.currentIndex}
          onIndexChange={clock.setIndex}
          isPlaying={clock.isPlaying}
          onPlayingChange={clock.setPlaying}
          speed={clock.speed}
          onSpeedChange={clock.setSpeed}
          position="bottom"
        />
      )}
    </Box>
  );
}

export default App;
