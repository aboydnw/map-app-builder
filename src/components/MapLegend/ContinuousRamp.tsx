import { useMemo } from "react";
import { format as d3Format } from "d3-format";
import type { ContinuousLegendConfig, LegendOrientation } from "./types";

interface ContinuousRampProps {
  config: ContinuousLegendConfig;
  orientation: LegendOrientation;
}

export function ContinuousRamp({ config, orientation }: ContinuousRampProps) {
  const { domain, colors, ticks: tickCount = 5, tickFormat = "~s", formatTick } = config;
  const isHorizontal = orientation === "horizontal";

  const gradient = useMemo(() => {
    const stops = colors.map((c, i) => `${c} ${(i / Math.max(colors.length - 1, 1)) * 100}%`).join(", ");
    return isHorizontal ? `linear-gradient(to right, ${stops})` : `linear-gradient(to top, ${stops})`;
  }, [colors, isHorizontal]);

  const ticks = useMemo(() => {
    const [min, max] = domain;
    if (tickCount <= 1) return [min];
    const step = (max - min) / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => min + step * i);
  }, [domain, tickCount]);

  const formatter = useMemo(() => formatTick ?? d3Format(tickFormat), [formatTick, tickFormat]);

  return (
    <div className={`mt-flex ${isHorizontal ? "mt-flex-col mt-gap-1" : "mt-flex-row mt-gap-2 mt-items-stretch"}`}>
      <div
        className={`${isHorizontal ? "mt-h-3 mt-w-full" : "mt-h-24 mt-w-3"} mt-rounded-sm mt-border mt-border-[var(--mt-border)]`}
        style={{ background: gradient }}
      />
      <div
        className={`mt-flex ${isHorizontal ? "mt-flex-row mt-justify-between" : "mt-flex-col mt-justify-between"} mt-text-[var(--mt-font-size-xs)] mt-text-[var(--mt-text-secondary)]`}
      >
        {(isHorizontal ? ticks : [...ticks].reverse()).map((v) => (
          <span key={v}>{formatter(v)}</span>
        ))}
      </div>
    </div>
  );
}
