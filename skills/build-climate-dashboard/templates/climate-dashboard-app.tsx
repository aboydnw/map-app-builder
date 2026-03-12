// Complete climate dashboard App.tsx combining animated raster, vector overlay,
// timeline, legend, pixel inspector, and feature tooltip.
// Requires: @maptool/core, @deck.gl/*, react-map-gl, maplibre-gl, @chakra-ui/react
// Wrap with <MapToolProvider> in main.tsx (see setup-map-app skill).

import { useMemo, useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import type { MapViewState } from "@deck.gl/core";
import {
  useAnimationClock,
  useTitiler,
  useColorScale,
  useFeatureState,
  usePixelInspector,
  createCOGLayer,
  createGeoJSONLayer,
  AnimationTimeline,
  MapLegend,
  PixelInspector,
  FeatureTooltip,
} from "@maptool/core";
import type { CategoryEntry } from "@maptool/core";
import { TIMESTEPS } from "./timesteps";

const INITIAL_VIEW: MapViewState = {
  longitude: -30,
  latitude: 20,
  zoom: 2,
};

const RESCALE: [number, number] = [-2, 35];
const COLORMAP = "coolwarm";

const STATION_CATEGORIES: CategoryEntry[] = [
  { value: "buoy", color: "#2196F3", label: "Buoy" },
  { value: "ship", color: "#FF9800", label: "Ship" },
  { value: "argo", color: "#9C27B0", label: "Argo Float" },
];

export default function App() {
  const [viewState, setViewState] = useState<MapViewState>(INITIAL_VIEW);

  // --- Animation clock ---
  const clock = useAnimationClock({
    frameCount: TIMESTEPS.length,
    intervalMs: 1000,
  });

  const currentCog = TIMESTEPS[clock.currentFrame].url;

  // --- Raster tiles via TiTiler ---
  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: currentCog,
    colormap: COLORMAP,
    rescale: RESCALE,
  });

  const colorScale = useColorScale({
    domain: RESCALE,
    colormap: COLORMAP,
    steps: 8,
  });

  // --- Pixel inspector (follows current frame) ---
  const inspector = usePixelInspector({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    cogUrl: currentCog,
  });

  // --- Feature interaction state ---
  const featureState = useFeatureState();

  // --- Layers ---
  const rasterLayer = useMemo(
    () =>
      titiler.tileUrl
        ? [createCOGLayer({ id: "sst", tileUrl: titiler.tileUrl })]
        : [],
    [titiler.tileUrl]
  );

  const stationLayer = useMemo(
    () =>
      createGeoJSONLayer({
        id: "stations",
        data: "https://example.com/ocean-stations.geojson",
        colorProperty: "platform_type",
        colorMapping: { type: "categorical", categories: STATION_CATEGORIES },
        pointRadius: 5,
      }),
    []
  );

  const layers = useMemo(
    () => [...rasterLayer, stationLayer],
    [rasterLayer, stationLayer]
  );

  return (
    <>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as MapViewState)
        }
        layers={layers}
        onHover={(info) => {
          featureState.onHover(info);
          if (info.coordinate) {
            inspector.inspect(info.coordinate[0], info.coordinate[1]);
          } else {
            inspector.clear();
          }
        }}
        onClick={featureState.onClick}
        getCursor={featureState.getCursor}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      {/* Timeline at bottom */}
      <AnimationTimeline
        currentFrame={clock.currentFrame}
        frameCount={TIMESTEPS.length}
        isPlaying={clock.isPlaying}
        onPlay={clock.play}
        onPause={clock.pause}
        onFrameChange={clock.setFrame}
        labels={TIMESTEPS.map((t) => t.label)}
      />

      {/* Legend */}
      <MapLegend
        layers={[
          {
            type: "continuous",
            id: "sst",
            title: "Sea Surface Temperature",
            unit: "\u00B0C",
            domain: RESCALE,
            colors: colorScale.colors,
            ticks: 5,
          },
          {
            type: "categorical",
            id: "stations",
            title: "Observation Stations",
            categories: STATION_CATEGORIES,
            shape: "circle",
          },
        ]}
        position="bottom-left"
        collapsible
      />

      {/* Pixel inspector */}
      <PixelInspector
        value={inspector.value}
        isLoading={inspector.isLoading}
        position="top-right"
        formatValue={(_band, val) => `${val.toFixed(1)} \u00B0C`}
      />

      {/* Feature tooltip */}
      {featureState.hoveredFeature && featureState.hoverCoordinates && (
        <FeatureTooltip
          x={featureState.hoverCoordinates.x}
          y={featureState.hoverCoordinates.y}
        >
          <strong>
            {String(
              featureState.hoveredFeature.properties?.station_name ?? "Station"
            )}
          </strong>
          <div>
            Type:{" "}
            {String(featureState.hoveredFeature.properties?.platform_type)}
          </div>
        </FeatureTooltip>
      )}
    </>
  );
}
