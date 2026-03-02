import type { STACItem } from "@maptool/core";

const STAC_API = "https://openveda.cloud/api/stac";
const RASTER_API = "https://openveda.cloud/api/raster";
const COLLECTION_ID = "no2-monthly";

interface STACItemsResponse {
  features: STACItem[];
  links: { rel: string; href: string }[];
}

export async function fetchAllItems(): Promise<STACItem[]> {
  const items: STACItem[] = [];
  let url: string | null =
    `${STAC_API}/collections/${COLLECTION_ID}/items?limit=100`;

  while (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`STAC fetch failed: ${res.status}`);
    const data: STACItemsResponse = await res.json();
    items.push(...data.features);
    const nextLink = data.links.find((l) => l.rel === "next");
    url = nextLink?.href ?? null;
  }

  return items;
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
