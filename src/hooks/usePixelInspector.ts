import { useCallback, useEffect, useRef, useState } from "react";
import { fetchPointValue, type PointValue } from "../utils/titiler";

export interface UsePixelInspectorOptions {
  baseUrl: string;
  cogUrl: string;
  enabled?: boolean;
  debounceMs?: number;
}

export interface UsePixelInspectorReturn {
  inspect: (lng: number, lat: number) => void;
  value: PointValue | null;
  isLoading: boolean;
  clear: () => void;
}

/** Inspects raster pixel values at a given coordinate with debouncing. */
export function usePixelInspector({
  baseUrl,
  cogUrl,
  enabled = true,
  debounceMs = 150
}: UsePixelInspectorOptions): UsePixelInspectorReturn {
  const [value, setValue] = useState<PointValue | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const clear = useCallback(() => {
    setValue(null);
    setIsLoading(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (abortRef.current) abortRef.current.abort();
  }, []);

  const inspect = useCallback(
    (lng: number, lat: number) => {
      if (!enabled) return;

      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();

      timerRef.current = setTimeout(async () => {
        setIsLoading(true);
        const controller = new AbortController();
        abortRef.current = controller;

        try {
          const result = await fetchPointValue(baseUrl, cogUrl, lng, lat);
          if (!controller.signal.aborted) {
            setValue(result);
          }
        } catch {
          if (!controller.signal.aborted) {
            setValue(null);
          }
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      }, debounceMs);
    },
    [baseUrl, cogUrl, enabled, debounceMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return { inspect, value, isLoading, clear };
}
