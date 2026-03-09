const STAC_API = "https://planetarycomputer.microsoft.com/api/stac/v1/search";

interface STACItem {
  id: string;
  properties: Record<string, unknown>;
}

interface STACSearchResponse {
  features: STACItem[];
}

export async function fetchWorldCoverItems(
  lon: number,
  lat: number
): Promise<{ item2020: STACItem | null; item2021: STACItem | null }> {
  const body = {
    collections: ["esa-worldcover"],
    intersects: { type: "Point", coordinates: [lon, lat] },
    limit: 10
  };

  const res = await fetch(STAC_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`STAC search failed: ${res.status}`);
  const data: STACSearchResponse = await res.json();

  const item2020 =
    data.features.find(
      (f) => f.properties["esa_worldcover:product_version"] === "V1.0.0"
    ) ?? null;
  const item2021 =
    data.features.find(
      (f) => f.properties["esa_worldcover:product_version"] === "V2.0.0"
    ) ?? null;

  return { item2020, item2021 };
}

export function buildWorldCoverTileUrl(itemId: string): string {
  const params = new URLSearchParams({
    collection: "esa-worldcover",
    item: itemId,
    assets: "map",
    colormap_name: "esa-worldcover",
    format: "png"
  });
  return `https://planetarycomputer.microsoft.com/api/data/v1/item/tiles/WebMercatorQuad/{z}/{x}/{y}@1x?${params}`;
}
