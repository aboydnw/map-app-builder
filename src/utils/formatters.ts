import { format as d3Format } from "d3-format";

export const formatSI = d3Format("~s");

export function formatFixed(decimals: number) {
  return d3Format(`.${decimals}f`);
}

export function formatTimestamp(ms: number, resolution: "year" | "month" | "day" | "hour" = "day"): string {
  const d = new Date(ms);
  switch (resolution) {
    case "year":
      return d.getFullYear().toString();
    case "month":
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    case "day":
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
    case "hour":
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
  }
}
