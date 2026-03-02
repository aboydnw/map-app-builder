import { describe, it, expect } from "vitest";
import { getSTACItemAssets, extractTimestamps, type STACItem } from "./stac-helpers";

function makeItem(
  id: string,
  datetime: string | null,
  assets: Record<string, any> = {},
  extraProperties: Record<string, unknown> = {}
): STACItem {
  return {
    id,
    type: "Feature",
    properties: { datetime, ...extraProperties },
    assets
  };
}

describe("getSTACItemAssets", () => {
  it("returns assets matching mime type", () => {
    const item = makeItem("i1", "2024-01-01T00:00:00Z", {
      visual: { href: "https://example.com/visual.tif", type: "image/tiff" },
      thumbnail: { href: "https://example.com/thumb.png", type: "image/png" }
    });
    const result = getSTACItemAssets(item);
    expect(result).toEqual([{ name: "visual", href: "https://example.com/visual.tif" }]);
  });

  it("returns assets with data role and .tif extension", () => {
    const item = makeItem("i2", "2024-01-01T00:00:00Z", {
      data: { href: "https://example.com/data.tif", roles: ["data"] }
    });
    const result = getSTACItemAssets(item);
    expect(result).toEqual([{ name: "data", href: "https://example.com/data.tif" }]);
  });

  it("returns empty array when no assets match", () => {
    const item = makeItem("i3", "2024-01-01T00:00:00Z", {
      thumbnail: { href: "https://example.com/thumb.png", type: "image/png" }
    });
    expect(getSTACItemAssets(item)).toEqual([]);
  });

  it("filters by custom mime type", () => {
    const item = makeItem("i4", "2024-01-01T00:00:00Z", {
      geojson: { href: "https://example.com/data.geojson", type: "application/geo+json" },
      visual: { href: "https://example.com/visual.tif", type: "image/tiff" }
    });
    const result = getSTACItemAssets(item, "application/geo+json");
    expect(result).toEqual([{ name: "geojson", href: "https://example.com/data.geojson" }]);
  });
});

describe("extractTimestamps", () => {
  it("returns sorted timestamps with item IDs", () => {
    const items = [
      makeItem("b", "2024-03-01T00:00:00Z"),
      makeItem("a", "2024-01-01T00:00:00Z"),
      makeItem("c", "2024-02-01T00:00:00Z")
    ];
    const result = extractTimestamps(items);
    expect(result).toHaveLength(3);
    expect(result[0].itemId).toBe("a");
    expect(result[1].itemId).toBe("c");
    expect(result[2].itemId).toBe("b");
  });

  it("skips items with null datetime and no start_datetime", () => {
    const items = [makeItem("a", "2024-01-01T00:00:00Z"), makeItem("b", null)];
    const result = extractTimestamps(items);
    expect(result).toHaveLength(1);
    expect(result[0].itemId).toBe("a");
  });

  it("falls back to start_datetime when datetime is null", () => {
    const items = [
      makeItem("a", null, {}, { start_datetime: "2024-01-01T00:00:00Z" }),
      makeItem("b", null, {}, { start_datetime: "2024-03-01T00:00:00Z" }),
      makeItem("c", "2024-02-01T00:00:00Z")
    ];
    const result = extractTimestamps(items);
    expect(result).toHaveLength(3);
    expect(result[0].itemId).toBe("a");
    expect(result[1].itemId).toBe("c");
    expect(result[2].itemId).toBe("b");
  });

  it("returns empty array for empty input", () => {
    expect(extractTimestamps([])).toEqual([]);
  });
});
