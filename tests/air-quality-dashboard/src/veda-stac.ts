import type { STACItem } from "@maptool/core";

const STAC_API = "https://openveda.cloud/api/stac";
const RASTER_API = "https://openveda.cloud/api/raster";
const COLLECTION_ID = "no2-monthly";

interface STACItemsResponse {
  features: STACItem[];
}

export async function fetchLatestNO2Item(): Promise<STACItem> {
  const url = `${STAC_API}/collections/${COLLECTION_ID}/items?limit=1&sortby=-properties.datetime`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`STAC fetch failed: ${res.status}`);
  const data: STACItemsResponse = await res.json();
  if (data.features.length === 0) throw new Error("No NO2 items found");
  return data.features[0];
}

export function buildVedaTileUrl(itemId: string): string {
  const params = new URLSearchParams({
    bidx: "1",
    assets: "cog_default",
    rescale: "0,15000000000000000",
    resampling: "bilinear",
    color_formula: "gamma r 1.05",
    colormap_name: "rdbu_r"
  });
  return `${RASTER_API}/collections/${COLLECTION_ID}/items/${itemId}/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${params}`;
}

export function getCOGAssetUrl(item: STACItem): string {
  const assets = item.assets as Record<string, { href: string }>;
  return assets["cog_default"]?.href ?? "";
}

export const VEDA_RASTER_BASE = RASTER_API;
