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
  useColorScale
} from "@maptool/core";

import { fetchRecentSSTItems, buildSSTTileUrl, type SSTItem } from "./pc-sst";

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 0,
  zoom: 2,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const SST_DOMAIN: [number, number] = [-2, 35];
const BOTTOM_BAR_HEIGHT = "96px";

function App() {
  const [items, setItems] = useState<SSTItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  const colorScale = useColorScale({
    domain: SST_DOMAIN,
    colormap: "coolwarm",
    steps: 8
  });

  useEffect(() => {
    fetchRecentSSTItems(30)
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const timestamps = useMemo(
    () =>
      items.map((item) => ({
        time: new Date(item.datetime).getTime(),
        label: new Date(item.datetime).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric"
        })
      })),
    [items]
  );

  const clock = useAnimationClock({
    totalFrames: timestamps.length || 1,
    fps: 2,
    loop: true
  });

  const currentItem = items[clock.currentIndex];

  const tileUrl = useMemo(
    () => (currentItem ? buildSSTTileUrl(currentItem.itemId) : null),
    [currentItem]
  );

  const layers = useMemo(
    () =>
      tileUrl
        ? ([
            createCOGLayer({
              id: "sst-layer",
              tileUrl,
              opacity: 0.9,
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
          Loading SST data...
        </Box>
      )}

      <Box position="absolute" top={0} left={0} right={0} bottom={BOTTOM_BAR_HEIGHT} pointerEvents="none">
        <MapLegend
          layers={[
            {
              type: "continuous",
              id: "sst-layer",
              title: "Sea Surface Temperature (\u00B0C)",
              domain: SST_DOMAIN,
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
