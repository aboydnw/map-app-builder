import { useState } from "react";
import { CategoricalLegend } from "./CategoricalLegend";
import { ContinuousRamp } from "./ContinuousRamp";
import { LegendItem } from "./LegendItem";
import type { MapLegendProps } from "./types";

export function MapLegend({
  layers,
  orientation = "vertical",
  position = "bottom-left",
  collapsible = true,
  collapsibleItems = true,
  defaultCollapsed = false,
  headingLevel = 3,
  onLayerToggle,
  className
}: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const positionStyles: Record<NonNullable<MapLegendProps["position"]>, string> = {
    "top-left": "mt-top-2 mt-left-2",
    "top-right": "mt-top-2 mt-right-2",
    "bottom-left": "mt-bottom-8 mt-left-2",
    "bottom-right": "mt-bottom-8 mt-right-2"
  };

  return (
    <div
      className={`mt-absolute ${positionStyles[position]} mt-z-10 mt-max-w-[var(--mt-legend-max-width)] mt-rounded-[var(--mt-radius)] mt-border mt-border-[var(--mt-border)] mt-bg-[var(--mt-bg)] mt-shadow-lg ${className ?? ""}`}
      role="region"
      aria-label="Map legend"
    >
      {collapsible ? (
        <button
          type="button"
          className="mt-w-full mt-flex mt-items-center mt-justify-between mt-px-3 mt-py-2 mt-text-[var(--mt-font-size-xs)] mt-font-semibold mt-uppercase mt-text-[var(--mt-text-secondary)] hover:mt-bg-[var(--mt-bg-hover)]"
          onClick={() => setCollapsed((v) => !v)}
          aria-expanded={!collapsed}
          aria-controls="maptool-legend-content"
        >
          <span>Legend</span>
          <span>{collapsed ? "▸" : "▾"}</span>
        </button>
      ) : null}

      {!collapsed ? (
        <div id="maptool-legend-content" className="mt-space-y-2 mt-p-[var(--mt-legend-padding)]">
          {layers.map((layer) => (
            <LegendItem
              key={layer.id}
              config={layer}
              collapsible={collapsibleItems}
              headingLevel={Math.min(headingLevel + 1, 6) as 3 | 4 | 5 | 6}
              onToggle={layer.toggler && onLayerToggle ? (visible) => onLayerToggle(layer.id, visible) : undefined}
            >
              {layer.type === "continuous" ? (
                <ContinuousRamp config={layer} orientation={orientation} />
              ) : (
                <CategoricalLegend config={layer} />
              )}
            </LegendItem>
          ))}
        </div>
      ) : null}
    </div>
  );
}
