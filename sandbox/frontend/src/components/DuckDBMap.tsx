import { useMemo, useCallback } from "react";
import { Box, NativeSelect } from "@chakra-ui/react";
import { DeckGL } from "@deck.gl/react";
import { MapView } from "@deck.gl/core";
import { Map } from "react-map-gl/maplibre";
import { GeoArrowPolygonLayer, GeoArrowPathLayer, GeoArrowScatterplotLayer } from "@geoarrow/deck.gl-layers";
import type { Table } from "apache-arrow";
import type { MapViewState } from "@deck.gl/core";
import "maplibre-gl/dist/maplibre-gl.css";

const BASEMAPS: Record<string, string> = {
  streets: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
  satellite: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const ACCENT_COLOR = [207, 63, 2, 180] as [number, number, number, number]; // #CF3F02 with alpha

interface DuckDBMapProps {
  table: Table | null;
  viewState: MapViewState;
  onViewStateChange: (vs: MapViewState) => void;
  basemap: string;
  onBasemapChange: (basemap: string) => void;
}

function detectGeometryColumn(table: Table): string | null {
  for (const field of table.schema.fields) {
    const meta = field.metadata;
    if (meta?.get("ARROW:extension:name")?.includes("geoarrow")) {
      return field.name;
    }
  }
  // Fallback: common geometry column names
  for (const name of ["geometry", "geom", "wkb_geometry", "the_geom"]) {
    if (table.schema.fields.some((f) => f.name === name)) return name;
  }
  return null;
}

function detectGeometryType(table: Table, geomCol: string): "polygon" | "line" | "point" {
  const field = table.schema.fields.find((f) => f.name === geomCol);
  if (!field) return "point";
  const extName = field.metadata?.get("ARROW:extension:name") ?? "";
  if (extName.includes("polygon") || extName.includes("multipolygon")) return "polygon";
  if (extName.includes("linestring") || extName.includes("multilinestring")) return "line";
  return "point";
}

export function DuckDBMap({
  table,
  viewState,
  onViewStateChange,
  basemap,
  onBasemapChange,
}: DuckDBMapProps) {
  const layers = useMemo(() => {
    if (!table || table.numRows === 0) return [];

    const geomCol = detectGeometryColumn(table);
    if (!geomCol) return [];

    const geomType = detectGeometryType(table, geomCol);

    if (geomType === "polygon") {
      return [
        new GeoArrowPolygonLayer({
          id: "duckdb-polygons",
          data: table,
          getPolygon: geomCol as any,
          getFillColor: ACCENT_COLOR,
          getLineColor: [207, 63, 2, 255],
          getLineWidth: 1.5,
          lineWidthMinPixels: 1,
          pickable: true,
        }),
      ];
    }
    if (geomType === "line") {
      return [
        new GeoArrowPathLayer({
          id: "duckdb-lines",
          data: table,
          getPath: geomCol as any,
          getColor: [207, 63, 2, 255],
          getWidth: 2,
          widthMinPixels: 1,
          pickable: true,
        }),
      ];
    }
    return [
      new GeoArrowScatterplotLayer({
        id: "duckdb-points",
        data: table,
        getPosition: geomCol as any,
        getFillColor: ACCENT_COLOR,
        getLineColor: [255, 255, 255, 255],
        getRadius: 4,
        radiusMinPixels: 3,
        lineWidthMinPixels: 1,
        stroked: true,
        pickable: true,
      }),
    ];
  }, [table]);

  const onHover = useCallback((info: { object?: unknown }) => {
    // Could add tooltip here later
  }, []);

  return (
    <Box position="relative" w="100%" h="100%">
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => onViewStateChange(vs as MapViewState)}
        controller
        layers={layers}
        onHover={onHover}
        views={new MapView({ repeat: true })}
        getTooltip={({ object }: { object?: Record<string, unknown> }) => {
          if (!object) return null;
          const props = Object.entries(object)
            .filter(([k]) => k !== "geometry" && k !== "geom")
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
          return { text: props, style: { fontSize: "12px" } };
        }}
      >
        <Map mapStyle={BASEMAPS[basemap]} />
      </DeckGL>
      <Box position="absolute" top={3} left={3} bg="white" borderRadius="4px" shadow="sm" p={1}>
        <NativeSelect.Root size="xs">
          <NativeSelect.Field
            value={basemap}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onBasemapChange(e.target.value)}
          >
            <option value="streets">Streets</option>
            <option value="satellite">Satellite</option>
            <option value="dark">Dark</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Box>
    </Box>
  );
}
