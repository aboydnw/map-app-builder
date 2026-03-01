import { useEffect, useMemo, useState } from "react";
import { buildTileUrl, fetchCOGInfo, fetchCOGStatistics, type COGInfo, type COGStatistics } from "../utils/titiler";

export interface UseTitilerOptions {
  baseUrl: string;
  url: string;
  colormap?: string;
  bidx?: number;
  /** Manual rescale range [min, max]. Overrides auto-detection from statistics. */
  rescale?: [number, number];
  autoFetchInfo?: boolean;
  autoFetchStatistics?: boolean;
}

export interface UseTitilerReturn {
  tileUrl: string | null;
  info: COGInfo | null;
  statistics: COGStatistics | null;
  rescaleRange: [number, number] | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTitiler({
  baseUrl,
  url,
  colormap = "viridis",
  bidx = 1,
  rescale: manualRescale,
  autoFetchInfo = true,
  autoFetchStatistics = true
}: UseTitilerOptions): UseTitilerReturn {
  const [info, setInfo] = useState<COGInfo | null>(null);
  const [statistics, setStatistics] = useState<COGStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rescaleRange = useMemo<[number, number] | null>(() => {
    if (manualRescale) return manualRescale;
    const band = statistics?.["1"];
    if (!band) return null;
    if (typeof band.percentile_2 === "number" && typeof band.percentile_98 === "number") {
      return [band.percentile_2, band.percentile_98];
    }
    if (typeof band.min === "number" && typeof band.max === "number") {
      return [band.min, band.max];
    }
    return null;
  }, [manualRescale, statistics]);

  const tileUrl = useMemo(() => {
    if (!baseUrl || !url) return null;
    return buildTileUrl(baseUrl, { url, bidx, colormap, rescale: rescaleRange ?? undefined });
  }, [baseUrl, url, bidx, colormap, rescaleRange]);

  const refetch = async () => {
    if (!baseUrl || !url) return;
    setLoading(true);
    setError(null);
    try {
      const [nextInfo, nextStats] = await Promise.all([
        autoFetchInfo ? fetchCOGInfo(baseUrl, url) : Promise.resolve(null),
        autoFetchStatistics ? fetchCOGStatistics(baseUrl, url, { bidx }) : Promise.resolve(null)
      ]);
      setInfo(nextInfo);
      setStatistics(nextStats);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown TiTiler error";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refetch();
    // baseUrl/url/bidx are required query key inputs.
    // colormap impacts tile URL only, not metadata fetch endpoints.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl, url, bidx]);

  return { tileUrl, info, statistics, rescaleRange, loading, error, refetch };
}
