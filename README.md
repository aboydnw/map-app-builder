# @maptool/core

React components and hooks for building map applications with [deck.gl](https://deck.gl) and [MapLibre GL JS](https://maplibre.org/).

## Install

```bash
npm install @maptool/core
```

Peer dependencies:
```bash
npm install react react-dom @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react maplibre-gl
```

## TiTiler Setup

`@maptool/core` requires a [TiTiler](https://developmentseed.org/titiler/) instance to serve raster tiles from Cloud Optimized GeoTIFFs. Run one locally with Docker:

```bash
docker run \
  --platform=linux/amd64 \
  -p 8000:8000 \
  --rm -it \
  ghcr.io/developmentseed/titiler:latest \
  uvicorn titiler.application.main:app --host 0.0.0.0 --port 8000 --workers 1
```

Then create a `.env` in your app:
```env
VITE_TITILER_URL=http://localhost:8000
```

For production deployments, see the [TiTiler deployment docs](https://developmentseed.org/titiler/deployment/) (AWS Lambda, ECS, Kubernetes).

## Quick Start

```tsx
import { useState } from "react";
import DeckGL from "@deck.gl/react";
import { Map } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import "@maptool/core/styles.css";  // required for component styling

import { MapLegend, useTitiler, useColorScale, createCOGLayer } from "@maptool/core";

export default function App() {
  const [viewState, setViewState] = useState({
    longitude: -95.7, latitude: 37.1, zoom: 4, pitch: 0, bearing: 0,
  });
  type ViewState = typeof viewState;

  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL,
    url: "https://example.com/my-data.tif",
    colormap: "viridis",
  });

  const { colors } = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: "viridis",
    steps: 8,
  });

  const layers = titiler.tileUrl
    ? [createCOGLayer({ id: "cog", tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
    : [];

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

      {titiler.rescaleRange ? (
        <MapLegend
          layers={[{
            type: "continuous",
            id: "cog",
            title: "Data",
            domain: titiler.rescaleRange,
            colors,
            ticks: 5,
          }]}
        />
      ) : null}
    </div>
  );
}
```

## Components

- **`MapLegend`** — Continuous color ramps and categorical swatches with collapsible panels, layer toggling, and full ARIA support.
- **`AnimationTimeline`** — Play/pause, step, speed control, and scrubber for temporal data. Supports single-timestamp and time-window modes.

## Hooks

- **`useAnimationClock`** — requestAnimationFrame-based playback clock with speed control.
- **`useTitiler`** — Connects to a TiTiler instance, fetches COG metadata/statistics, builds tile URLs.
- **`useSTAC`** — Searches STAC catalogs and manages item selection.
- **`useColorScale`** — Generates color arrays from named colormaps for legend rendering.
- **`useTimeRange`** — Dual-handle time window state management.

## Layer Helpers

- **`createCOGLayer`** — Creates a deck.gl TileLayer configured for TiTiler COG tiles.
- **`createSTACLayer`** — Creates a COG layer directly from a STAC item.

## Colormaps

Built-in: `viridis`, `magma`, `inferno`, `plasma`, `cividis`, `coolwarm`, `RdYlGn`, `RdBu`, `YlOrRd`, `Blues`, `Greens`.

## Cursor Skills

The `skills/` directory contains prompt documents for AI coding assistants. See `skills/README.md`.

## Theming

Override CSS custom properties to theme all components:
```css
:root {
  --mt-bg: rgba(255, 255, 255, 0.9);
  --mt-accent: #3b82f6;
  --mt-border: #e5e7eb;
  --mt-text-primary: #111827;
  --mt-radius: 8px;
}
```

Dark mode: set `data-theme="dark"` on any ancestor element.

## License

MIT
