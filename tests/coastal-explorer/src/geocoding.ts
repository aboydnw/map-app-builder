export interface SearchResult {
  name: string;
  lat: number;
  lng: number;
}

export async function searchLocation(query: string): Promise<SearchResult[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "5");

  const response = await fetch(url.toString(), {
    headers: { "User-Agent": "coastal-explorer-demo" },
  });

  if (!response.ok) return [];

  const data = await response.json();
  return data.map(
    (item: { display_name: string; lat: string; lon: string }) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    })
  );
}
