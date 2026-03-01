export { MapToolProvider } from "./components/MapToolProvider";
export { MapLegend } from "./components/MapLegend";
export { AnimationTimeline } from "./components/AnimationTimeline";

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

export { useAnimationClock } from "./hooks/useAnimationClock";
export { useTimeRange } from "./hooks/useTimeRange";
export { useTitiler } from "./hooks/useTitiler";
export { useSTAC } from "./hooks/useSTAC";
export { useColorScale } from "./hooks/useColorScale";

export type { UseAnimationClockOptions, UseAnimationClockReturn } from "./hooks/useAnimationClock";
export type { UseTimeRangeOptions, UseTimeRangeReturn } from "./hooks/useTimeRange";
export type { UseTitilerOptions, UseTitilerReturn } from "./hooks/useTitiler";
export type { UseSTACOptions, UseSTACReturn } from "./hooks/useSTAC";
export type { UseColorScaleOptions, UseColorScaleReturn } from "./hooks/useColorScale";

export { createCOGLayer } from "./layers/COGLayer";
export type { COGLayerOptions } from "./layers/COGLayer";
export { createSTACLayer } from "./layers/STACLayer";
export type { STACLayerOptions } from "./layers/STACLayer";

export { COLORMAPS, getColormap, listColormaps } from "./utils/colormaps";
export { buildTileUrl, fetchCOGInfo, fetchCOGStatistics, fetchColormaps } from "./utils/titiler";
export type { TitilerOptions, COGInfo, COGStatistics, BandStatistics } from "./utils/titiler";
export { searchSTAC, fetchSTACItem, getSTACItemAssets, extractTimestamps } from "./utils/stac";
export type { STACSearchParams, STACItem, STACAsset, STACSearchResult } from "./utils/stac";
export { formatSI, formatFixed, formatTimestamp } from "./utils/formatters";
