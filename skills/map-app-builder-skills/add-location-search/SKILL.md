# Skill: Add Location Search

## When to use
When your map app needs a search box to find and fly to locations (geocoding).

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- A geocoding API key (Mapbox, Nominatim, or Esri)

## Template files

| File | Purpose |
|------|---------|
| `templates/geocoding.ts` | Nominatim geocoding utility with typed results |
| `templates/LocationSearch.tsx` | Debounced search input with autocomplete dropdown |
| `templates/fly-to-integration.tsx` | Wiring LocationSearch into App with FlyToInterpolator |
| `templates/search-marker.tsx` | ScatterplotLayer marker at the searched location |

## Steps

### 1. Choose a geocoding provider

| Provider | Free tier | API key required |
|----------|-----------|------------------|
| **Nominatim (OpenStreetMap)** | Unlimited (1 req/sec) | No |
| **Mapbox Geocoding** | 100k/month | Yes |
| **Esri World Geocoder** | 1M/month | Yes (ArcGIS) |

For prototyping, Nominatim is simplest. Copy `templates/geocoding.ts` into your app's `src/` directory. Update the `User-Agent` header to match your app name.

The utility exports a `GeocodingResult` type and a `searchLocation` function that returns parsed results with numeric `lat`/`lng` values ready for deck.gl.

### 2. Build the search component

Copy `templates/LocationSearch.tsx` into your app's `src/` directory. It imports from `./geocoding` and provides:

- Debounced input (300ms) that triggers after 3+ characters
- Autocomplete dropdown with clickable results
- Absolute positioning for map overlay (`top: 3, left: 3, zIndex: 1`)

The component calls `onSelect(lng, lat, name)` when a result is clicked.

### 3. Fly to selected location

See `templates/fly-to-integration.tsx` for the full wiring pattern. The key pieces:

- Import `FlyToInterpolator` from `@deck.gl/core`
- Create a `handleLocationSelect` handler that updates viewState with a fly-to transition
- Render `<LocationSearch onSelect={handleLocationSelect} />` alongside `<DeckGL>`

### 4. Optional: Add a marker at the searched location

See `templates/search-marker.tsx` for the pattern. Add to your App component:

1. A `searchMarker` state: `useState<[number, number] | null>(null)`
2. Set it in `handleLocationSelect`: `setSearchMarker([lng, lat])`
3. A conditional `ScatterplotLayer` included in your layers array

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

## Reference test apps
- `tests/earthquake-arcs/` — location search with fly-to transitions
- `tests/coastal-explorer/` — location search with Nominatim geocoding
