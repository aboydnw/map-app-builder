import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("pmtiles", () => {
  const TileType = { Mvt: 1, Png: 2 };

  class MockPMTiles {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
    async getHeader() {
      return {
        minLon: -180,
        minLat: -85,
        maxLon: 180,
        maxLat: 85,
        minZoom: 0,
        maxZoom: 14,
        tileType: this.url.includes("vector") ? TileType.Mvt : TileType.Png
      };
    }
    async getMetadata() {
      if (this.url.includes("vector")) {
        return {
          vector_layers: [{ id: "buildings" }, { id: "roads" }]
        };
      }
      return {};
    }
  }

  class MockProtocol {
    tile() {}
  }

  return {
    PMTiles: MockPMTiles,
    Protocol: MockProtocol,
    TileType
  };
});

import { fetchPMTilesMetadata, createPMTilesProtocol } from "./pmtiles";

describe("fetchPMTilesMetadata", () => {
  it("returns raster metadata for a raster PMTiles file", async () => {
    const metadata = await fetchPMTilesMetadata("https://example.com/raster.pmtiles");
    expect(metadata.tileType).toBe("raster");
    expect(metadata.bounds).toEqual([-180, -85, 180, 85]);
    expect(metadata.minZoom).toBe(0);
    expect(metadata.maxZoom).toBe(14);
    expect(metadata.layers).toBeUndefined();
  });

  it("returns vector metadata with layer names for vector PMTiles", async () => {
    const metadata = await fetchPMTilesMetadata("https://example.com/vector.pmtiles");
    expect(metadata.tileType).toBe("vector");
    expect(metadata.layers).toEqual(["buildings", "roads"]);
  });
});

describe("createPMTilesProtocol", () => {
  it("returns a protocol and cleanup function", () => {
    const result = createPMTilesProtocol();
    expect(result.protocol).toBeDefined();
    expect(typeof result.cleanup).toBe("function");
  });
});
