import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildTileUrl, fetchPointValue } from "./titiler";

describe("buildTileUrl", () => {
  it("builds a TiTiler URL with expected query params", () => {
    const url = buildTileUrl("http://localhost:8000", {
      url: "https://example.com/data.tif",
      colormap: "viridis",
      bidx: 1,
      rescale: [0, 100]
    });

    expect(url).toContain("http://localhost:8000/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png");
    expect(url).toContain("url=https%3A%2F%2Fexample.com%2Fdata.tif");
    expect(url).toContain("colormap_name=viridis");
    expect(url).toContain("bidx=1");
    expect(url).toContain("rescale=0%2C100");
  });
});

describe("fetchPointValue", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("returns band values from an array response", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ values: [42.5, 10.2] })
    } as Response);

    const result = await fetchPointValue("http://localhost:8000", "https://example.com/data.tif", -77.5, 38.9);

    expect(result.coordinates).toEqual([-77.5, 38.9]);
    expect(result.values).toEqual({ b1: 42.5, b2: 10.2 });
    expect(vi.mocked(globalThis.fetch)).toHaveBeenCalledWith(
      expect.stringContaining("/cog/point/-77.5,38.9")
    );
  });

  it("returns band values from an object response", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ values: { ndvi: 0.85 } })
    } as Response);

    const result = await fetchPointValue("http://localhost:8000", "https://example.com/data.tif", 10, 20);

    expect(result.values).toEqual({ ndvi: 0.85 });
  });

  it("throws on non-ok response", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found"
    } as Response);

    await expect(
      fetchPointValue("http://localhost:8000", "https://example.com/data.tif", 0, 0)
    ).rejects.toThrow();
  });
});
