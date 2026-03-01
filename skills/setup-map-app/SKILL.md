# Skill: Setup a Map Application

## When to use
When creating a map app from scratch with React, deck.gl, MapLibre GL JS, and `@maptool/core`.

## Prerequisites
- Node.js 18+
- npm or pnpm
- Docker (for running TiTiler)

## Steps

### 0. Start a local TiTiler instance

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
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react maplibre-gl react-map-gl
```

### 3. Reset default CSS for full-screen map

Replace the contents of `src/index.css` with:
```css
html, body, #root {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}
```

This removes Vite's default centering/padding styles that prevent the map from filling the viewport.

### 4. Create the base map component

Replace `src/App.tsx` with:
```tsx
import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maptool/core/styles.css";

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

type ViewState = typeof INITIAL_VIEW;

export default function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs as ViewState)}
        layers={[]}
        controller
      >
        <Map mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json" />
      </DeckGL>
    </div>
  );
}
```

Note the `as ViewState` cast on `onViewStateChange` — this is required because deck.gl's callback types are broader than our state type.

### 5. Add environment values

Create `.env` in the project root, pointing to your local TiTiler instance:
```env
VITE_TITILER_URL=http://localhost:8000
```

### 6. Verify

```bash
npm run dev
```

Confirm:
- [ ] TiTiler is running at `http://localhost:8000/docs`
- [ ] Map fills the entire browser viewport (no white borders/padding)
- [ ] CARTO Positron basemap renders with labels
- [ ] Zoom/pan controls work
- [ ] No TypeScript errors in the terminal

## Common mistakes
- **TiTiler not running** — `useTitiler` calls will fail silently or 404; always confirm `http://localhost:8000/docs` is reachable before starting the app
- Forgetting to import `maplibre-gl/dist/maplibre-gl.css` — map renders but controls are unstyled
- Forgetting to import `@maptool/core/styles.css` — maptool components render but are unstyled
- Not replacing default Vite CSS — map won't fill viewport
- Using `mapboxgl` imports instead of `maplibre-gl` — different libraries
- Missing the `as ViewState` cast — TypeScript strict mode error

## Reference files
- `templates/basic-app/src/App.tsx` — complete starter app
- `templates/basic-app/package.json` — dependency reference
