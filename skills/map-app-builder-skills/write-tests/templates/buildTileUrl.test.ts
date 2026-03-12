// Pattern: Testing a pure utility function with no React dependencies
import { describe, it, expect } from "vitest";
import { buildTileUrl } from "@maptool/core";

describe("buildTileUrl", () => {
  it("constructs valid TiTiler URL", () => {
    const url = buildTileUrl("http://localhost:8000", {
      url: "https://example.com/data.tif",
      colormap: "viridis",
      bidx: 1,
      rescale: [0, 100],
    });
    expect(url).toContain("{z}/{x}/{y}");
    expect(url).toContain("colormap_name=viridis");
    expect(url).toContain("rescale=0%2C100");
  });
});
