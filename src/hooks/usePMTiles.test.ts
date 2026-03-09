import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("../utils/pmtiles", () => ({
  fetchPMTilesMetadata: vi.fn()
}));

import { usePMTiles } from "./usePMTiles";
import { fetchPMTilesMetadata } from "../utils/pmtiles";

const mockedFetch = vi.mocked(fetchPMTilesMetadata);

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe("usePMTiles", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches metadata on mount", async () => {
    const mockMetadata = {
      bounds: [-180, -85, 180, 85] as [number, number, number, number],
      minZoom: 0,
      maxZoom: 10,
      tileType: "raster" as const
    };
    mockedFetch.mockResolvedValue(mockMetadata);

    const { result } = renderHook(
      () => usePMTiles({ url: "https://example.com/test.pmtiles" }),
      { wrapper: createWrapper() }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.metadata).toEqual(mockMetadata);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("reports errors", async () => {
    mockedFetch.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(
      () => usePMTiles({ url: "https://example.com/bad.pmtiles" }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.metadata).toBeUndefined();
  });

  it("does not fetch when disabled", () => {
    renderHook(
      () => usePMTiles({ url: "https://example.com/test.pmtiles", enabled: false }),
      { wrapper: createWrapper() }
    );

    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
