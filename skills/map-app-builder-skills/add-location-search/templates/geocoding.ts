// Nominatim geocoding utility — search locations using OpenStreetMap's free geocoder.
// Returns parsed results with numeric coordinates ready for deck.gl [lng, lat] usage.

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
      "User-Agent": "MyMapApp/1.0",
    },
  });
  const data = await response.json();
  return data.map(
    (item: { display_name: string; lat: string; lon: string }) => ({
      name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
    })
  );
}
