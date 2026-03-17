import { useState, useMemo, useRef, useEffect } from "react";
import { Box, Flex, NativeSelect, Text } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { MapView, WebMercatorViewport } from "@deck.gl/core";
import Map from "react-map-gl/maplibre";
import { createCOGLayer, useColorScale, MapLegend, listColormaps } from "@maptool/core";
import type { Dataset } from "../types";
import { TemporalControls } from "./TemporalControls";
import { useTemporalPreload } from "../hooks/useTemporalPreload";
import { useTemporalAnimation } from "../hooks/useTemporalAnimation";
import { useTemporalExport } from "../hooks/useTemporalExport";
import { detectCadence, formatTimestepLabel } from "../utils/temporal";
import "maplibre-gl/dist/maplibre-gl.css";

const BASEMAPS: Record<string, string> = {
  streets: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const COLORMAP_NAMES = listColormaps();

interface RasterMapProps {
  dataset: Dataset;
  initialTimestep?: number;
  onTimestepChange?: (index: number) => void;
}

export function RasterMap({ dataset, initialTimestep, onTimestepChange }: RasterMapProps) {
  const [opacity, setOpacity] = useState(0.8);
  const [basemap, setBasemap] = useState("streets");
  const [colormapName, setColormapName] = useState("viridis");
  const [selectedBand, setSelectedBand] = useState<"rgb" | number>("rgb");

  const isSingleBand = dataset.band_count === 1;
  const isMultiBand = (dataset.band_count ?? 0) > 1;
  const ci = dataset.color_interpretation ?? [];
  const hasRgb = ci.length >= 3 && ci[0] === "red" && ci[1] === "green" && ci[2] === "blue";

  const selectableBands = (dataset.band_names ?? [])
    .map((name, i) => ({ name, index: i }))
    .filter((_, i) => ci[i] !== "alpha");

  const effectiveBand = isMultiBand && !hasRgb && selectedBand === "rgb" ? 0 : selectedBand;

  const showingColormap = isSingleBand || (isMultiBand && effectiveBand !== "rgb");

  const tileUrl = useMemo(() => {
    const base = dataset.tile_url;
    const separator = base.includes("?") ? "&" : "?";

    if (isSingleBand) {
      let url = `${base}${separator}colormap_name=${colormapName}`;
      if (dataset.is_temporal && dataset.raster_min != null && dataset.raster_max != null) {
        url += `&rescale=${dataset.raster_min},${dataset.raster_max}`;
      }
      return url;
    }

    if (isMultiBand && typeof effectiveBand === "number") {
      return `${base}${separator}bidx=${effectiveBand + 1}&colormap_name=${colormapName}`;
    }

    return base;
  }, [dataset, colormapName, isSingleBand, isMultiBand, effectiveBand]);

  const domain: [number, number] =
    dataset.is_temporal && dataset.raster_min != null && dataset.raster_max != null
      ? [dataset.raster_min, dataset.raster_max]
      : [0, 1];

  const { colors } = useColorScale({
    domain,
    colormap: colormapName,
  });

  const initialViewState = useMemo(() => {
    if (!dataset.bounds) {
      return { longitude: 0, latitude: 0, zoom: 2 };
    }
    const [west, south, east, north] = dataset.bounds;
    const MERCATOR_LIMIT = 85.051129;
    const viewport = new WebMercatorViewport({ width: 800, height: 600 });
    const { longitude, latitude, zoom } = viewport.fitBounds(
      [[west, Math.max(south, -MERCATOR_LIMIT)], [east, Math.min(north, MERCATOR_LIMIT)]],
      { padding: 40 }
    );
    return { longitude, latitude, zoom };
  }, [dataset.bounds]);

  const deckRef = useRef(null);
  const [viewState, setViewState] = useState({ longitude: 0, latitude: 0, zoom: 2 });

  const cadence = useMemo(
    () => dataset.is_temporal ? detectCadence(dataset.timesteps.map((t) => t.datetime)) : "irregular",
    [dataset],
  );

  const gapIndices = useMemo(() => new Set<number>(), []);

  const preloadState = useTemporalPreload(
    dataset.is_temporal ? tileUrl : "",
    dataset.is_temporal ? dataset.timesteps : [],
    viewState,
  );

  const animation = useTemporalAnimation(
    dataset.timesteps?.length ?? 0,
    gapIndices,
    preloadState.isReady,
    initialTimestep ?? 0,
  );

  const speedMs = { 0.5: 1600, 1: 800, 2: 400 }[animation.speed] ?? 800;
  const exportHook = useTemporalExport(deckRef, dataset.timesteps ?? [], gapIndices, speedMs);

  useEffect(() => {
    if (dataset.is_temporal && onTimestepChange) {
      onTimestepChange(animation.activeIndex);
    }
  }, [animation.activeIndex, dataset.is_temporal, onTimestepChange]);

  const activeTileUrl = useMemo(() => {
    if (!dataset.is_temporal || !dataset.timesteps.length) return tileUrl;
    const ts = dataset.timesteps[animation.activeIndex];
    if (!ts) return tileUrl;
    return `${tileUrl}&datetime=${ts.datetime}`;
  }, [tileUrl, dataset, animation.activeIndex]);

  const effectiveTileUrl = dataset.is_temporal ? activeTileUrl : tileUrl;
  const layer = useMemo(() => {
    return createCOGLayer({
      id: `raster-layer-${colormapName}-${effectiveBand}`,
      tileUrl: effectiveTileUrl,
      opacity,
    });
  }, [effectiveTileUrl, opacity, colormapName, effectiveBand]);

  return (
    <Box position="relative" w="100%" h="100%">
      <DeckGL
        ref={deckRef}
        initialViewState={initialViewState}
        controller
        layers={[layer]}
        views={new MapView({ repeat: true })}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as typeof viewState)}
      >
        <Map mapStyle={BASEMAPS[basemap]} />
      </DeckGL>

      <Box position="absolute" top={3} left={3} bg="white" borderRadius="4px" shadow="sm" p={1}>
        <NativeSelect.Root size="xs">
          <NativeSelect.Field
            value={basemap}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBasemap(e.target.value)}
          >
            <option value="streets">Streets</option>
            <option value="satellite">Satellite</option>
            <option value="dark">Dark</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>

      {showingColormap && (
        <Box position="absolute" bottom={3} left={3}>
          <MapLegend
            layers={[{
              type: "continuous" as const,
              id: "raster",
              title: dataset.filename,
              domain,
              colors,
            }]}
          />
        </Box>
      )}

      <Flex
        position="absolute"
        bottom={3}
        right={3}
        bg="white"
        borderRadius="6px"
        shadow="sm"
        p={2}
        direction="column"
        gap={2}
      >
        {isMultiBand && (
          <Box>
            <Text fontSize="10px" color="brand.textSecondary" fontWeight={500} mb={1}>
              Band
            </Text>
            <NativeSelect.Root size="xs">
              <NativeSelect.Field
                value={String(effectiveBand)}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const val = e.target.value;
                  setSelectedBand(val === "rgb" ? "rgb" : Number(val));
                }}
              >
                {hasRgb && <option value="rgb">RGB</option>}
                {selectableBands.map((b) => (
                  <option key={b.index} value={String(b.index)}>{b.name}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        )}
        {showingColormap && (
          <Box>
            <Text fontSize="10px" color="brand.textSecondary" fontWeight={500} mb={1}>
              Colormap
            </Text>
            <NativeSelect.Root size="xs">
              <NativeSelect.Field
                value={colormapName}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setColormapName(e.target.value)}
              >
                {COLORMAP_NAMES.map((cm) => (
                  <option key={cm} value={cm}>{cm}</option>
                ))}
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Box>
        )}
        <Box>
          <Text fontSize="10px" color="brand.textSecondary" fontWeight={500} mb={1}>
            Opacity
          </Text>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            style={{ width: 80, accentColor: "#CF3F02" }}
          />
        </Box>
      </Flex>

      {dataset.is_temporal && (
        <TemporalControls
          timesteps={dataset.timesteps}
          activeIndex={animation.activeIndex}
          onIndexChange={animation.setActiveIndex}
          isPlaying={animation.isPlaying}
          onTogglePlay={animation.togglePlay}
          speed={animation.speed}
          onSpeedChange={animation.setSpeed}
          preloadProgress={preloadState.progress}
          label={
            dataset.timesteps[animation.activeIndex]
              ? formatTimestepLabel(dataset.timesteps[animation.activeIndex].datetime, cadence)
              : ""
          }
          onExportGif={() => exportHook.exportGif(animation.setActiveIndex)}
          onExportMp4={() => exportHook.exportMp4(animation.setActiveIndex)}
          isExporting={exportHook.isExporting}
        />
      )}
    </Box>
  );
}
