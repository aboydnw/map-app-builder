// Fly-to integration — shows how to wire LocationSearch into your App component.
// Add the handler and render LocationSearch alongside your DeckGL map.

import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { FlyToInterpolator } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";
import LocationSearch from "./LocationSearch";

const INITIAL_VIEW = {
  longitude: -98.5,
  latitude: 39.8,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  const handleLocationSelect = (lng: number, lat: number, _name: string) => {
    setViewState({
      ...viewState,
      longitude: lng,
      latitude: lat,
      zoom: 12,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator(),
    } as any);
  };

  const layers = [
    // ... your layers here
  ];

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) =>
          setViewState(vs as ViewState)
        }
        layers={layers}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>
      <LocationSearch onSelect={handleLocationSelect} />
    </div>
  );
}

export default App;
