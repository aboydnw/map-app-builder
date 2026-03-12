// Feature interaction: hover highlighting, click selection, and tooltip.
// Wire useFeatureState handlers into the DeckGL component.

import { useFeatureState, FeatureTooltip } from "@maptool/core";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import type { ViewState } from "@maptool/core";

function MapWithInteraction({ layers }: { layers: any[] }) {
  const [viewState, setViewState] = useState<ViewState>({
    longitude: -77.04,
    latitude: 38.9,
    zoom: 12,
  });
  const featureState = useFeatureState();

  return (
    <>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        onHover={featureState.onHover}
        onClick={featureState.onClick}
        getCursor={featureState.getCursor}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>

      {featureState.hoveredFeature && featureState.hoverCoordinates && (
        <FeatureTooltip x={featureState.hoverCoordinates.x} y={featureState.hoverCoordinates.y}>
          <strong>{String(featureState.hoveredFeature.properties?.name ?? "Feature")}</strong>
          <div>Type: {String(featureState.hoveredFeature.properties?.land_use)}</div>
        </FeatureTooltip>
      )}
    </>
  );
}
