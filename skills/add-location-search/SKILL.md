# Skill: Add Location Search

## When to use
When your map app needs a search box to find and fly to locations (geocoding).

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A geocoding API key (Mapbox, Nominatim, or Esri)

## Steps

### 1. Choose a geocoding provider

| Provider | Free tier | API key required |
|----------|-----------|------------------|
| **Nominatim (OpenStreetMap)** | Unlimited (1 req/sec) | No |
| **Mapbox Geocoding** | 100k/month | Yes |
| **Esri World Geocoder** | 1M/month | Yes (ArcGIS) |

For prototyping, Nominatim is simplest:

```tsx
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

async function geocode(query: string) {
  const params = new URLSearchParams({
    q: query,
    format: "json",
    limit: "5",
  });
  const res = await fetch(`${NOMINATIM_URL}?${params}`, {
    headers: { "User-Agent": "MyMapApp/1.0" },
  });
  return res.json() as Promise<Array<{
    display_name: string;
    lat: string;
    lon: string;
    boundingbox: [string, string, string, string];
  }>>;
}
```

### 2. Build the search component

```tsx
import { useState, useRef } from "react";
import { Box, Input, List } from "@chakra-ui/react";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

function LocationSearch({ onSelect }: { onSelect: (lng: number, lat: number, name: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleInput = (value: string) => {
    setQuery(value);
    clearTimeout(debounceRef.current);
    if (value.length < 3) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const data = await geocode(value);
      setResults(data);
    }, 300);
  };

  return (
    <Box position="absolute" top={3} left={3} zIndex={1} w="300px">
      <Input
        placeholder="Search location..."
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        bg="white"
        boxShadow="md"
      />
      {results.length > 0 && (
        <List.Root bg="white" borderRadius="md" boxShadow="md" mt={1} maxH="200px" overflowY="auto">
          {results.map((r, i) => (
            <List.Item
              key={i}
              p={2}
              cursor="pointer"
              _hover={{ bg: "gray.100" }}
              onClick={() => {
                onSelect(parseFloat(r.lon), parseFloat(r.lat), r.display_name);
                setResults([]);
                setQuery(r.display_name);
              }}
              fontSize="sm"
            >
              {r.display_name}
            </List.Item>
          ))}
        </List.Root>
      )}
    </Box>
  );
}
```

### 3. Fly to selected location

```tsx
import { FlyToInterpolator } from "@deck.gl/core";

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  const handleLocationSelect = (lng: number, lat: number, _name: string) => {
    setViewState({
      ...viewState,
      longitude: lng,
      latitude: lat,
      zoom: 12,
      transitionDuration: 2000,
      transitionInterpolator: new FlyToInterpolator(),
    } as any);
  };

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={layers}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>
      <LocationSearch onSelect={handleLocationSelect} />
    </div>
  );
}
```

### 4. Optional: Add a marker at the searched location

```tsx
import { ScatterplotLayer } from "@deck.gl/layers";

const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);

const handleLocationSelect = (lng: number, lat: number) => {
  setSearchMarker([lng, lat]);
  // ... fly-to logic
};

const markerLayer = searchMarker
  ? new ScatterplotLayer({
      id: "search-marker",
      data: [{ position: searchMarker }],
      getPosition: (d) => d.position,
      getRadius: 8,
      getFillColor: [255, 64, 64],
      radiusUnits: "pixels",
      stroked: true,
      getLineColor: [255, 255, 255],
      getLineWidth: 2,
      lineWidthUnits: "pixels",
    })
  : null;
```

### 5. Verify

- [ ] Search input appears over the map
- [ ] Typing 3+ characters shows autocomplete results
- [ ] Clicking a result flies the map to that location
- [ ] Debounce prevents excessive API calls
- [ ] Results dropdown closes after selection
- [ ] Marker appears at searched location (if implemented)

## Common mistakes
- **Missing User-Agent for Nominatim** — required by their usage policy; include your app name
- **No debounce** — firing geocode requests on every keystroke will hit rate limits
- **Coordinate order** — Nominatim returns `lat`/`lon` as strings; parse and swap for deck.gl's `[lng, lat]` order
- **FlyToInterpolator import** — comes from `@deck.gl/core`, not `@deck.gl/react`
- **Search results behind map** — ensure the search container has `zIndex: 1` or higher

## Reference files
- `@deck.gl/core` — `FlyToInterpolator` for smooth transitions
- `@deck.gl/layers` — `ScatterplotLayer` for search markers
