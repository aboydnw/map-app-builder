export interface GeocodingResult {
  name: string;
  lat: number;
  lng: number;
}

export async function searchLocation(
  query: string
): Promise<GeocodingResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "earthquake-arcs-test-app"
    }
  });
  const data = await response.json();
  return data.map(
    (item: { display_name: string; lat: string; lon: string }) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon)
    })
  );
}
