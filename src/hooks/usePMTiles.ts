import { useQuery } from "@tanstack/react-query";
import { fetchPMTilesMetadata, type PMTilesMetadata } from "../utils/pmtiles";

export interface UsePMTilesOptions {
  url: string;
  enabled?: boolean;
}

export interface UsePMTilesReturn {
  metadata: PMTilesMetadata | undefined;
  isLoading: boolean;
  error: Error | null;
}

/** Fetches and caches PMTiles archive metadata using React Query. */
export function usePMTiles({
  url,
  enabled = true
}: UsePMTilesOptions): UsePMTilesReturn {
  const { data, isLoading, error } = useQuery<PMTilesMetadata, Error>({
    queryKey: ["pmtiles-metadata", url],
    queryFn: () => fetchPMTilesMetadata(url),
    enabled: enabled && !!url
  });

  return {
    metadata: data,
    isLoading,
    error: error ?? null
  };
}
