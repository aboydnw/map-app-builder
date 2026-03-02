import { useCallback, useState } from "react";

interface PickingInfo {
  object?: Record<string, unknown>;
  x: number;
  y: number;
  coordinate?: [number, number];
  [key: string]: unknown;
}

export interface UseFeatureStateOptions {
  multiSelect?: boolean;
}

export interface UseFeatureStateReturn {
  hoveredFeature: Record<string, unknown> | null;
  selectedFeatures: Record<string, unknown>[];
  hoverCoordinates: { x: number; y: number } | null;
  onHover: (info: PickingInfo) => void;
  onClick: (info: PickingInfo) => void;
  clearSelection: () => void;
  getCursor: (interactionState: { isDragging: boolean }) => string;
}

export function useFeatureState({ multiSelect = false }: UseFeatureStateOptions = {}): UseFeatureStateReturn {
  const [hoveredFeature, setHoveredFeature] = useState<Record<string, unknown> | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, unknown>[]>([]);
  const [hoverCoordinates, setHoverCoordinates] = useState<{ x: number; y: number } | null>(null);

  const onHover = useCallback((info: PickingInfo) => {
    setHoveredFeature(info.object ?? null);
    setHoverCoordinates(info.object ? { x: info.x, y: info.y } : null);
  }, []);

  const onClick = useCallback(
    (info: PickingInfo) => {
      if (!info.object) {
        setSelectedFeatures([]);
        return;
      }
      if (multiSelect) {
        setSelectedFeatures((prev) => {
          const exists = prev.includes(info.object!);
          return exists ? prev.filter((f) => f !== info.object) : [...prev, info.object!];
        });
      } else {
        setSelectedFeatures([info.object]);
      }
    },
    [multiSelect]
  );

  const clearSelection = useCallback(() => setSelectedFeatures([]), []);

  const getCursor = useCallback(
    ({ isDragging }: { isDragging: boolean }) => {
      if (isDragging) return "grabbing";
      if (hoveredFeature) return "pointer";
      return "grab";
    },
    [hoveredFeature]
  );

  return { hoveredFeature, selectedFeatures, hoverCoordinates, onHover, onClick, clearSelection, getCursor };
}
