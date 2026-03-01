import { useState } from "react";
import type { LegendLayerConfig } from "./types";

interface LegendItemProps {
  config: LegendLayerConfig;
  collapsible: boolean;
  headingLevel: 3 | 4 | 5 | 6;
  onToggle?: (visible: boolean) => void;
  children: React.ReactNode;
}

export function LegendItem({ config, collapsible, headingLevel, onToggle, children }: LegendItemProps) {
  const [expanded, setExpanded] = useState(true);
  const title =
    config.type === "continuous" && config.unit ? `${config.title} (${config.unit})` : config.title;

  return (
    <section className="mt-border-b mt-border-[var(--mt-border)] mt-pb-2 mt-last:border-b-0">
      <div className="mt-flex mt-items-center mt-gap-2 mt-mb-2">
        {onToggle ? (
          <button
            type="button"
            className={`mt-h-3.5 mt-w-3.5 mt-rounded-sm mt-border ${
              config.visible === false ? "mt-bg-white mt-border-[var(--mt-border)]" : "mt-bg-[var(--mt-accent)] mt-border-[var(--mt-accent)]"
            }`}
            onClick={() => onToggle(config.visible === false)}
            aria-label={`Toggle ${config.title} visibility`}
            aria-pressed={config.visible !== false}
          />
        ) : null}
        {collapsible ? (
          <button
            type="button"
            className="mt-flex mt-items-center mt-gap-1 mt-text-left"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
          >
            <span
              className="mt-text-[var(--mt-font-size-sm)] mt-font-semibold mt-text-[var(--mt-text-primary)]"
              aria-level={headingLevel}
              role="heading"
            >
              {title}
            </span>
            <span className="mt-text-[var(--mt-text-secondary)]">{expanded ? "▾" : "▸"}</span>
          </button>
        ) : (
          <span
            className="mt-text-[var(--mt-font-size-sm)] mt-font-semibold mt-text-[var(--mt-text-primary)]"
            aria-level={headingLevel}
            role="heading"
          >
            {title}
          </span>
        )}
      </div>
      {expanded ? children : null}
    </section>
  );
}
