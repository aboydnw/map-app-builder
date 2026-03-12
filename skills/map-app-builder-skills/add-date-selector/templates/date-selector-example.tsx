// Complete example showing DateSelector with STAC and TiTiler integration patterns.

import { useState, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import { DateSelector, useTitiler, createCOGLayer } from "@maptool/core";
import "maplibre-gl/dist/maplibre-gl.css";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2024, 5, 15));

  const dateStr = selectedDate
    ? selectedDate.toISOString().split("T")[0]
    : undefined;

  // Option A: TiTiler-based layer where the COG URL includes the date
  const cogUrl = selectedDate
    ? `https://example.com/data/${dateStr}/ndvi.tif`
    : undefined;

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: cogUrl ?? "",
    colormap: "RdYlGn",
    enabled: !!cogUrl,
  });

  const layers = useMemo(
    () =>
      titiler.tileUrl
        ? [createCOGLayer({ id: "dated-cog", tileUrl: titiler.tileUrl })]
        : [],
    [titiler.tileUrl]
  );

  // Option B: STAC search with date filter (uncomment to use)
  // const stac = useSTAC({
  //   catalogUrl: "https://planetarycomputer.microsoft.com/api/stac/v1",
  //   collectionId: "sentinel-2-l2a",
  //   datetime: dateStr,
  //   bbox: [-122.5, 37.5, -121.5, 38.5],
  // });

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>
      <DateSelector
        value={selectedDate}
        onChange={setSelectedDate}
        minDate={new Date(2020, 0, 1)}
        maxDate={new Date(2024, 11, 31)}
        position="top-right"
      />
    </div>
  );
}
