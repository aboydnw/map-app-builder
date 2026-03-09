const STAC_API = "https://planetarycomputer.microsoft.com/api/stac/v1/search";
const COLLECTION = "io-lulc-annual-v02";

interface STACItem {
  id: string;
  properties: { datetime: string; [key: string]: unknown };
}

interface STACSearchResponse {
  features: STACItem[];
}

export async function fetchLULCItems(
  lon: number,
  lat: number
): Promise<{ item2020: STACItem | null; item2023: STACItem | null }> {
  const body = {
    collections: [COLLECTION],
    intersects: { type: "Point", coordinates: [lon, lat] },
    limit: 20
  };

  const res = await fetch(STAC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`STAC search failed: ${res.status}`);
  const data: STACSearchResponse = await res.json();

  const item2020 =
    data.features.find((f) => f.id.includes("2020")) ?? null;
  const item2023 =
    data.features.find((f) => f.id.includes("2023")) ?? null;

  return { item2020, item2023 };
}

export function buildLULCTileUrl(itemId: string): string {
  const params = new URLSearchParams({
    collection: COLLECTION,
    item: itemId,
    assets: "data",
    format: "png"
  });
  return `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${params}`;
}
