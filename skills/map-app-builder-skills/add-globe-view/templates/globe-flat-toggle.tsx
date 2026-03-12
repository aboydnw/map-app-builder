// Globe/flat map toggle: conditionally switch between GlobeView and MapView.
// When in flat mode, render a MapLibre basemap inside DeckGL.

import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { MapView, _GlobeView as GlobeView } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";

const [globeMode, setGlobeMode] = useState(false);

const views = globeMode
  ? new GlobeView({ id: "globe", controller: true })
  : new MapView({ id: "map", controller: true });

<DeckGL views={views} viewState={viewState} layers={layers}>
  {!globeMode && (
    <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
  )}
</DeckGL>;
