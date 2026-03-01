import type { HistogramBin } from "./types";

interface HistogramProps {
  bins: HistogramBin[];
  height?: number;
}

export function Histogram({ bins, height = 32 }: HistogramProps) {
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1);

  return (
    <div className="mt-flex mt-items-end mt-gap-[1px] mt-opacity-70" style={{ height }}>
      {bins.map((bin, index) => (
        <div
          key={`${bin.start}-${bin.end}-${index}`}
          className="mt-flex-1 mt-min-w-[1px] mt-rounded-t-sm mt-bg-[var(--mt-accent-light)]"
          style={{ height: `${(bin.count / maxCount) * 100}%` }}
        />
      ))}
    </div>
  );
}
