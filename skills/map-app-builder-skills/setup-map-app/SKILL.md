# Skill: Setup a Map Application

## When to use
When creating a map app from scratch with React, deck.gl, MapLibre GL JS, and `@maptool/core`.

## Prerequisites
- Node.js 18+
- npm or pnpm
- Docker (for running TiTiler)

## Template files

All starter code is in the `templates/` directory alongside this skill:

| File | Purpose |
|------|---------|
| `templates/styles.css` | Full-screen map CSS reset |
| `templates/main.tsx` | Entry point with MapToolProvider |
| `templates/main-pmtiles.tsx` | Entry point with QueryClient + PMTiles support |
| `templates/main-stac.tsx` | Entry point with QueryClient + StacApiProvider |
| `templates/App.tsx` | Base map component with DeckGL + MapLibre |
| `templates/pmtiles-protocol.tsx` | useEffect hook to register PMTiles protocol |
| `templates/vite-proxy.config.ts` | Vite dev server CORS proxy example |

## Steps

### 0. Start a local TiTiler instance

> **Full local stack:** For a STAC catalog + TiTiler + file server, see the `setup-local-stac` skill instead. The steps below start TiTiler only.

TiTiler is the raster tile server that turns COGs into map tiles. You need your own instance — there is no public production endpoint.

```bash
docker run \
  --platform=linux/amd64 \
  -p 8000:8000 \
  --rm -it \
  ghcr.io/developmentseed/titiler:latest \
  uvicorn titiler.application.main:app --host 0.0.0.0 --port 8000 --workers 1
```

Verify it's running by visiting `http://localhost:8000/docs` — you should see the TiTiler OpenAPI docs page.

> **Tip:** Leave this running in a dedicated terminal tab. Add `-d` to `docker run` to daemonize it instead.
>
> For production deployments, see the [TiTiler deployment guide](https://developmentseed.org/titiler/deployment/) for AWS Lambda, ECS, and Kubernetes Helm chart options.

### 1. Scaffold the project

```bash
npm create vite@latest my-map-app -- --template react-ts
cd my-map-app
```

### 2. Install dependencies

For local development against the maptool repo:
```bash
npm install @maptool/core@file:../map-app-builder
```

Or if published to npm:
```bash
npm install @maptool/core
```

Then install map dependencies:
```bash
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react maplibre-gl react-map-gl @chakra-ui/react @emotion/react
```

For PMTiles support, also install:
```bash
npm install pmtiles @tanstack/react-query
```

For STAC catalog support, also install:
```bash
npm install stac-react @tanstack/react-query
```

### 3. Reset default CSS for full-screen map

Copy `templates/styles.css` to `src/index.css`. This removes Vite's default centering/padding styles that prevent the map from filling the viewport.

### 4. Set up providers in main.tsx

Choose the appropriate entry point template based on your data sources:

- **Basic (COG tiles only):** Copy `templates/main.tsx`
- **PMTiles support:** Copy `templates/main-pmtiles.tsx` and add the PMTiles protocol registration from `templates/pmtiles-protocol.tsx` inside your App component
- **STAC catalog support:** Copy `templates/main-stac.tsx`

See the `add-pmtiles-raster-layer` and `add-pmtiles-vector-layer` skills for full PMTiles usage.

### 5. Create the base map component

Copy `templates/App.tsx` to `src/App.tsx`. This sets up DeckGL with a MapLibre basemap and basic view state management.

Note the `as ViewState` cast on `onViewStateChange` — this is required because deck.gl's callback types are broader than our state type.

### 6. Add environment values

Create `.env` in the project root, pointing to your local TiTiler instance:
```env
VITE_TITILER_URL=http://localhost:8000
```

### 7. Layout variants

**Full-screen map (default):** The setup above fills the entire viewport.

**Sidebar + map:** See the `set-app-layout` skill for a Chakra Flex-based layout with a collapsible side panel.

**Globe view:** See the `add-globe-view` skill to use deck.gl's `GlobeView` instead of the default Mercator projection. Note: globe mode does not use MapLibre.

### 8. Verify

```bash
npm run dev
```

Confirm:
- [ ] TiTiler is running at `http://localhost:8000/docs`
- [ ] Map fills the entire browser viewport (no white borders/padding)
- [ ] CARTO Positron basemap renders with labels
- [ ] Zoom/pan controls work
- [ ] No TypeScript errors in the terminal

### 9. Handle CORS for external data APIs

Some data APIs (e.g. NASA FIRMS CSV endpoint) don't include CORS headers, so browser `fetch()` will fail. See `templates/vite-proxy.config.ts` for a Vite dev server proxy example. Then fetch from `/api/firms/...` instead of the full URL. This only works in dev mode — for production, use a server-side proxy or a CORS-friendly API endpoint.

### 10. Test app `npm install` requirement

When creating test apps under `tests/` that use `"@maptool/core": "file:../../"`, you must run `npm install` inside the test app directory after creating its `package.json`. The `file:` link resolves peer dependencies (deck.gl, luma.gl, MapLibre) from the root `node_modules`, but this only works after `npm install` creates the local `node_modules` with proper symlinks. Without this step, imports like `@luma.gl/core` (used in the CanvasContext resize workaround in `main.tsx`) will fail to resolve.

## Common mistakes
- **TiTiler not running** — `useTitiler` calls will fail silently or 404; always confirm `http://localhost:8000/docs` is reachable before starting the app
- Forgetting to import `maplibre-gl/dist/maplibre-gl.css` — map renders but controls are unstyled
- Not replacing default Vite CSS — map won't fill viewport
- Using `mapboxgl` imports instead of `maplibre-gl` — different libraries
- Missing the `as ViewState` cast — TypeScript strict mode error
- **Missing `MapToolProvider`** — maptool components (MapLegend, AnimationTimeline) require the Chakra provider wrapper
- **CORS errors fetching external APIs** — if `fetch()` fails with a network error (no HTTP status), the API likely doesn't set `Access-Control-Allow-Origin`. Use Vite's proxy (see `templates/vite-proxy.config.ts`) for dev, or find a CORS-friendly endpoint.
- **Test app missing `node_modules`** — test apps with `file:` links need `npm install` run locally. Without it, transitive peer deps like `@luma.gl/core` won't resolve.

## Reference files
- `templates/basic-app/src/App.tsx` — complete starter app
- `templates/basic-app/package.json` — dependency reference
