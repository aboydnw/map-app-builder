// Complete compare-swipe example: side-by-side COG comparison with shared
// view state, draggable divider, labels, and an optional shared legend.
// Replace the TiTiler URL and COG URLs with your actual data sources.

import { useState, useMemo } from "react";
import {
  CompareSwipe,
  MapLegend,
  createCOGLayer,
  useTitiler,
  useColorScale,
} from "@maptool/core";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

const titilerBase = import.meta.env.VITE_TITILER_URL;

export default function App() {
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);

  const left = useTitiler({
    baseUrl: titilerBase,
    url: "https://example.com/land-cover-2020.tif",
    colormap: "viridis",
  });

  const right = useTitiler({
    baseUrl: titilerBase,
    url: "https://example.com/land-cover-2023.tif",
    colormap: "viridis",
  });

  const colorScale = useColorScale({ colormap: "viridis", domain: [0, 1] });

  const leftLayers = useMemo(
    () =>
      left.tileUrl
        ? [createCOGLayer({ id: "lc-2020", tileUrl: left.tileUrl })]
        : [],
    [left.tileUrl]
  );

  const rightLayers = useMemo(
    () =>
      right.tileUrl
        ? [createCOGLayer({ id: "lc-2023", tileUrl: right.tileUrl })]
        : [],
    [right.tileUrl]
  );

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <CompareSwipe
        leftLayers={leftLayers}
        rightLayers={rightLayers}
        leftLabel="2020"
        rightLabel="2023"
        initialPosition={50}
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as ViewState)
        }
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
      />
      <MapLegend
        layers={[
          {
            type: "continuous",
            id: "land-cover",
            title: "Land Cover Index",
            domain: [0, 1],
            colors: colorScale.colors,
            ticks: 5,
          },
        ]}
        position="bottom-left"
        collapsible
      />
    </div>
  );
}
