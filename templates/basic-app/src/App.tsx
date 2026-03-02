import { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import {
  AnimationTimeline,
  MapLegend,
  createCOGLayer,
  useAnimationClock,
  useColorScale,
  useTitiler
} from "@maptool/core";
import { BASEMAP_STYLE, INITIAL_VIEW } from "./map-config";

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [visible, setVisible] = useState(true);
  const timestamps = useMemo(
    () => [
      { time: "2024-06-01T00:00:00Z", label: "Jun 1" },
      { time: "2024-06-08T00:00:00Z", label: "Jun 8" },
      { time: "2024-06-15T00:00:00Z", label: "Jun 15" },
      { time: "2024-06-22T00:00:00Z", label: "Jun 22" }
    ],
    []
  );
  const clock = useAnimationClock({ totalFrames: timestamps.length, fps: 1, loop: true, initialSpeed: 1 });

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url:
      import.meta.env.VITE_COG_URL ??
      "https://oin-hotosm.s3.amazonaws.com/5f1579e4e17d8d0010f3af8f/0/5f1579e4e17d8d0010f3af90.tif",
    colormap: "viridis"
  });

  const colorScale = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: "viridis",
    steps: 8
  });

  const layers = useMemo(
    () =>
      titiler.tileUrl
        ? [createCOGLayer({ id: "cog-layer", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds, visible })]
        : [],
    [titiler.tileUrl, titiler.info?.bounds, visible]
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as typeof INITIAL_VIEW)}
        layers={layers}
        controller
      >
        <Map reuseMaps mapStyle={BASEMAP_STYLE} />
      </DeckGL>

      {titiler.rescaleRange ? (
        <MapLegend
          layers={[
            {
              type: "continuous",
              id: "cog-layer",
              title: "COG values",
              domain: titiler.rescaleRange,
              colors: colorScale.colors,
              ticks: 5,
              toggler: true,
              visible
            }
          ]}
          onLayerToggle={(_, nextVisible) => setVisible(nextVisible)}
        />
      ) : null}

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
    </div>
  );
}

export default App;
