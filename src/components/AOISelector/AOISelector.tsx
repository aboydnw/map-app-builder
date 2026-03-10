import { useRef } from "react";
import { Box, HStack, Text } from "@chakra-ui/react";
import type { Polygon, Feature, FeatureCollection, GeoJsonProperties } from "geojson";

export interface AOISelectorProps {
  onAOIChange: (geojson: Polygon | null) => void;
  active?: boolean;
  onToggle?: () => void;
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  currentAOI?: Polygon | null;
}

const POSITION_STYLES: Record<NonNullable<AOISelectorProps["position"]>, object> = {
  "top-left": { top: 2, left: 2 },
  "top-right": { top: 2, right: 2 },
  "bottom-left": { bottom: 8, left: 2 },
  "bottom-right": { bottom: 8, right: 2 },
};

const buttonStyle: React.CSSProperties = {
  padding: "4px 10px",
  fontSize: "12px",
  fontWeight: 600,
  border: "1px solid #d1d5db",
  borderRadius: "4px",
  cursor: "pointer",
  background: "#fff",
  color: "#374151",
};

const activeButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#3b82f6",
  color: "#fff",
  borderColor: "#3b82f6",
};

function extractPolygon(data: unknown): Polygon | null {
  if (!data || typeof data !== "object") return null;

  const obj = data as Record<string, unknown>;

  if (obj.type === "Polygon" && Array.isArray(obj.coordinates)) {
    return obj as unknown as Polygon;
  }

  if (obj.type === "Feature") {
    const feature = obj as unknown as Feature<Polygon, GeoJsonProperties>;
    if (feature.geometry?.type === "Polygon") {
      return feature.geometry;
    }
  }

  if (obj.type === "FeatureCollection") {
    const fc = obj as unknown as FeatureCollection<Polygon, GeoJsonProperties>;
    const polygonFeature = fc.features?.find((f) => f.geometry?.type === "Polygon");
    if (polygonFeature) {
      return polygonFeature.geometry;
    }
  }

  return null;
}

export function AOISelector({
  onAOIChange,
  active = false,
  onToggle,
  position = "top-right",
  currentAOI,
}: AOISelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        const polygon = extractPolygon(parsed);
        if (polygon) {
          onAOIChange(polygon);
        }
      } catch {
        // invalid JSON
      }
    };
    reader.readAsText(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <Box
      position="absolute"
      {...POSITION_STYLES[position]}
      zIndex={10}
      rounded="md"
      borderWidth="1px"
      borderColor="gray.200"
      bg="rgba(255,255,255,0.9)"
      boxShadow="lg"
      p={2}
      _dark={{ bg: "rgba(30,30,30,0.95)", borderColor: "gray.700" }}
      role="region"
      aria-label="Area of interest selector"
    >
      <HStack gap={1}>
        {onToggle && (
          <button
            type="button"
            style={active ? activeButtonStyle : buttonStyle}
            onClick={onToggle}
            aria-pressed={active}
          >
            Draw AOI
          </button>
        )}

        <button
          type="button"
          style={buttonStyle}
          onClick={() => fileInputRef.current?.click()}
        >
          Upload
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json"
          style={{ display: "none" }}
          onChange={handleFileUpload}
          data-testid="aoi-file-input"
        />

        {currentAOI && (
          <>
            <button
              type="button"
              style={buttonStyle}
              onClick={() => onAOIChange(null)}
            >
              Clear
            </button>
            <Text fontSize="xs" color="green.600" fontWeight={600} _dark={{ color: "green.300" }}>
              AOI active
            </Text>
          </>
        )}
      </HStack>
    </Box>
  );
}
