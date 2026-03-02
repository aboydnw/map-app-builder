# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

`@maptool/core` — an npm library of reusable React components, hooks, and utilities for building geospatial map applications with deck.gl, MapLibre GL JS, and TiTiler.

## Commands

```bash
npm run build        # Vite library build + TypeScript declaration emit
npm run test         # Vitest (unit tests, jsdom)
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright end-to-end tests
npm run lint         # TypeScript type-check (tsc --noEmit)
npm run dev          # Vite dev server
```

Run a single test file: `npx vitest run src/utils/titiler.test.ts`

## Architecture

This is a **library** (not an app). It builds to `dist/` as ES + CJS modules via Vite's library mode. React, deck.gl, MapLibre, and Chakra UI are peer dependencies (externalized from the bundle).

### Source layout (`src/`)

- **`components/`** — React UI components (`MapLegend`, `AnimationTimeline`, `MapToolProvider` which wraps Chakra's `ChakraProvider`)
- **`hooks/`** — React hooks (`useTitiler`, `useSTAC`, `useAnimationClock`, `useColorScale`, `useTimeRange`)
- **`layers/`** — deck.gl layer factory functions (`createCOGLayer`, `createSTACLayer`)
- **`utils/`** — Pure utility functions for TiTiler API calls, STAC catalog operations, colormaps, and number formatting
- **`index.ts`** — Public API barrel export (all components, hooks, layers, utils, and types)

### Key integration points

- **TiTiler**: `useTitiler` hook and `src/utils/titiler.ts` handle COG metadata fetching and tile URL construction against a TiTiler raster tile server
- **STAC**: `useSTAC` hook and `src/utils/stac.ts` handle SpatioTemporal Asset Catalog search and item management
- **Colormaps**: `src/utils/colormaps.ts` contains built-in colormap definitions used by `useColorScale`

## Testing

Tests live alongside source files as `*.test.{ts,tsx}`. Uses Vitest with jsdom environment. Test utilities in `src/test-utils.tsx`.
