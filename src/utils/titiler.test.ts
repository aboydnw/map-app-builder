import { describe, expect, it } from "vitest";
import { buildTileUrl } from "./titiler";

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
