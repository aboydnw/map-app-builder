// Utilities for working with Microsoft Planetary Computer's tile API.
// Use buildPCTileUrl to get a tile URL without running your own TiTiler.
// Use pickSmallestBbox to select the best spatial tile from multi-tile collections.

interface PCTileOptions {
  colormap_name?: string;
  rescale?: string;
  nodata?: string;
  format?: string;
}

export function buildPCTileUrl(
  collection: string,
  itemId: string,
  asset: string,
  options?: PCTileOptions
): string {
  const params = new URLSearchParams({
    collection,
    item: itemId,
    assets: asset,
  });
  if (options?.colormap_name) params.set("colormap_name", options.colormap_name);
  if (options?.rescale) params.set("rescale", options.rescale);
  if (options?.nodata) params.set("nodata", options.nodata);
  if (options?.format) params.set("format", options.format);
  return `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${params}`;
}

function bboxWidth(bbox: number[]): number {
  const [minLon, , maxLon] = bbox;
  return maxLon >= minLon ? maxLon - minLon : 360 + maxLon - minLon;
}

export function pickSmallestBbox<T extends { bbox: number[] }>(
  items: T[]
): T | undefined {
  return [...items].sort((a, b) => bboxWidth(a.bbox) - bboxWidth(b.bbox))[0];
}
