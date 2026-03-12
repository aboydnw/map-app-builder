// Tooltip integration using useFeatureState for arc hover interactions.
// Wire onHover and getCursor to DeckGL, then render FeatureTooltip.

import { useFeatureState, FeatureTooltip } from "@maptool/core";
import type { FlowData } from "./flow-data";

export function useArcTooltip() {
  const featureState = useFeatureState();

  const tooltipElement =
    featureState.hoveredFeature && featureState.hoverCoordinates ? (
      <FeatureTooltip x={featureState.hoverCoordinates.x} y={featureState.hoverCoordinates.y}>
        <strong>{String((featureState.hoveredFeature as FlowData).category)}</strong>
        <div>Volume: {Number((featureState.hoveredFeature as FlowData).value).toLocaleString()}</div>
      </FeatureTooltip>
    ) : null;

  return { ...featureState, tooltipElement };
}
