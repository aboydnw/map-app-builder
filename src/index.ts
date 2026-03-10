export { MapToolProvider } from "./components/MapToolProvider";
export { MapLegend } from "./components/MapLegend";
export { AnimationTimeline } from "./components/AnimationTimeline";
export { FeatureTooltip } from "./components/FeatureTooltip/FeatureTooltip";
export { CompareSwipe, useSwipePosition } from "./components/CompareSwipe";
export { PixelInspector } from "./components/PixelInspector";

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
export type { CompareSwipeProps, SwipeHandlers, UseSwipePositionReturn } from "./components/CompareSwipe";
export type { PixelInspectorProps, InspectorPosition } from "./components/PixelInspector";
export { AOISelector } from "./components/AOISelector";
export type { AOISelectorProps } from "./components/AOISelector";
export { DateSelector } from "./components/DateSelector";
export type { DateSelectorProps } from "./components/DateSelector";
export { DetailsPanel } from "./components/DetailsPanel";
export type { DetailsPanelProps } from "./components/DetailsPanel";
export { LayerSelector } from "./components/LayerSelector";
export type { LayerSelectorProps, LayerConfig } from "./components/LayerSelector";
export { LLMChatPanel } from "./components/LLMChatPanel";
export type { LLMChatPanelProps, ChatMessage } from "./components/LLMChatPanel";
export { TimeSeriesChart } from "./components/TimeSeriesChart";
export type { TimeSeriesChartProps, TimeSeriesPoint, SeriesConfig } from "./components/TimeSeriesChart";

export { useAnimationClock } from "./hooks/useAnimationClock";
export { useTimeRange } from "./hooks/useTimeRange";
export { useTitiler } from "./hooks/useTitiler";
export { useColorScale } from "./hooks/useColorScale";
export { useFeatureState } from "./hooks/useFeatureState";
export { usePMTiles } from "./hooks/usePMTiles";
export { usePixelInspector } from "./hooks/usePixelInspector";
export { useAnimationExport } from "./hooks/useAnimationExport";

export type { UseAnimationClockOptions, UseAnimationClockReturn } from "./hooks/useAnimationClock";
export type { UseTimeRangeOptions, UseTimeRangeReturn } from "./hooks/useTimeRange";
export type { UseTitilerOptions, UseTitilerReturn } from "./hooks/useTitiler";
export type { UseColorScaleOptions, UseColorScaleReturn } from "./hooks/useColorScale";
export type { UseFeatureStateOptions, UseFeatureStateReturn } from "./hooks/useFeatureState";
export type { UsePMTilesOptions, UsePMTilesReturn } from "./hooks/usePMTiles";
export type { UsePixelInspectorOptions, UsePixelInspectorReturn } from "./hooks/usePixelInspector";
export type { UseAnimationExportOptions, UseAnimationExportReturn } from "./hooks/useAnimationExport";

export { createCOGLayer } from "./layers/COGLayer";
export type { COGLayerOptions } from "./layers/COGLayer";
export { createSTACLayer } from "./layers/STACLayer";
export type { STACLayerOptions } from "./layers/STACLayer";
export { createGeoJSONLayer } from "./layers/GeoJSONLayer";
export type { GeoJSONLayerOptions, ColorMapping, ContinuousColorMapping, CategoricalColorMapping } from "./layers/GeoJSONLayer";
export { createPMTilesRasterLayer } from "./layers/PMTilesRasterLayer";
export type { PMTilesRasterLayerOptions } from "./layers/PMTilesRasterLayer";
export { createPMTilesVectorLayer } from "./layers/PMTilesVectorLayer";
export type { PMTilesVectorLayerOptions } from "./layers/PMTilesVectorLayer";

export { COLORMAPS, getColormap, listColormaps } from "./utils/colormaps";
export { buildTileUrl, fetchCOGInfo, fetchCOGStatistics, fetchColormaps, fetchPointValue } from "./utils/titiler";
export type { TitilerOptions, COGInfo, COGStatistics, BandStatistics, PointValue } from "./utils/titiler";
export { getSTACItemAssets, extractTimestamps } from "./utils/stac-helpers";
export type { STACItem, STACAsset } from "./utils/stac-helpers";
export { formatSI, formatFixed, formatTimestamp } from "./utils/formatters";
export { hexToRgba, buildContinuousAccessor, buildCategoricalAccessor } from "./utils/color-accessors";
export type { RGBAColor, ColorAccessor } from "./utils/color-accessors";
export { createPMTilesProtocol, fetchPMTilesMetadata } from "./utils/pmtiles";
export type { PMTilesMetadata, PMTilesProtocolResult } from "./utils/pmtiles";
