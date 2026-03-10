import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import DeckGL from "@deck.gl/react";
import { _GlobeView as GlobeView, MapView } from "@deck.gl/core";
import { ScatterplotLayer, SolidPolygonLayer, GeoJsonLayer } from "@deck.gl/layers";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

import { fetchWindArrows, type WindArrow } from "./wind-data";

const INITIAL_VIEW = {
  longitude: 0,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

const BASEMAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

const LAND_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson";

const MAX_SPEED = 25;

function speedToColor(speed: number): [number, number, number, number] {
  const t = Math.min(speed / MAX_SPEED, 1);
  if (t < 0.5) {
    const s = t * 2;
    return [Math.round(30 + s * 225), Math.round(80 + s * 175), Math.round(220 - s * 60), 200];
  }
  const s = (t - 0.5) * 2;
  return [Math.round(255), Math.round(255 - s * 200), Math.round(160 - s * 160), 200];
}

function App() {
  const [windData, setWindData] = useState<WindArrow[]>([]);
  const [loading, setLoading] = useState(true);
  const [globeMode, setGlobeMode] = useState(true);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW);
  const [rotating, setRotating] = useState(true);
  const animationRef = useRef<number>();

  useEffect(() => {
    fetchWindArrows()
      .then(setWindData)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!globeMode || !rotating) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }
    const animate = () => {
      setViewState((prev) => ({ ...prev, longitude: prev.longitude + 0.1 }));
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [rotating, globeMode]);

  const views = globeMode
    ? new GlobeView({ id: "globe", controller: true })
    : new MapView({ id: "map", controller: true });

  const layers = useMemo(() => {
    const result = [];

    if (globeMode) {
      result.push(
        new SolidPolygonLayer({
          id: "background",
          data: [
            [
              [-180, 90],
              [0, 90],
              [180, 90],
              [180, -90],
              [0, -90],
              [-180, -90],
            ],
          ],
          getPolygon: (d: number[][]) => d,
          filled: true,
          getFillColor: [14, 36, 62],
        })
      );

      result.push(
        new GeoJsonLayer({
          id: "land",
          data: LAND_URL,
          filled: true,
          stroked: true,
          getFillColor: [40, 80, 120],
          getLineColor: [80, 120, 160],
          getLineWidth: 1,
          lineWidthUnits: "pixels" as const,
        })
      );
    }

    if (windData.length > 0) {
      result.push(
        new ScatterplotLayer<WindArrow>({
          id: "wind-points",
          data: windData,
          getPosition: (d) => d.position,
          getRadius: (d) => 20000 + d.speed * 8000,
          getFillColor: (d) => speedToColor(d.speed),
          radiusUnits: "meters",
          radiusMinPixels: 2,
          radiusMaxPixels: 8,
        })
      );
    }

    return result;
  }, [windData, globeMode]);

  return (
    <Box w="100%" h="100%" position="relative" bg="#0a1929">
      <DeckGL
        views={views}
        viewState={viewState}
        onViewStateChange={({ viewState: vs, interactionState }) => {
          setViewState(vs as ViewState);
          if (interactionState?.isDragging) setRotating(false);
        }}
        layers={layers}
      >
        {!globeMode && <Map reuseMaps mapStyle={BASEMAP_STYLE} />}
      </DeckGL>

      <Box position="absolute" top={4} left={4} zIndex={10}>
        <Button
          size="sm"
          colorScheme="blue"
          onClick={() => {
            setGlobeMode((prev) => !prev);
            setRotating(true);
          }}
        >
          {globeMode ? "Flat View" : "Globe View"}
        </Button>
      </Box>

      {loading && (
        <Box
          position="absolute"
          top={4}
          left="50%"
          transform="translateX(-50%)"
          bg="rgba(0,0,0,0.7)"
          color="white"
          px={4}
          py={2}
          rounded="lg"
          zIndex={10}
        >
          Loading wind data...
        </Box>
      )}
    </Box>
  );
}

export default App;
