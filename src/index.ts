export { MapToolProvider } from "./components/MapToolProvider";
export { MapLegend } from "./components/MapLegend";
export { AnimationTimeline } from "./components/AnimationTimeline";
export { FeatureTooltip } from "./components/FeatureTooltip/FeatureTooltip";

export type {
  MapLegendProps,
  LegendLayerConfig,
  ContinuousLegendConfig,
  CategoricalLegendConfig,
  CategoryEntry,
  LegendOrientation,
  LegendPosition,
  ContinuousScaleType
} from "./components/MapLegend/types";

export type {
  AnimationTimelineProps,
  TimelineMode,
  SpeedOption,
  Timestep,
  HistogramBin
} from "./components/AnimationTimeline/types";

export type { FeatureTooltipProps } from "./components/FeatureTooltip/FeatureTooltip";

export { useAnimationClock } from "./hooks/useAnimationClock";
export { useTimeRange } from "./hooks/useTimeRange";
export { useTitiler } from "./hooks/useTitiler";
export { useColorScale } from "./hooks/useColorScale";
export { useFeatureState } from "./hooks/useFeatureState";

export type { UseAnimationClockOptions, UseAnimationClockReturn } from "./hooks/useAnimationClock";
export type { UseTimeRangeOptions, UseTimeRangeReturn } from "./hooks/useTimeRange";
export type { UseTitilerOptions, UseTitilerReturn } from "./hooks/useTitiler";
export type { UseColorScaleOptions, UseColorScaleReturn } from "./hooks/useColorScale";
export type { UseFeatureStateOptions, UseFeatureStateReturn } from "./hooks/useFeatureState";

export { createCOGLayer } from "./layers/COGLayer";
export type { COGLayerOptions } from "./layers/COGLayer";
export { createSTACLayer } from "./layers/STACLayer";
export type { STACLayerOptions } from "./layers/STACLayer";
export { createGeoJSONLayer } from "./layers/GeoJSONLayer";
export type { GeoJSONLayerOptions, ColorMapping, ContinuousColorMapping, CategoricalColorMapping } from "./layers/GeoJSONLayer";

export { COLORMAPS, getColormap, listColormaps } from "./utils/colormaps";
export { buildTileUrl, fetchCOGInfo, fetchCOGStatistics, fetchColormaps } from "./utils/titiler";
export type { TitilerOptions, COGInfo, COGStatistics, BandStatistics } from "./utils/titiler";
export { getSTACItemAssets, extractTimestamps } from "./utils/stac-helpers";
export type { STACItem, STACAsset } from "./utils/stac-helpers";
export { formatSI, formatFixed, formatTimestamp } from "./utils/formatters";
