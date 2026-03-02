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

import { fetchAllItems, buildVedaTileUrl } from "./veda-stac";

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 2,
  pitch: 0,
  bearing: 0
};

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const RESCALE: [number, number] = [0, 15000000000000000];
const BOTTOM_BAR_HEIGHT = "96px";

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [visible, setVisible] = useState(true);
  const [items, setItems] = useState<STACItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAllItems()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const temporal = useMemo(() => extractTimestamps(items), [items]);

  const timestamps = useMemo(
    () =>
      temporal.map(({ time }) => ({
        time,
        label: new Date(time).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short"
        })
      })),
    [temporal]
  );

  const clock = useAnimationClock({
    totalFrames: timestamps.length || 1,
    fps: 2,
    loop: true
  });

  const currentItem = temporal[clock.currentIndex];

  const tileUrl = useMemo(
    () => (currentItem ? buildVedaTileUrl(currentItem.itemId) : null),
    [currentItem]
  );

  const colorScale = useColorScale({
    domain: RESCALE,
    colormap: "RdBu",
    steps: 8
  });

  // Reverse colors to match VEDA's rdbu_r colormap (library lacks _r variants)
  const legendColors = useMemo(
    () => [...colorScale.colors].reverse(),
    [colorScale.colors]
  );

  const layers = useMemo(
    () =>
      tileUrl
        ? ([
            createCOGLayer({
              id: "no2-layer",
              tileUrl,
              bounds: [-180, -90, 180, 90],
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
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as typeof INITIAL_VIEW)
        }
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

      {/* Legend region — stops above the bottom bar so it never overlaps */}
      <Box position="absolute" top={0} left={0} right={0} bottom={BOTTOM_BAR_HEIGHT}>
        <MapLegend
          layers={[
            {
              type: "continuous",
              id: "no2-layer",
              title: "NO\u2082 (molecules/cm\u00B2)",
              domain: RESCALE,
              colors: legendColors,
              ticks: 5,
              tickFormat: ".2e",
              toggler: true,
              visible
            }
          ]}
          position="bottom-left"
          onLayerToggle={(_, nextVisible) => setVisible(nextVisible)}
        />
      </Box>

      {/* Bottom bar — fixed height, spans full width */}
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
