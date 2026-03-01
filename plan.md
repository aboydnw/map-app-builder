# maptool — Architecture & Implementation Spec

> A React component library and Cursor skill set for rapidly building map applications with deck.gl, MapLibre GL JS, and cloud-native geospatial data.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Repo Structure](#3-repo-structure)
4. [Build & Tooling Configuration](#4-build--tooling-configuration)
5. [Component: MapLegend](#5-component-maplegend)
6. [Component: AnimationTimeline](#6-component-animationtimeline)
7. [Hooks](#7-hooks)
8. [Utils](#8-utils)
9. [Layer Wrappers](#9-layer-wrappers)
10. [Template App](#10-template-app)
11. [Cursor Skills](#11-cursor-skills)
12. [Testing Strategy](#12-testing-strategy)
13. [CSS & Theming](#13-css--theming)
14. [Future Expansion Notes](#14-future-expansion-notes)

---

## 1. Project Overview

### Problem
The deck.gl + MapLibre ecosystem has powerful rendering but zero reusable UI components for legends, timelines, or layer controls. kepler.gl has all of these but they're locked inside a monolithic Redux architecture. Developers rebuilding these from scratch for every project.

### Solution
`maptool` provides:
- **Standalone React components** (MapLegend, AnimationTimeline) with clean controlled APIs
- **Hooks** for data fetching (TiTiler, STAC) and animation state
- **Layer wrappers** that simplify common deck.gl patterns
- **Cursor skills** that let AI agents scaffold full map apps in minutes
- **A starter template** for new projects

### Design Principles
1. **Controlled components** — No internal state surprises. Props in, callbacks out.
2. **Hooks for logic, components for UI** — All complex logic lives in hooks that work independently of the components.
3. **Zero Redux** — React hooks + props only. No state management library required.
4. **Peer dependencies for heavy libs** — deck.gl, MapLibre, React are peer deps, not bundled.
5. **Cursor-first DX** — Clean TypeScript types, simple APIs, self-documenting code. Every function has JSDoc. Every type is exported.
6. **Expand later** — Architecture supports adding NASA GIBS, PMTiles, Overture Maps, etc. without refactoring.

---

## 2. Tech Stack & Dependencies

### Package dependencies

```json
{
  "name": "@maptool/core",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/index.cjs",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0",
    "@deck.gl/core": "^9.0.0",
    "@deck.gl/layers": "^9.0.0",
    "@deck.gl/geo-layers": "^9.0.0",
    "@deck.gl/react": "^9.0.0",
    "maplibre-gl": "^4.0.0"
  },
  "dependencies": {
    "d3-scale": "^4.0.0",
    "d3-format": "^3.0.0",
    "d3-interpolate": "^3.0.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^25.0.0",
    "playwright": "^1.48.0",
    "@playwright/test": "^1.48.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@deck.gl/core": "^9.0.0",
    "@deck.gl/layers": "^9.0.0",
    "@deck.gl/geo-layers": "^9.0.0",
    "@deck.gl/react": "^9.0.0",
    "maplibre-gl": "^4.0.0",
    "@types/d3-scale": "^4.0.0",
    "@types/d3-format": "^3.0.0",
    "@types/d3-interpolate": "^3.0.0"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build && tsc --emitDeclarationOnly",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "lint": "tsc --noEmit",
    "preview": "vite preview"
  }
}
```

---

## 3. Repo Structure

```
maptool/
├── src/
│   ├── components/
│   │   ├── MapLegend/
│   │   │   ├── MapLegend.tsx           # Main component — orchestrates legend items
│   │   │   ├── MapLegend.test.tsx      # Unit tests
│   │   │   ├── ContinuousRamp.tsx      # Gradient color bar with ticks
│   │   │   ├── CategoricalLegend.tsx   # Color swatches + labels
│   │   │   ├── LegendItem.tsx          # Single layer legend wrapper (title, collapse, toggle)
│   │   │   ├── types.ts               # All legend-related types
│   │   │   └── index.ts               # Re-exports
│   │   ├── AnimationTimeline/
│   │   │   ├── AnimationTimeline.tsx   # Main component — orchestrates playback UI
│   │   │   ├── AnimationTimeline.test.tsx
│   │   │   ├── TimeSlider.tsx          # Range input with custom styling
│   │   │   ├── PlaybackControls.tsx    # Play/pause/step buttons
│   │   │   ├── SpeedControl.tsx        # Speed multiplier selector
│   │   │   ├── Histogram.tsx           # Optional data density background
│   │   │   ├── TimestampDisplay.tsx    # Current time label
│   │   │   ├── types.ts               # All timeline-related types
│   │   │   └── index.ts
│   │   └── index.ts                    # Public barrel: export { MapLegend } from './MapLegend'
│   ├── hooks/
│   │   ├── useAnimationClock.ts        # rAF-based animation loop
│   │   ├── useTimeRange.ts             # Dual-handle time window state
│   │   ├── useTitiler.ts              # COG metadata + tile URL construction
│   │   ├── useSTAC.ts                 # STAC search + item fetching
│   │   ├── useColorScale.ts           # d3-scale wrapper
│   │   └── index.ts
│   ├── utils/
│   │   ├── colormaps.ts               # Pre-baked color arrays (viridis, magma, inferno, etc.)
│   │   ├── formatters.ts             # Number and date formatting
│   │   ├── titiler.ts                # Pure functions: TiTiler URL building, stats parsing
│   │   ├── stac.ts                   # Pure functions: STAC API helpers
│   │   └── index.ts
│   ├── layers/
│   │   ├── COGLayer.ts               # Wrapper: TiTiler → TileLayer + BitmapLayer
│   │   ├── STACLayer.ts              # Wrapper: STAC item → COGLayer with metadata
│   │   └── index.ts
│   ├── styles/
│   │   ├── base.css                  # CSS custom properties (theming tokens)
│   │   ├── legend.css                # MapLegend styles
│   │   └── timeline.css              # AnimationTimeline styles
│   └── index.ts                      # Public API barrel
├── skills/
│   ├── README.md                     # How to use skills with Cursor
│   ├── setup-map-app/
│   │   └── SKILL.md
│   ├── add-cog-layer/
│   │   └── SKILL.md
│   ├── add-stac-layer/
│   │   └── SKILL.md
│   ├── add-animation/
│   │   └── SKILL.md
│   └── write-tests/
│       └── SKILL.md
├── templates/
│   └── basic-app/
│       ├── src/
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── map-config.ts
│       ├── index.html
│       ├── package.json
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── vite.config.ts
├── tests/
│   └── e2e/
│       ├── legend.spec.ts
│       └── timeline.spec.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── playwright.config.ts
├── .gitignore
├── LICENSE                           # MIT
└── README.md
```

---

## 4. Build & Tooling Configuration

### vite.config.ts (library mode)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'maptool',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@deck.gl/core',
        '@deck.gl/layers',
        '@deck.gl/geo-layers',
        '@deck.gl/react',
        'maplibre-gl',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationDir": "dist",
    "outDir": "dist",
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests", "templates"]
}
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.*', 'src/**/types.ts', 'src/**/index.ts'],
    },
  },
});
```

### src/test-setup.ts

```typescript
import '@testing-library/jest-dom';
```

### tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  prefix: 'mt-', // maptool prefix to avoid collisions with consumer Tailwind
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
```

### postcss.config.js

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

### playwright.config.ts

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  use: { baseURL: 'http://localhost:5173' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 5. Component: MapLegend

### Types — `src/components/MapLegend/types.ts`

```typescript
import type { ScaleLinear, ScaleQuantize, ScaleThreshold, ScaleOrdinal } from 'd3-scale';

/** Supported scale types for continuous legends */
export type ContinuousScaleType = 'linear' | 'quantize' | 'quantile' | 'threshold' | 'log' | 'sqrt';

/** A single stop in a continuous color ramp */
export interface ColorStop {
  value: number;
  color: string; // hex, rgb, or CSS color
}

/** Configuration for a continuous (gradient) legend entry */
export interface ContinuousLegendConfig {
  type: 'continuous';
  /** Unique layer identifier */
  id: string;
  /** Display title, e.g. "Temperature" */
  title: string;
  /** Unit label, e.g. "°C" — rendered in parentheses after title */
  unit?: string;
  /** [min, max] data domain */
  domain: [number, number];
  /** Array of CSS colors (min to max). Minimum 2 colors. */
  colors: string[];
  /** Scale type. Default: 'linear' */
  scaleType?: ContinuousScaleType;
  /** Number of labeled tick marks. Default: 5 */
  ticks?: number;
  /** d3-format string for tick labels. Default: '~s' (SI prefix) */
  tickFormat?: string;
  /** Custom tick formatter function — overrides tickFormat */
  formatTick?: (value: number) => string;
  /** Whether clicking this legend item toggles layer visibility. Default: false */
  toggler?: boolean;
  /** Current visibility state (controlled). Only relevant if toggler=true */
  visible?: boolean;
}

/** A single category entry */
export interface CategoryEntry {
  value: string;
  color: string;
  /** Optional label override. Default: uses value */
  label?: string;
}

/** Configuration for a categorical legend entry */
export interface CategoricalLegendConfig {
  type: 'categorical';
  id: string;
  title: string;
  categories: CategoryEntry[];
  /** Shape of the color swatch. Default: 'square' */
  shape?: 'square' | 'circle' | 'line';
  toggler?: boolean;
  visible?: boolean;
}

/** Union of all legend layer configs */
export type LegendLayerConfig = ContinuousLegendConfig | CategoricalLegendConfig;

/** Legend orientation */
export type LegendOrientation = 'vertical' | 'horizontal';

/** Legend positioning on the map */
export type LegendPosition =
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

/** Props for the main MapLegend component */
export interface MapLegendProps {
  /** Array of legend layer configurations */
  layers: LegendLayerConfig[];
  /** Layout direction. Default: 'vertical' */
  orientation?: LegendOrientation;
  /** Position on the map overlay. Default: 'bottom-left' */
  position?: LegendPosition;
  /** Whether the entire legend panel is collapsible. Default: true */
  collapsible?: boolean;
  /** Whether individual legend items can be collapsed. Default: true */
  collapsibleItems?: boolean;
  /** Initial collapsed state. Default: false */
  defaultCollapsed?: boolean;
  /** HTML heading level for legend titles (h2-h6). Default: 3 */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Callback when a layer is toggled via the toggler control */
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  /** Additional CSS class name */
  className?: string;
}
```

### Main component — `src/components/MapLegend/MapLegend.tsx`

```typescript
import React, { useState } from 'react';
import { LegendItem } from './LegendItem';
import { ContinuousRamp } from './ContinuousRamp';
import { CategoricalLegend } from './CategoricalLegend';
import type {
  MapLegendProps,
  LegendLayerConfig,
  ContinuousLegendConfig,
  CategoricalLegendConfig,
} from './types';

/**
 * MapLegend — A composable, accessible legend overlay for deck.gl + MapLibre maps.
 *
 * Renders as an absolutely-positioned panel on top of the map container.
 * Supports continuous color ramps and categorical swatches.
 * Fully controlled: visibility toggling is handled via onLayerToggle callback.
 *
 * @example
 * ```tsx
 * <MapLegend
 *   layers={[
 *     {
 *       type: 'continuous',
 *       id: 'temperature',
 *       title: 'Surface Temperature',
 *       unit: '°C',
 *       domain: [-20, 45],
 *       colors: ['#313695', '#ffffbf', '#a50026'],
 *       ticks: 5,
 *     },
 *   ]}
 *   position="bottom-left"
 *   onLayerToggle={(id, visible) => console.log(id, visible)}
 * />
 * ```
 */
export function MapLegend({
  layers,
  orientation = 'vertical',
  position = 'bottom-left',
  collapsible = true,
  collapsibleItems = true,
  defaultCollapsed = false,
  headingLevel = 3,
  onLayerToggle,
  className,
}: MapLegendProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  // Position mapping to CSS classes
  const positionStyles: Record = {
    'top-left': 'mt-top-2 mt-left-2',
    'top-right': 'mt-top-2 mt-right-2',
    'bottom-left': 'mt-bottom-8 mt-left-2',
    'bottom-right': 'mt-bottom-8 mt-right-2',
  };

  const Heading = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  return (
    <div
      className={`mt-absolute ${positionStyles[position]} mt-z-10 mt-bg-white/90 mt-backdrop-blur-sm mt-rounded-lg mt-shadow-lg mt-border mt-border-gray-200 mt-max-w-xs mt-overflow-hidden ${className ?? ''}`}
      role="region"
      aria-label="Map legend"
    >
      {/* Header with collapse toggle */}
      {collapsible && (
        <button
          className="mt-w-full mt-flex mt-items-center mt-justify-between mt-px-3 mt-py-2 mt-text-xs mt-font-semibold mt-text-gray-600 mt-uppercase mt-tracking-wider hover:mt-bg-gray-50 mt-transition-colors"
          onClick={() => setCollapsed(!collapsed)}
          aria-expanded={!collapsed}
          aria-controls="maptool-legend-content"
        >
          Legend
          
            
          
        
      )}

      {/* Legend content */}
      {!collapsed && (
        
          {layers.map((layer) => (
            <LegendItem
              key={layer.id}
              config={layer}
              collapsible={collapsibleItems}
              headingLevel={(headingLevel + 1) as 3 | 4 | 5 | 6}
              onToggle={
                layer.toggler && onLayerToggle
                  ? (visible) => onLayerToggle(layer.id, visible)
                  : undefined
              }
            >
              {layer.type === 'continuous' ? (
                
              ) : (
                
              )}
            
          ))}
        
      )}
    
  );
}
```

### ContinuousRamp — `src/components/MapLegend/ContinuousRamp.tsx`

```typescript
import React, { useMemo } from 'react';
import { format as d3Format } from 'd3-format';
import type { ContinuousLegendConfig, LegendOrientation } from './types';

interface ContinuousRampProps {
  config: ContinuousLegendConfig;
  orientation: LegendOrientation;
}

/**
 * Renders a smooth CSS gradient bar with labeled ticks.
 * Uses CSS linear-gradient for performance — no canvas/SVG needed.
 */
export function ContinuousRamp({ config, orientation }: ContinuousRampProps) {
  const {
    domain,
    colors,
    ticks: tickCount = 5,
    tickFormat = '~s',
    formatTick,
  } = config;

  const isHorizontal = orientation === 'horizontal';

  // Build CSS gradient string
  const gradient = useMemo(() => {
    const stops = colors
      .map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`)
      .join(', ');
    return isHorizontal
      ? `linear-gradient(to right, ${stops})`
      : `linear-gradient(to top, ${stops})`;
  }, [colors, isHorizontal]);

  // Generate tick values
  const ticks = useMemo(() => {
    const [min, max] = domain;
    const step = (max - min) / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) => min + step * i);
  }, [domain, tickCount]);

  // Format tick labels
  const formatter = useMemo(() => {
    if (formatTick) return formatTick;
    return d3Format(tickFormat);
  }, [formatTick, tickFormat]);

  if (isHorizontal) {
    return (
      
        
        
          {ticks.map((v) => (
            {formatter(v)}
          ))}
        
      
    );
  }

  return (
    
      
      
        {[...ticks].reverse().map((v) => (
          {formatter(v)}
        ))}
      
    
  );
}
```

### CategoricalLegend — `src/components/MapLegend/CategoricalLegend.tsx`

```typescript
import React from 'react';
import type { CategoricalLegendConfig } from './types';

interface CategoricalLegendProps {
  config: CategoricalLegendConfig;
}

/**
 * Renders a list of colored swatches with text labels.
 * Supports square, circle, and line shapes.
 */
export function CategoricalLegend({ config }: CategoricalLegendProps) {
  const { categories, shape = 'square' } = config;

  const shapeClass = {
    square: 'mt-rounded-sm',
    circle: 'mt-rounded-full',
    line: 'mt-rounded-full mt-h-0.5 mt-w-4',
  };

  return (
    
      {categories.map((cat) => (
        
          <span
            className={`mt-shrink-0 ${shape === 'line' ? shapeClass.line : `mt-w-3 mt-h-3 ${shapeClass[shape]}`}`}
            style={{ backgroundColor: cat.color }}
            aria-hidden="true"
          />
          
            {cat.label ?? cat.value}
          
        
      ))}
    
  );
}
```

### LegendItem — `src/components/MapLegend/LegendItem.tsx`

```typescript
import React, { useState } from 'react';
import type { LegendLayerConfig } from './types';

interface LegendItemProps {
  config: LegendLayerConfig;
  collapsible: boolean;
  headingLevel: 3 | 4 | 5 | 6;
  onToggle?: (visible: boolean) => void;
  children: React.ReactNode;
}

/**
 * Wraps a legend entry with a title bar, optional collapse toggle,
 * and optional layer visibility toggle.
 */
export function LegendItem({
  config,
  collapsible,
  headingLevel,
  onToggle,
  children,
}: LegendItemProps) {
  const [expanded, setExpanded] = useState(true);
  const Heading = `h${headingLevel}` as keyof JSX.IntrinsicElements;

  const title = config.unit ? `${config.title} (${config.unit})` : config.title;

  return (
    
      
        {/* Visibility toggle */}
        {onToggle && (
          <button
            className={`mt-w-3.5 mt-h-3.5 mt-rounded-sm mt-border mt-transition-colors ${
              config.visible !== false
                ? 'mt-bg-blue-500 mt-border-blue-500'
                : 'mt-bg-white mt-border-gray-300'
            }`}
            onClick={() => onToggle(config.visible === false)}
            aria-label={`Toggle ${config.title} visibility`}
            aria-pressed={config.visible !== false}
          >
            {config.visible !== false && (
              
                
              
            )}
          
        )}

        {/* Title — clickable if collapsible */}
        {collapsible ? (
          <button
            className="mt-flex mt-items-center mt-gap-1 mt-text-xs mt-font-medium mt-text-gray-800 hover:mt-text-gray-600 mt-transition-colors"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {title}
            
              
            
          
        ) : (
          
            {title}
          
        )}
      

      {expanded && children}
    
  );
}
```

---

## 6. Component: AnimationTimeline

### Types — `src/components/AnimationTimeline/types.ts`

```typescript
/** Animation playback mode */
export type TimelineMode = 'timestamp' | 'window';

/** Speed preset option */
export interface SpeedOption {
  label: string;
  value: number; // multiplier (1 = normal, 2 = double, 0.5 = half)
}

/** A single timestep with associated data */
export interface Timestep {
  /** Timestamp in milliseconds since epoch, or ISO string */
  time: number | string;
  /** Optional label override */
  label?: string;
}

/** Histogram bin for temporal data density visualization */
export interface HistogramBin {
  /** Start of bin (ms since epoch) */
  start: number;
  /** End of bin (ms since epoch) */
  end: number;
  /** Count of items in this bin */
  count: number;
}

/** Props for the main AnimationTimeline component */
export interface AnimationTimelineProps {
  /** Ordered array of available timestamps */
  timestamps: Timestep[];

  /** Current playback mode. Default: 'timestamp' */
  mode?: TimelineMode;

  // --- Single timestamp mode (mode='timestamp') ---
  /** Current timestamp index in the timestamps array */
  currentIndex: number;
  /** Callback when the current index changes */
  onIndexChange: (index: number) => void;

  // --- Window mode (mode='window') ---
  /** Start index of the time window */
  windowStart?: number;
  /** End index of the time window */
  windowEnd?: number;
  /** Callback when the window range changes */
  onWindowChange?: (start: number, end: number) => void;

  // --- Playback state (controlled) ---
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** Callback when play state changes */
  onPlayingChange: (playing: boolean) => void;

  // --- Speed ---
  /** Current speed multiplier. Default: 1 */
  speed?: number;
  /** Callback when speed changes */
  onSpeedChange?: (speed: number) => void;
  /** Available speed options. Default: [0.5, 1, 2, 4] */
  speedOptions?: SpeedOption[];

  // --- Display ---
  /** Function to format timestamp for display */
  formatLabel?: (time: number | string, index: number) => string;
  /** Whether to show step forward/back buttons. Default: true */
  showStepControls?: boolean;
  /** Whether to show speed selector. Default: true */
  showSpeedControl?: boolean;
  /** Optional histogram data for density visualization */
  histogram?: HistogramBin[];

  // --- Layout ---
  /** Position on the map overlay. Default: 'bottom' (full-width) */
  position?: 'bottom' | 'top';
  /** Additional CSS class name */
  className?: string;
}
```

### Main component — `src/components/AnimationTimeline/AnimationTimeline.tsx`

```typescript
import React from 'react';
import { TimeSlider } from './TimeSlider';
import { PlaybackControls } from './PlaybackControls';
import { SpeedControl } from './SpeedControl';
import { TimestampDisplay } from './TimestampDisplay';
import { Histogram } from './Histogram';
import type { AnimationTimelineProps } from './types';

const DEFAULT_SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '1x', value: 1 },
  { label: '2x', value: 2 },
  { label: '4x', value: 4 },
];

/**
 * AnimationTimeline — A temporal playback control for deck.gl map layers.
 *
 * Renders as a bottom bar overlay. Supports single-timestamp scrubbing
 * (for raster timesteps) or dual-handle time window selection (for vector data).
 * Fully controlled: all state is managed by the parent via props + callbacks.
 *
 * @example
 * ```tsx
 * const { currentIndex, setIndex, isPlaying, togglePlay, speed, setSpeed } = useAnimationClock({
 *   totalFrames: timestamps.length,
 *   fps: 2,
 * });
 *
 * <AnimationTimeline
 *   timestamps={timestamps}
 *   currentIndex={currentIndex}
 *   onIndexChange={setIndex}
 *   isPlaying={isPlaying}
 *   onPlayingChange={togglePlay}
 *   speed={speed}
 *   onSpeedChange={setSpeed}
 *   formatLabel={(t) => new Date(t).toLocaleDateString()}
 * />
 * ```
 */
export function AnimationTimeline({
  timestamps,
  mode = 'timestamp',
  currentIndex,
  onIndexChange,
  windowStart,
  windowEnd,
  onWindowChange,
  isPlaying,
  onPlayingChange,
  speed = 1,
  onSpeedChange,
  speedOptions = DEFAULT_SPEED_OPTIONS,
  formatLabel,
  showStepControls = true,
  showSpeedControl = true,
  histogram,
  position = 'bottom',
  className,
}: AnimationTimelineProps) {
  const totalFrames = timestamps.length;
  const currentTimestamp = timestamps[currentIndex];

  const defaultFormatter = (time: number | string) => {
    const d = typeof time === 'string' ? new Date(time) : new Date(time);
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const format = formatLabel ?? ((t: number | string) => defaultFormatter(t));

  const handleStepBack = () => {
    onIndexChange(Math.max(0, currentIndex - 1));
  };

  const handleStepForward = () => {
    onIndexChange(Math.min(totalFrames - 1, currentIndex + 1));
  };

  return (
    <div
      className={`mt-absolute mt-left-0 mt-right-0 ${position === 'bottom' ? 'mt-bottom-0' : 'mt-top-0'} mt-z-10 mt-bg-white/95 mt-backdrop-blur-sm mt-border-t mt-border-gray-200 mt-shadow-lg ${className ?? ''}`}
      role="region"
      aria-label="Animation timeline"
    >
      {/* Histogram background (optional) */}
      {histogram && histogram.length > 0 && (
        
          
        
      )}

      {/* Slider row */}
      
        
      

      {/* Controls row */}
      
        
          <PlaybackControls
            isPlaying={isPlaying}
            onPlayingChange={onPlayingChange}
            onStepBack={showStepControls ? handleStepBack : undefined}
            onStepForward={showStepControls ? handleStepForward : undefined}
            disableBack={currentIndex === 0}
            disableForward={currentIndex === totalFrames - 1}
          />
          {showSpeedControl && onSpeedChange && (
            
          )}
        

        
      
    
  );
}
```

### PlaybackControls — `src/components/AnimationTimeline/PlaybackControls.tsx`

```typescript
import React from 'react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  onPlayingChange: (playing: boolean) => void;
  onStepBack?: () => void;
  onStepForward?: () => void;
  disableBack?: boolean;
  disableForward?: boolean;
}

/**
 * Play/pause and step forward/back buttons.
 * Follows video player keyboard conventions: Space = play/pause.
 */
export function PlaybackControls({
  isPlaying,
  onPlayingChange,
  onStepBack,
  onStepForward,
  disableBack,
  disableForward,
}: PlaybackControlsProps) {
  return (
    
      {/* Step back */}
      {onStepBack && (
        
          
            
          
        
      )}

      {/* Play / Pause */}
      <button
        className="mt-p-2 mt-rounded-full mt-bg-blue-500 mt-text-white hover:mt-bg-blue-600 mt-transition-colors mt-shadow-sm"
        onClick={() => onPlayingChange(!isPlaying)}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          
            
          
        ) : (
          
            
          
        )}
      

      {/* Step forward */}
      {onStepForward && (
        
          
            
          
        
      )}
    
  );
}
```

### SpeedControl — `src/components/AnimationTimeline/SpeedControl.tsx`

```typescript
import React from 'react';
import type { SpeedOption } from './types';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
  options: SpeedOption[];
}

/**
 * Speed multiplier selector. Renders as a row of small toggle buttons.
 */
export function SpeedControl({ speed, onSpeedChange, options }: SpeedControlProps) {
  return (
    
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`mt-px-1.5 mt-py-0.5 mt-rounded mt-text-[10px] mt-font-medium mt-transition-colors ${
            speed === opt.value
              ? 'mt-bg-blue-100 mt-text-blue-700'
              : 'mt-text-gray-500 hover:mt-bg-gray-100'
          }`}
          onClick={() => onSpeedChange(opt.value)}
          role="radio"
          aria-checked={speed === opt.value}
          aria-label={`Speed ${opt.label}`}
        >
          {opt.label}
        
      ))}
    
  );
}
```

### TimeSlider — `src/components/AnimationTimeline/TimeSlider.tsx`

```typescript
import React, { useCallback, useRef } from 'react';
import type { Timestep, TimelineMode } from './types';

interface TimeSliderProps {
  totalFrames: number;
  currentIndex: number;
  onIndexChange: (index: number) => void;
  mode: TimelineMode;
  windowStart?: number;
  windowEnd?: number;
  onWindowChange?: (start: number, end: number) => void;
  timestamps: Timestep[];
  formatLabel: (time: number | string, index: number) => string;
}

/**
 * A styled range slider for timestamp navigation.
 * Uses native  for accessibility and keyboard support.
 *
 * In 'window' mode, renders two overlapping range inputs for start/end handles.
 */
export function TimeSlider({
  totalFrames,
  currentIndex,
  onIndexChange,
  mode,
  windowStart = 0,
  windowEnd = totalFrames - 1,
  onWindowChange,
  timestamps,
  formatLabel,
}: TimeSliderProps) {
  const max = totalFrames - 1;

  if (mode === 'window' && onWindowChange) {
    return (
      
        {/* Background track */}
        
        {/* Active range highlight */}
        <div
          className="mt-absolute mt-top-2.5 mt-h-1 mt-bg-blue-400 mt-rounded-full"
          style={{
            left: `${(windowStart / max) * 100}%`,
            width: `${((windowEnd - windowStart) / max) * 100}%`,
          }}
        />
        {/* Start handle */}
        <input
          type="range"
          min={0}
          max={max}
          value={windowStart}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v < windowEnd) onWindowChange(v, windowEnd);
          }}
          className="mt-absolute mt-top-0 mt-w-full mt-h-6 mt-appearance-none mt-bg-transparent mt-cursor-pointer [&::-webkit-slider-thumb]:mt-appearance-none [&::-webkit-slider-thumb]:mt-w-3 [&::-webkit-slider-thumb]:mt-h-3 [&::-webkit-slider-thumb]:mt-bg-blue-500 [&::-webkit-slider-thumb]:mt-rounded-full [&::-webkit-slider-thumb]:mt-shadow"
          aria-label="Window start"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={windowStart}
          aria-valuetext={timestamps[windowStart] ? formatLabel(timestamps[windowStart].time, windowStart) : ''}
        />
        {/* End handle */}
        <input
          type="range"
          min={0}
          max={max}
          value={windowEnd}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v > windowStart) onWindowChange(windowStart, v);
          }}
          className="mt-absolute mt-top-0 mt-w-full mt-h-6 mt-appearance-none mt-bg-transparent mt-cursor-pointer [&::-webkit-slider-thumb]:mt-appearance-none [&::-webkit-slider-thumb]:mt-w-3 [&::-webkit-slider-thumb]:mt-h-3 [&::-webkit-slider-thumb]:mt-bg-blue-500 [&::-webkit-slider-thumb]:mt-rounded-full [&::-webkit-slider-thumb]:mt-shadow"
          aria-label="Window end"
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={windowEnd}
          aria-valuetext={timestamps[windowEnd] ? formatLabel(timestamps[windowEnd].time, windowEnd) : ''}
        />
      
    );
  }

  // Single timestamp mode
  return (
    
      
      <div
        className="mt-absolute mt-top-2.5 mt-h-1 mt-bg-blue-400 mt-rounded-full"
        style={{ width: `${(currentIndex / max) * 100}%` }}
      />
      <input
        type="range"
        min={0}
        max={max}
        value={currentIndex}
        onChange={(e) => onIndexChange(Number(e.target.value))}
        className="mt-absolute mt-top-0 mt-w-full mt-h-6 mt-appearance-none mt-bg-transparent mt-cursor-pointer [&::-webkit-slider-thumb]:mt-appearance-none [&::-webkit-slider-thumb]:mt-w-3.5 [&::-webkit-slider-thumb]:mt-h-3.5 [&::-webkit-slider-thumb]:mt-bg-blue-500 [&::-webkit-slider-thumb]:mt-rounded-full [&::-webkit-slider-thumb]:mt-shadow-md [&::-webkit-slider-thumb]:mt-border-2 [&::-webkit-slider-thumb]:mt-border-white"
        aria-label="Current timestamp"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={currentIndex}
        aria-valuetext={currentTimestamp ? formatLabel(currentTimestamp.time, currentIndex) : ''}
      />
    
  );

  // Variable needs to be accessible in scope
  const currentTimestamp = timestamps[currentIndex];
}
```

### TimestampDisplay — `src/components/AnimationTimeline/TimestampDisplay.tsx`

```typescript
import React from 'react';

interface TimestampDisplayProps {
  current: string;
  start: string;
  end: string;
}

/**
 * Shows the current timestamp and the total range.
 */
export function TimestampDisplay({ current, start, end }: TimestampDisplayProps) {
  return (
    
      
        {current}
      
      /
      {start} – {end}
    
  );
}
```

### Histogram — `src/components/AnimationTimeline/Histogram.tsx`

```typescript
import React, { useMemo } from 'react';
import type { HistogramBin } from './types';

interface HistogramProps {
  bins: HistogramBin[];
  /** Height in pixels. Default: 32 */
  height?: number;
}

/**
 * A mini histogram rendered behind the timeline slider
 * to show temporal data density. Uses pure CSS — no SVG/canvas.
 */
export function Histogram({ bins, height = 32 }: HistogramProps) {
  const maxCount = useMemo(() => Math.max(...bins.map((b) => b.count), 1), [bins]);

  return (
    
      {bins.map((bin, i) => (
        <div
          key={i}
          className="mt-flex-1 mt-bg-blue-100 mt-rounded-t-sm mt-min-w-[1px]"
          style={{ height: `${(bin.count / maxCount) * 100}%` }}
        />
      ))}
    
  );
}
```

---

## 7. Hooks

### useAnimationClock — `src/hooks/useAnimationClock.ts`

```typescript
import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseAnimationClockOptions {
  /** Total number of frames to cycle through */
  totalFrames: number;
  /** Target frames per second. Default: 2 */
  fps?: number;
  /** Whether to loop when reaching the end. Default: true */
  loop?: boolean;
  /** Initial speed multiplier. Default: 1 */
  initialSpeed?: number;
}

export interface UseAnimationClockReturn {
  /** Current frame index (0-based) */
  currentIndex: number;
  /** Set the current frame index */
  setIndex: (index: number) => void;
  /** Whether animation is currently playing */
  isPlaying: boolean;
  /** Start or stop playback */
  setPlaying: (playing: boolean) => void;
  /** Toggle play/pause */
  togglePlay: () => void;
  /** Current speed multiplier */
  speed: number;
  /** Set speed multiplier */
  setSpeed: (speed: number) => void;
  /** Step to next frame (wraps if loop=true) */
  stepForward: () => void;
  /** Step to previous frame (wraps if loop=true) */
  stepBack: () => void;
}

/**
 * Hook that manages a requestAnimationFrame-based animation clock.
 * Controls frame index progression at a target FPS with speed multiplier.
 *
 * @example
 * ```tsx
 * const clock = useAnimationClock({ totalFrames: timestamps.length, fps: 2 });
 * // clock.currentIndex → pass to AnimationTimeline and deck.gl layers
 * // clock.isPlaying → pass to AnimationTimeline
 * ```
 */
export function useAnimationClock({
  totalFrames,
  fps = 2,
  loop = true,
  initialSpeed = 1,
}: UseAnimationClockOptions): UseAnimationClockReturn {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  const rafRef = useRef(0);
  const lastTickRef = useRef(0);

  const setIndex = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(totalFrames - 1, index)));
    },
    [totalFrames]
  );

  const stepForward = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= totalFrames) return loop ? 0 : totalFrames - 1;
      return next;
    });
  }, [totalFrames, loop]);

  const stepBack = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev - 1;
      if (next < 0) return loop ? totalFrames - 1 : 0;
      return next;
    });
  }, [totalFrames, loop]);

  const togglePlay = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // rAF loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const interval = 1000 / (fps * speed);

    const tick = (timestamp: number) => {
      if (timestamp - lastTickRef.current >= interval) {
        lastTickRef.current = timestamp;
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= totalFrames) {
            if (loop) return 0;
            setIsPlaying(false);
            return totalFrames - 1;
          }
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    lastTickRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, fps, speed, totalFrames, loop]);

  return {
    currentIndex,
    setIndex,
    isPlaying,
    setPlaying: setIsPlaying,
    togglePlay,
    speed,
    setSpeed,
    stepForward,
    stepBack,
  };
}
```

### useTimeRange — `src/hooks/useTimeRange.ts`

```typescript
import { useState, useCallback } from 'react';

export interface UseTimeRangeOptions {
  totalFrames: number;
  initialStart?: number;
  initialEnd?: number;
}

export interface UseTimeRangeReturn {
  windowStart: number;
  windowEnd: number;
  setWindow: (start: number, end: number) => void;
  setWindowStart: (start: number) => void;
  setWindowEnd: (end: number) => void;
  /** Shift the entire window by N frames (positive = forward) */
  shiftWindow: (frames: number) => void;
  /** Window width in frames */
  windowSize: number;
}

/**
 * Hook for managing a dual-handle time window selection.
 * Used with AnimationTimeline in 'window' mode.
 */
export function useTimeRange({
  totalFrames,
  initialStart = 0,
  initialEnd,
}: UseTimeRangeOptions): UseTimeRangeReturn {
  const [windowStart, setStart] = useState(initialStart);
  const [windowEnd, setEnd] = useState(initialEnd ?? totalFrames - 1);

  const setWindow = useCallback(
    (start: number, end: number) => {
      setStart(Math.max(0, Math.min(start, totalFrames - 1)));
      setEnd(Math.max(0, Math.min(end, totalFrames - 1)));
    },
    [totalFrames]
  );

  const setWindowStart = useCallback(
    (start: number) => {
      const clamped = Math.max(0, Math.min(start, windowEnd));
      setStart(clamped);
    },
    [windowEnd]
  );

  const setWindowEnd = useCallback(
    (end: number) => {
      const clamped = Math.max(windowStart, Math.min(end, totalFrames - 1));
      setEnd(clamped);
    },
    [windowStart, totalFrames]
  );

  const shiftWindow = useCallback(
    (frames: number) => {
      const size = windowEnd - windowStart;
      let newStart = windowStart + frames;
      let newEnd = windowEnd + frames;

      if (newStart < 0) {
        newStart = 0;
        newEnd = size;
      }
      if (newEnd >= totalFrames) {
        newEnd = totalFrames - 1;
        newStart = newEnd - size;
      }

      setStart(newStart);
      setEnd(newEnd);
    },
    [windowStart, windowEnd, totalFrames]
  );

  return {
    windowStart,
    windowEnd,
    setWindow,
    setWindowStart,
    setWindowEnd,
    shiftWindow,
    windowSize: windowEnd - windowStart,
  };
}
```

### useTitiler — `src/hooks/useTitiler.ts`

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  buildTileUrl,
  fetchCOGInfo,
  fetchCOGStatistics,
  type COGInfo,
  type COGStatistics,
  type TitilerOptions,
} from '../utils/titiler';

export interface UseTitilerOptions {
  /** TiTiler base URL (e.g., 'https://titiler.xyz') */
  baseUrl: string;
  /** COG URL to visualize */
  url: string;
  /** Colormap name (e.g., 'viridis'). Default: 'viridis' */
  colormap?: string;
  /** Band index for multi-band COGs. Default: 1 */
  bidx?: number;
  /** Rescale range [min, max]. Auto-detected from stats if omitted. */
  rescale?: [number, number];
  /** Whether to automatically fetch info and statistics. Default: true */
  autoFetch?: boolean;
}

export interface UseTitilerReturn {
  /** XYZ tile URL template for deck.gl TileLayer */
  tileUrl: string | null;
  /** COG metadata (bounds, bands, dtype, etc.) */
  info: COGInfo | null;
  /** Band statistics (min, max, mean, etc.) */
  statistics: COGStatistics | null;
  /** Whether data is currently loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Re-fetch info and statistics */
  refetch: () => void;
  /** Effective rescale range (from props or auto-detected from stats) */
  rescaleRange: [number, number] | null;
}

/**
 * Hook that connects to a TiTiler instance, fetches COG metadata/statistics,
 * and constructs a tile URL suitable for deck.gl TileLayer.
 *
 * @example
 * ```tsx
 * const { tileUrl, info, statistics, rescaleRange } = useTitiler({
 *   baseUrl: 'https://titiler.xyz',
 *   url: 'https://example.com/cog.tif',
 *   colormap: 'viridis',
 * });
 *
 * // Use tileUrl with deck.gl TileLayer
 * // Use rescaleRange + colormap to configure MapLegend
 * ```
 */
export function useTitiler({
  baseUrl,
  url,
  colormap = 'viridis',
  bidx = 1,
  rescale,
  autoFetch = true,
}: UseTitilerOptions): UseTitilerReturn {
  const [info, setInfo] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [infoResult, statsResult] = await Promise.all([
        fetchCOGInfo(baseUrl, url),
        fetchCOGStatistics(baseUrl, url, { bidx }),
      ]);
      setInfo(infoResult);
      setStatistics(statsResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch COG metadata');
    } finally {
      setIsLoading(false);
    }
  }, [baseUrl, url, bidx]);

  useEffect(() => {
    if (autoFetch && url) fetchData();
  }, [autoFetch, url, fetchData]);

  const rescaleRange = useMemo(() => {
    if (rescale) return rescale;
    if (statistics) {
      const bandKey = Object.keys(statistics)[0];
      if (bandKey) {
        const band = statistics[bandKey];
        return [band.min, band.max];
      }
    }
    return null;
  }, [rescale, statistics]);

  const tileUrl = useMemo(() => {
    if (!rescaleRange) return null;
    return buildTileUrl(baseUrl, {
      url,
      colormap,
      bidx,
      rescale: rescaleRange,
    });
  }, [baseUrl, url, colormap, bidx, rescaleRange]);

  return {
    tileUrl,
    info,
    statistics,
    isLoading,
    error,
    refetch: fetchData,
    rescaleRange,
  };
}
```

### useSTAC — `src/hooks/useSTAC.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';
import {
  searchSTAC,
  fetchSTACItem,
  getSTACItemAssets,
  type STACSearchParams,
  type STACItem,
  type STACSearchResult,
} from '../utils/stac';

export interface UseSTACOptions {
  /** STAC API base URL (e.g., 'https://earth-search.aws.element84.com/v1') */
  apiUrl: string;
  /** Collection ID to search within */
  collectionId?: string;
  /** Bounding box [west, south, east, north] */
  bbox?: [number, number, number, number];
  /** Date range as ISO string. E.g., '2024-01-01/2024-12-31' */
  datetime?: string;
  /** Max items to return. Default: 20 */
  limit?: number;
  /** Whether to automatically search on mount. Default: false */
  autoSearch?: boolean;
}

export interface UseSTACReturn {
  /** Search results */
  items: STACItem[];
  /** Total matched items (may be larger than returned) */
  totalMatched: number | null;
  /** Currently selected item */
  selectedItem: STACItem | null;
  /** Select an item by ID */
  selectItem: (item: STACItem) => void;
  /** Execute a search */
  search: (params?: Partial) => Promise;
  /** Whether a search is in progress */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Get COG URLs from the selected item's assets */
  getCOGUrls: () => { name: string; href: string }[];
}

/**
 * Hook for searching and browsing STAC catalogs.
 * Returns items that can be visualized with COGLayer or STACLayer.
 *
 * @example
 * ```tsx
 * const { items, search, selectItem, selectedItem, getCOGUrls } = useSTAC({
 *   apiUrl: 'https://earth-search.aws.element84.com/v1',
 *   collectionId: 'sentinel-2-l2a',
 *   autoSearch: true,
 * });
 * ```
 */
export function useSTAC({
  apiUrl,
  collectionId,
  bbox,
  datetime,
  limit = 20,
  autoSearch = false,
}: UseSTACOptions): UseSTACReturn {
  const [items, setItems] = useState([]);
  const [totalMatched, setTotalMatched] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(
    async (params?: Partial) => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await searchSTAC(apiUrl, {
          collections: collectionId ? [collectionId] : undefined,
          bbox,
          datetime,
          limit,
          ...params,
        });
        setItems(result.features);
        setTotalMatched(result.numberMatched ?? null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'STAC search failed');
      } finally {
        setIsLoading(false);
      }
    },
    [apiUrl, collectionId, bbox, datetime, limit]
  );

  useEffect(() => {
    if (autoSearch) search();
  }, [autoSearch, search]);

  const getCOGUrls = useCallback(() => {
    if (!selectedItem) return [];
    return getSTACItemAssets(selectedItem, 'image/tiff');
  }, [selectedItem]);

  return {
    items,
    totalMatched,
    selectedItem,
    selectItem: setSelectedItem,
    search,
    isLoading,
    error,
    getCOGUrls,
  };
}
```

### useColorScale — `src/hooks/useColorScale.ts`

```typescript
import { useMemo } from 'react';
import { scaleLinear, scaleQuantize, scaleThreshold } from 'd3-scale';
import { interpolateRgbBasis } from 'd3-interpolate';
import { COLORMAPS } from '../utils/colormaps';
import type { ContinuousScaleType } from '../components/MapLegend/types';

export interface UseColorScaleOptions {
  /** [min, max] domain */
  domain: [number, number];
  /** Colormap name from the built-in set (e.g., 'viridis') OR custom color array */
  colormap: string | string[];
  /** Scale type. Default: 'linear' */
  scaleType?: ContinuousScaleType;
  /** Number of discrete color steps. Default: 256 (continuous) */
  steps?: number;
}

export interface UseColorScaleReturn {
  /** d3 scale function: value → CSS color string */
  scale: (value: number) => string;
  /** Array of CSS colors (for passing to MapLegend) */
  colors: string[];
  /** The domain as [min, max] */
  domain: [number, number];
}

/**
 * Hook that creates a d3 color scale from a named colormap or custom colors.
 * Returns both the scale function and a color array for legend rendering.
 *
 * @example
 * ```tsx
 * const { colors, domain } = useColorScale({
 *   domain: [0, 100],
 *   colormap: 'viridis',
 *   steps: 6,
 * });
 *
 * 
 * ```
 */
export function useColorScale({
  domain,
  colormap,
  scaleType = 'linear',
  steps = 256,
}: UseColorScaleOptions): UseColorScaleReturn {
  const colors = useMemo(() => {
    const baseColors = typeof colormap === 'string'
      ? COLORMAPS[colormap] ?? COLORMAPS.viridis
      : colormap;

    // Generate evenly-spaced color samples
    const interpolator = interpolateRgbBasis(baseColors);
    return Array.from({ length: steps }, (_, i) => interpolator(i / (steps - 1)));
  }, [colormap, steps]);

  const scale = useMemo(() => {
    // For legend display, a simple linear interpolation is sufficient
    const s = scaleLinear()
      .domain(domain)
      .range([colors[0], colors[colors.length - 1]])
      .clamp(true);

    return (value: number) => {
      // Map value to index in colors array
      const t = (value - domain[0]) / (domain[1] - domain[0]);
      const idx = Math.round(t * (colors.length - 1));
      return colors[Math.max(0, Math.min(colors.length - 1, idx))];
    };
  }, [domain, colors]);

  return { scale, colors, domain };
}
```

---

## 8. Utils

### titiler.ts — `src/utils/titiler.ts`

```typescript
/**
 * Pure functions for constructing TiTiler API URLs and parsing responses.
 * No React dependency — works in Node, tests, or browser.
 */

export interface TitilerOptions {
  url: string;
  colormap?: string;
  bidx?: number;
  rescale?: [number, number];
  tileMatrixSetId?: string;
}

export interface COGInfo {
  bounds: [number, number, number, number]; // [west, south, east, north]
  minzoom: number;
  maxzoom: number;
  band_metadata: Array]>;
  band_descriptions: Array;
  dtype: string;
  nodata_type: string;
  colorinterp: string[];
  width: number;
  height: number;
  driver: string;
  overviews: number[];
}

export interface BandStatistics {
  min: number;
  max: number;
  mean: number;
  count: number;
  sum: number;
  std: number;
  median: number;
  majority: number;
  minority: number;
  unique: number;
  histogram: [number[], number[]];
  valid_percent: number;
  masked_pixels: number;
  valid_pixels: number;
  percentile_2: number;
  percentile_98: number;
}

export type COGStatistics = Record;

/**
 * Build an XYZ tile URL template for deck.gl TileLayer.
 *
 * @example
 * ```ts
 * const url = buildTileUrl('https://titiler.xyz', {
 *   url: 'https://example.com/data.tif',
 *   colormap: 'viridis',
 *   rescale: [0, 100],
 * });
 * // → 'https://titiler.xyz/cog/tiles/WebMercatorQuad/{z}/{x}/{y}@1x.png?url=...'
 * ```
 */
export function buildTileUrl(baseUrl: string, options: TitilerOptions): string {
  const { url, colormap = 'viridis', bidx = 1, rescale, tileMatrixSetId = 'WebMercatorQuad' } = options;
  const params = new URLSearchParams();
  params.set('url', url);
  params.set('bidx', String(bidx));
  if (colormap) params.set('colormap_name', colormap);
  if (rescale) params.set('rescale', rescale.join(','));

  return `${baseUrl}/cog/tiles/${tileMatrixSetId}/{z}/{x}/{y}@1x.png?${params.toString()}`;
}

/**
 * Fetch COG metadata (bounds, zoom levels, band info).
 */
export async function fetchCOGInfo(baseUrl: string, cogUrl: string): Promise {
  const params = new URLSearchParams({ url: cogUrl });
  const response = await fetch(`${baseUrl}/cog/info?${params}`);
  if (!response.ok) throw new Error(`TiTiler info failed: ${response.status} ${response.statusText}`);
  return response.json();
}

/**
 * Fetch band statistics (min, max, mean, histogram, etc.).
 */
export async function fetchCOGStatistics(
  baseUrl: string,
  cogUrl: string,
  options?: { bidx?: number }
): Promise {
  const params = new URLSearchParams({ url: cogUrl });
  if (options?.bidx) params.set('bidx', String(options.bidx));
  const response = await fetch(`${baseUrl}/cog/statistics?${params}`);
  if (!response.ok) throw new Error(`TiTiler statistics failed: ${response.status} ${response.statusText}`);
  return response.json();
}

/**
 * Fetch available colormaps from TiTiler.
 */
export async function fetchColormaps(baseUrl: string): Promise {
  const response = await fetch(`${baseUrl}/cog/colorMaps`);
  if (!response.ok) throw new Error(`TiTiler colormaps failed: ${response.status}`);
  const data = await response.json();
  return data.colorMaps ?? Object.keys(data);
}
```

### stac.ts — `src/utils/stac.ts`

```typescript
/**
 * Pure functions for interacting with STAC APIs.
 * Follows the STAC API spec: https://github.com/radiantearth/stac-api-spec
 */

export interface STACSearchParams {
  collections?: string[];
  bbox?: [number, number, number, number];
  datetime?: string;
  limit?: number;
  query?: Record;
  sortby?: Array;
}

export interface STACItem {
  type: 'Feature';
  stac_version: string;
  id: string;
  geometry: GeoJSON.Geometry;
  bbox: [number, number, number, number];
  properties: {
    datetime: string | null;
    created?: string;
    updated?: string;
    [key: string]: unknown;
  };
  links: Array;
  assets: Record;
  collection?: string;
}

export interface STACAsset {
  href: string;
  type?: string;
  title?: string;
  description?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface STACSearchResult {
  type: 'FeatureCollection';
  features: STACItem[];
  links: Array;
  numberMatched?: number;
  numberReturned?: number;
}

/**
 * Search a STAC API for items matching the given parameters.
 */
export async function searchSTAC(
  apiUrl: string,
  params: STACSearchParams
): Promise {
  const response = await fetch(`${apiUrl}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) throw new Error(`STAC search failed: ${response.status}`);
  return response.json();
}

/**
 * Fetch a single STAC item by collection and item ID.
 */
export async function fetchSTACItem(
  apiUrl: string,
  collectionId: string,
  itemId: string
): Promise {
  const response = await fetch(`${apiUrl}/collections/${collectionId}/items/${itemId}`);
  if (!response.ok) throw new Error(`STAC item fetch failed: ${response.status}`);
  return response.json();
}

/**
 * Extract COG-compatible asset URLs from a STAC item.
 * Filters by MIME type (default: image/tiff for COGs).
 */
export function getSTACItemAssets(
  item: STACItem,
  mimeType = 'image/tiff'
): { name: string; href: string }[] {
  return Object.entries(item.assets)
    .filter(([_, asset]) => {
      if (asset.type?.includes(mimeType)) return true;
      // Fallback: check for common COG roles
      if (asset.roles?.includes('data') && asset.href.endsWith('.tif')) return true;
      return false;
    })
    .map(([name, asset]) => ({ name, href: asset.href }));
}

/**
 * Extract temporal information from STAC items for animation.
 * Returns sorted array of timestamps.
 */
export function extractTimestamps(items: STACItem[]): { time: number; itemId: string }[] {
  return items
    .filter((item) => item.properties.datetime)
    .map((item) => ({
      time: new Date(item.properties.datetime!).getTime(),
      itemId: item.id,
    }))
    .sort((a, b) => a.time - b.time);
}
```

### colormaps.ts — `src/utils/colormaps.ts`

```typescript
/**
 * Pre-baked color arrays for common scientific colormaps.
 * Each colormap is an array of hex colors from low to high.
 * These match matplotlib/TiTiler colormap names.
 */

export const COLORMAPS: Record = {
  viridis: [
    '#440154', '#482777', '#3f4a8a', '#31678e', '#26838f',
    '#1f9d8a', '#6cce5a', '#b6de2b', '#fee825',
  ],
  magma: [
    '#000004', '#180f3d', '#440f76', '#721f81', '#9e2f7f',
    '#cd4071', '#f1605d', '#fd9668', '#feca8d', '#fcfdbf',
  ],
  inferno: [
    '#000004', '#1b0c41', '#4a0c6b', '#781c6d', '#a52c60',
    '#cf4446', '#ed6925', '#fb9b06', '#f7d13d', '#fcffa4',
  ],
  plasma: [
    '#0d0887', '#46039f', '#7201a8', '#9c179e', '#bd3786',
    '#d8576b', '#ed7953', '#fb9f3a', '#fdca26', '#f0f921',
  ],
  cividis: [
    '#00224e', '#123570', '#1d4d80', '#2b6a8e', '#40849e',
    '#5ba3a4', '#82c09e', '#b0d88f', '#e3e479', '#fdea45',
  ],
  coolwarm: [
    '#3b4cc0', '#6788ee', '#9abbff', '#c9d7ef', '#edd1c2',
    '#f7a889', '#e26952', '#b40426',
  ],
  RdYlGn: [
    '#a50026', '#d73027', '#f46d43', '#fdae61', '#fee08b',
    '#d9ef8b', '#a6d96a', '#66bd63', '#1a9850', '#006837',
  ],
  RdBu: [
    '#67001f', '#b2182b', '#d6604d', '#f4a582', '#fddbc7',
    '#d1e5f0', '#92c5de', '#4393c3', '#2166ac', '#053061',
  ],
  YlOrRd: [
    '#ffffcc', '#ffeda0', '#fed976', '#feb24c', '#fd8d3c',
    '#fc4e2a', '#e31a1c', '#bd0026', '#800026',
  ],
  Blues: [
    '#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6',
    '#4292c6', '#2171b5', '#08519c', '#08306b',
  ],
  Greens: [
    '#f7fcf5', '#e5f5e0', '#c7e9c0', '#a1d99b', '#74c476',
    '#41ab5d', '#238b45', '#006d2c', '#00441b',
  ],
};

/**
 * Get a colormap by name, with fallback to viridis.
 */
export function getColormap(name: string): string[] {
  return COLORMAPS[name] ?? COLORMAPS.viridis;
}

/**
 * List all available colormap names.
 */
export function listColormaps(): string[] {
  return Object.keys(COLORMAPS);
}
```

### formatters.ts — `src/utils/formatters.ts`

```typescript
import { format as d3Format } from 'd3-format';

/**
 * Format a number using SI prefix notation (e.g., 10K, 1.2M).
 */
export const formatSI = d3Format('~s');

/**
 * Format a number with fixed decimal places.
 */
export function formatFixed(decimals: number) {
  return d3Format(`.${decimals}f`);
}

/**
 * Format a timestamp for display in animation controls.
 * Adapts format based on temporal resolution.
 */
export function formatTimestamp(ms: number, resolution: 'year' | 'month' | 'day' | 'hour' = 'day'): string {
  const d = new Date(ms);
  switch (resolution) {
    case 'year':
      return d.getFullYear().toString();
    case 'month':
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
    case 'day':
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    case 'hour':
      return d.toLocaleString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
  }
}
```

---

## 9. Layer Wrappers

### COGLayer — `src/layers/COGLayer.ts`

```typescript
import { TileLayer } from '@deck.gl/geo-layers';
import { BitmapLayer } from '@deck.gl/layers';

export interface COGLayerOptions {
  /** Unique layer ID */
  id: string;
  /** XYZ tile URL template from useTitiler or buildTileUrl */
  tileUrl: string;
  /** Tile bounds [west, south, east, north] from COGInfo */
  bounds?: [number, number, number, number];
  /** Min zoom level. Default: 0 */
  minZoom?: number;
  /** Max zoom level. Default: 22 */
  maxZoom?: number;
  /** Layer opacity. Default: 1 */
  opacity?: number;
  /** Whether the layer is visible. Default: true */
  visible?: boolean;
}

/**
 * Creates a deck.gl TileLayer configured for TiTiler COG tiles.
 * Returns a standard deck.gl layer instance — not a React component.
 *
 * @example
 * ```tsx
 * const layer = createCOGLayer({
 *   id: 'temperature',
 *   tileUrl: titiler.tileUrl,
 *   bounds: info.bounds,
 *   opacity: 0.8,
 * });
 *
 * 
 * ```
 */
export function createCOGLayer({
  id,
  tileUrl,
  bounds,
  minZoom = 0,
  maxZoom = 22,
  opacity = 1,
  visible = true,
}: COGLayerOptions) {
  return new TileLayer({
    id,
    data: tileUrl,
    minZoom,
    maxZoom,
    opacity,
    visible,
    tileSize: 256,
    // Restrict tile fetching to COG bounds if available
    ...(bounds
      ? {
          extent: bounds,
        }
      : {}),
    renderSubLayers: (props: any) => {
      const { boundingBox } = props.tile;
      return new BitmapLayer(props, {
        data: undefined,
        image: props.data,
        bounds: [
          boundingBox[0][0],
          boundingBox[0][1],
          boundingBox[1][0],
          boundingBox[1][1],
        ],
      });
    },
  });
}
```

---

## 10. Template App

### templates/basic-app/src/App.tsx

```tsx
import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MapLegend, AnimationTimeline } from '@maptool/core';
import { useTitiler, useAnimationClock, useColorScale } from '@maptool/core';
import { createCOGLayer } from '@maptool/core';
import { getColormap } from '@maptool/core';
import '@maptool/core/styles.css';

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  // Connect to a TiTiler instance and a COG
  const titiler = useTitiler({
    baseUrl: import.meta.env.VITE_TITILER_URL ?? 'https://titiler.xyz',
    url: import.meta.env.VITE_COG_URL ?? '',
    colormap: 'viridis',
  });

  // Build the color scale for the legend
  const colorScale = useColorScale({
    domain: titiler.rescaleRange ?? [0, 1],
    colormap: 'viridis',
    steps: 8,
  });

  // Create the deck.gl layer
  const layers = titiler.tileUrl
    ? [createCOGLayer({ id: 'cog', tileUrl: titiler.tileUrl, bounds: titiler.info?.bounds })]
    : [];

  return (
    
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        layers={layers}
        controller
      >
        
      

      {/* Legend overlay */}
      {titiler.rescaleRange && (
        
      )}
    
  );
}

export default App;
```

### templates/basic-app/package.json

```json
{
  "name": "maptool-app",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "@deck.gl/core": "^9.0.0",
    "@deck.gl/layers": "^9.0.0",
    "@deck.gl/geo-layers": "^9.0.0",
    "@deck.gl/react": "^9.0.0",
    "maplibre-gl": "^4.0.0",
    "react-map-gl": "^8.0.0",
    "@maptool/core": "file:../../"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0"
  }
}
```

---

## 11. Cursor Skills

### skills/README.md

```markdown
# maptool Cursor Skills

These skills are self-contained prompt documents that tell Cursor (or any AI coding agent)
how to accomplish common tasks using the maptool library.

## How to use

1. Copy the `skills/` directory into your project root, OR reference them from this repo
2. In Cursor, reference a skill when starting a task:
   - "Follow the instructions in skills/setup-map-app/SKILL.md"
   - Or paste the skill content into your Cursor prompt

## Available skills

| Skill | Description |
|-------|-------------|
| `setup-map-app` | Scaffold a new Vite + React + MapLibre + deck.gl app with maptool |
| `add-cog-layer` | Connect to TiTiler, visualize a COG with auto-legend |
| `add-stac-layer` | Browse a STAC catalog, select and visualize items |
| `add-animation` | Add temporal animation to a map with AnimationTimeline |
| `write-tests` | Test patterns for maptool components and hooks |
```

### skills/setup-map-app/SKILL.md

````markdown
# Skill: Setup a Map Application

## When to use
When creating a new map application from scratch using React, deck.gl, MapLibre GL JS, and maptool components.

## Prerequisites
- Node.js 18+
- npm or pnpm

## Steps

### 1. Scaffold the project

```bash
npm create vite@latest my-map-app -- --template react-ts
cd my-map-app
```

### 2. Install dependencies

```bash
npm install react react-dom @deck.gl/core @deck.gl/layers @deck.gl/geo-layers @deck.gl/react maplibre-gl react-map-gl @maptool/core
npm install -D tailwindcss postcss autoprefixer @types/react @types/react-dom
npx tailwindcss init -p
```

### 3. Configure Tailwind

Update `tailwind.config.js`:
```js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Create the base map component

Create `src/App.tsx`:
```tsx
import React, { useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@maptool/core/styles.css';

const INITIAL_VIEW = {
  longitude: -95.7,
  latitude: 37.1,
  zoom: 4,
  pitch: 0,
  bearing: 0,
};

function App() {
  const [viewState, setViewState] = useState(INITIAL_VIEW);

  return (
    
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        layers={[]}
        controller
      >
        
      
    
  );
}

export default App;
```

### 5. Create environment file

Create `.env`:
```
VITE_TITILER_URL=https://titiler.xyz
```

### 6. Verify

```bash
npm run dev
```

You should see a full-screen map centered on the US with CARTO Positron basemap.

## Common mistakes
- Forgetting to import `maplibre-gl/dist/maplibre-gl.css` — the map will render but controls will be unstyled
- Not wrapping DeckGL in a container with explicit width/height — the map will not render
- Using `mapboxgl` imports instead of `maplibre-gl` — these are different libraries

## Reference files in this repo
- `templates/basic-app/src/App.tsx` — complete starter app
- `templates/basic-app/package.json` — dependency reference
````

### skills/add-cog-layer/SKILL.md

````markdown
# Skill: Add a COG Layer with Legend

## When to use
When you have a Cloud Optimized GeoTIFF (COG) URL and want to visualize it on the map with an auto-configured color legend.

## Prerequisites
- A working map app (see `setup-map-app` skill)
- A TiTiler instance URL (public: `https://titiler.xyz`)
- A COG URL (must be publicly accessible or on the same network as TiTiler)

## Steps

### 1. Import maptool hooks and components

Add these imports to your map component:

```tsx
import { MapLegend } from '@maptool/core';
import { useTitiler, useColorScale } from '@maptool/core';
import { createCOGLayer } from '@maptool/core';
```

### 2. Connect to TiTiler

Inside your component, add:

```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL ?? 'https://titiler.xyz',
  url: 'YOUR_COG_URL_HERE', // e.g., 's3://bucket/data.tif'
  colormap: 'viridis', // any matplotlib colormap name
});
```

The `useTitiler` hook will:
1. Fetch COG info (bounds, zoom levels, band metadata)
2. Fetch band statistics (min, max, mean)
3. Construct an XYZ tile URL with the specified colormap
4. Return `rescaleRange` auto-detected from statistics

### 3. Create the color scale for the legend

```tsx
const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: 'viridis',
  steps: 8, // number of discrete colors in the legend
});
```

### 4. Create the deck.gl layer

```tsx
const layers = titiler.tileUrl
  ? [
      createCOGLayer({
        id: 'my-cog',
        tileUrl: titiler.tileUrl,
        bounds: titiler.info?.bounds,
        opacity: 0.8,
      }),
    ]
  : [];
```

Pass `layers` to the `<DeckGL>` component's `layers` prop.

### 5. Add the legend overlay

Place this inside your map container div (sibling to `<DeckGL>`):

```tsx
{titiler.rescaleRange && (
  <MapLegend
    layers={[
      {
        type: 'continuous',
        id: 'my-cog',
        title: 'My Data Layer',
        unit: 'm',  // change to your data's unit
        domain: titiler.rescaleRange,
        colors: colorScale.colors,
        ticks: 5,
        tickFormat: '~s', // SI prefix formatting
      },
    ]}
    position="bottom-left"
    collapsible
  />
)}
```

### 6. Handle loading and error states

```tsx
{titiler.isLoading && Loading...}
{titiler.error && {titiler.error}}
```

## Common mistakes
- Using a COG URL that TiTiler can't access (private S3 without proper IAM)
- Forgetting to handle the null state of `tileUrl` before creating the layer
- Not matching the colormap name between useTitiler and useColorScale — they must be identical for the legend to match the tiles

## Reference files in this repo
- `src/hooks/useTitiler.ts` — hook source and full API
- `src/utils/titiler.ts` — TiTiler URL construction functions
- `src/utils/colormaps.ts` — available colormap names
- `src/layers/COGLayer.ts` — layer wrapper source
- `src/components/MapLegend/types.ts` — all legend configuration options
````

### skills/add-animation/SKILL.md

````markdown
# Skill: Add Animation to a Map

## When to use
When you have temporal data (multiple COGs at different timestamps, or STAC items with datetime properties) and want to animate through them on the map.

## Prerequisites
- A working map app with at least one data layer (see `add-cog-layer` skill)
- An array of timestamps with corresponding data URLs

## Steps

### 1. Import animation components and hooks

```tsx
import { AnimationTimeline } from '@maptool/core';
import { useAnimationClock } from '@maptool/core';
import type { Timestep } from '@maptool/core';
```

### 2. Define your timestamps

```tsx
// Example: daily COGs for a month
const timestamps: Timestep[] = [
  { time: '2024-01-01T00:00:00Z' },
  { time: '2024-01-02T00:00:00Z' },
  { time: '2024-01-03T00:00:00Z' },
  // ... more timestamps
];

// Map each timestamp to a COG URL
const cogUrls: Record = {
  0: 'https://example.com/data-20240101.tif',
  1: 'https://example.com/data-20240102.tif',
  // ...
};
```

### 3. Set up the animation clock

```tsx
const clock = useAnimationClock({
  totalFrames: timestamps.length,
  fps: 2,        // 2 frames per second
  loop: true,    // loop back to start
  initialSpeed: 1,
});
```

### 4. Update the data layer based on current frame

```tsx
const currentCogUrl = cogUrls[clock.currentIndex];

const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: currentCogUrl ?? '',
  colormap: 'viridis',
});
```

**IMPORTANT:** For smooth animation, consider preloading. The simplest approach:

```tsx
// Preload next frame's tile URL
const nextIndex = (clock.currentIndex + 1) % timestamps.length;
const nextCogUrl = cogUrls[nextIndex];
// You can prefetch by creating a hidden Image or using fetch()
```

### 5. Add the AnimationTimeline component

Place this inside your map container:

```tsx
<AnimationTimeline
  timestamps={timestamps}
  currentIndex={clock.currentIndex}
  onIndexChange={clock.setIndex}
  isPlaying={clock.isPlaying}
  onPlayingChange={clock.setPlaying}
  speed={clock.speed}
  onSpeedChange={clock.setSpeed}
  formatLabel={(time) => {
    const d = new Date(time);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }}
  showStepControls
  showSpeedControl
/>
```

### 6. Wire keyboard shortcuts (optional but recommended)

```tsx
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      clock.togglePlay();
    }
    if (e.code === 'ArrowLeft') clock.stepBack();
    if (e.code === 'ArrowRight') clock.stepForward();
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [clock]);
```

## For STAC-based temporal animation

If your temporal data comes from a STAC catalog:

```tsx
import { useSTAC } from '@maptool/core';
import { extractTimestamps } from '@maptool/core';

const stac = useSTAC({
  apiUrl: 'https://earth-search.aws.element84.com/v1',
  collectionId: 'sentinel-2-l2a',
  bbox: [-122.5, 37.5, -122.0, 38.0],
  datetime: '2024-01-01/2024-06-30',
  autoSearch: true,
});

const timestamps = extractTimestamps(stac.items).map(t => ({ time: t.time }));
```

## Common mistakes
- Not using `useAnimationClock` — manually managing rAF timing is error-prone
- Setting FPS too high for raster data — tiles take time to load; 1-4 FPS is typical
- Forgetting to stop animation on component unmount — `useAnimationClock` handles this via useEffect cleanup
- Not providing a `formatLabel` function — the default format may not match your temporal resolution

## Reference files in this repo
- `src/hooks/useAnimationClock.ts` — animation clock hook with full API
- `src/hooks/useTimeRange.ts` — for window mode (vector data filtering)
- `src/components/AnimationTimeline/types.ts` — all timeline configuration options
- `src/utils/stac.ts` — `extractTimestamps` helper
````

### skills/write-tests/SKILL.md

````markdown
# Skill: Writing Tests for maptool Components

## When to use
When writing unit tests for components, hooks, or utils that use maptool.

## Test stack
- **Vitest** — test runner (Jest-compatible API)
- **React Testing Library** — component rendering and interaction
- **@testing-library/user-event** — realistic user event simulation
- **Playwright** — E2E and visual regression (for map rendering)

## Patterns

### Testing components

```tsx
// src/components/MapLegend/MapLegend.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { MapLegend } from './MapLegend';

describe('MapLegend', () => {
  const defaultLayers = [
    {
      type: 'continuous' as const,
      id: 'temp',
      title: 'Temperature',
      unit: '°C',
      domain: [0, 40] as [number, number],
      colors: ['#313695', '#ffffbf', '#a50026'],
      ticks: 3,
    },
  ];

  it('renders the legend title with unit', () => {
    render(<MapLegend layers={defaultLayers} />);
    expect(screen.getByText('Temperature (°C)')).toBeInTheDocument();
  });

  it('renders tick labels for continuous ramp', () => {
    render(<MapLegend layers={defaultLayers} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('collapses when header is clicked', async () => {
    const user = userEvent.setup();
    render(<MapLegend layers={defaultLayers} collapsible />);

    const toggle = screen.getByRole('button', { name: /legend/i });
    await user.click(toggle);

    expect(screen.queryByText('Temperature (°C)')).not.toBeInTheDocument();
  });

  it('calls onLayerToggle when toggler is clicked', async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <MapLegend
        layers={[{ ...defaultLayers[0], toggler: true, visible: true }]}
        onLayerToggle={onToggle}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /toggle temperature/i });
    await user.click(toggleBtn);

    expect(onToggle).toHaveBeenCalledWith('temp', false);
  });

  it('supports categorical legends', () => {
    render(
      <MapLegend
        layers={[
          {
            type: 'categorical',
            id: 'landuse',
            title: 'Land Use',
            categories: [
              { value: 'residential', color: '#ff0', label: 'Residential' },
              { value: 'commercial', color: '#0ff', label: 'Commercial' },
            ],
          },
        ]}
      />
    );

    expect(screen.getByText('Residential')).toBeInTheDocument();
    expect(screen.getByText('Commercial')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<MapLegend layers={defaultLayers} />);
    expect(screen.getByRole('region', { name: /map legend/i })).toBeInTheDocument();
  });
});
```

### Testing hooks

```tsx
// src/hooks/useAnimationClock.test.ts
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAnimationClock } from './useAnimationClock';

describe('useAnimationClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with index 0 and not playing', () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 10, fps: 2 })
    );

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.isPlaying).toBe(false);
    expect(result.current.speed).toBe(1);
  });

  it('steps forward and wraps around', () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 3, fps: 2, loop: true })
    );

    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(1);

    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(2);

    act(() => result.current.stepForward());
    expect(result.current.currentIndex).toBe(0); // wrapped
  });

  it('clamps setIndex to valid range', () => {
    const { result } = renderHook(() =>
      useAnimationClock({ totalFrames: 5, fps: 2 })
    );

    act(() => result.current.setIndex(10));
    expect(result.current.currentIndex).toBe(4);

    act(() => result.current.setIndex(-1));
    expect(result.current.currentIndex).toBe(0);
  });
});
```

### Testing utils (pure functions)

```tsx
// src/utils/titiler.test.ts
import { describe, it, expect } from 'vitest';
import { buildTileUrl } from './titiler';

describe('buildTileUrl', () => {
  it('constructs a valid TiTiler tile URL', () => {
    const url = buildTileUrl('https://titiler.xyz', {
      url: 'https://example.com/data.tif',
      colormap: 'viridis',
      bidx: 1,
      rescale: [0, 100],
    });

    expect(url).toContain('https://titiler.xyz/cog/tiles/WebMercatorQuad/{z}/{x}/{y}');
    expect(url).toContain('url=https%3A%2F%2Fexample.com%2Fdata.tif');
    expect(url).toContain('colormap_name=viridis');
    expect(url).toContain('rescale=0%2C100');
    expect(url).toContain('bidx=1');
  });
});
```

### E2E tests with Playwright

```typescript
// tests/e2e/legend.spec.ts
import { test, expect } from '@playwright/test';

test.describe('MapLegend', () => {
  test('legend is visible on the map', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[aria-label="Map legend"]');
    await expect(page.getByRole('region', { name: 'Map legend' })).toBeVisible();
  });

  test('legend collapses and expands', async ({ page }) => {
    await page.goto('/');
    const legend = page.getByRole('region', { name: 'Map legend' });
    const toggle = legend.getByRole('button', { name: /legend/i });

    await toggle.click();
    await expect(legend.getByText('Temperature')).not.toBeVisible();

    await toggle.click();
    await expect(legend.getByText('Temperature')).toBeVisible();
  });
});
```

## Common mistakes
- Not using `vi.useFakeTimers()` when testing useAnimationClock — rAF won't fire in test env
- Testing implementation details instead of user-visible behavior
- Forgetting `act()` wrappers around state updates in hook tests
- Not awaiting `userEvent` calls (they return promises)

## Reference files
- `vitest.config.ts` — test configuration
- `src/test-setup.ts` — global test setup
- `playwright.config.ts` — E2E configuration
````

### skills/add-stac-layer/SKILL.md

````markdown
# Skill: Add a STAC Layer

## When to use
When you want to browse a STAC catalog, search for items, and visualize them as COG layers on the map.

## Prerequisites
- A working map app (see `setup-map-app` skill)
- A STAC API endpoint URL

## Popular public STAC APIs
- **Earth Search (Element 84)**: `https://earth-search.aws.element84.com/v1`
  - Collections: sentinel-2-l2a, landsat-c2-l2, cop-dem-glo-30, naip
- **Microsoft Planetary Computer**: `https://planetarycomputer.microsoft.com/api/stac/v1`
  - Note: Requires token signing for asset URLs
- **NASA CMR STAC**: `https://cmr.earthdata.nasa.gov/stac`

## Steps

### 1. Import hooks

```tsx
import { useSTAC, useTitiler, useColorScale } from '@maptool/core';
import { MapLegend } from '@maptool/core';
import { createCOGLayer } from '@maptool/core';
import { extractTimestamps, getSTACItemAssets } from '@maptool/core';
```

### 2. Search the STAC catalog

```tsx
const stac = useSTAC({
  apiUrl: 'https://earth-search.aws.element84.com/v1',
  collectionId: 'sentinel-2-l2a',
  bbox: [-122.5, 37.5, -122.0, 38.0], // San Francisco area
  datetime: '2024-06-01/2024-06-30',
  limit: 10,
  autoSearch: true,
});
```

### 3. Select an item and get its COG URL

```tsx
// Auto-select the first item when results arrive
useEffect(() => {
  if (stac.items.length > 0 && !stac.selectedItem) {
    stac.selectItem(stac.items[0]);
  }
}, [stac.items]);

// Get COG URLs from the selected item
const cogUrls = stac.getCOGUrls();
const visualUrl = cogUrls.find(a => a.name === 'visual')?.href
  ?? cogUrls[0]?.href
  ?? '';
```

### 4. Visualize with TiTiler + Legend

```tsx
const titiler = useTitiler({
  baseUrl: import.meta.env.VITE_TITILER_URL,
  url: visualUrl,
  colormap: 'viridis',
});

const colorScale = useColorScale({
  domain: titiler.rescaleRange ?? [0, 1],
  colormap: 'viridis',
  steps: 8,
});

const layers = titiler.tileUrl
  ? [createCOGLayer({ id: 'stac-item', tileUrl: titiler.tileUrl })]
  : [];
```

### 5. Display item metadata

```tsx
{stac.selectedItem && (
  
    {stac.selectedItem.id}
    
      {stac.selectedItem.properties.datetime}
    
    
      Collection: {stac.selectedItem.collection}
    
  
)}
```

## Common mistakes
- Not all STAC APIs support POST search — some only support GET with query parameters. The `useSTAC` hook uses POST by default. If it fails, check the API docs.
- Microsoft Planetary Computer requires token signing — asset URLs expire. You'll need to use their `planetary-computer` npm package to sign URLs before passing to TiTiler.
- STAC item assets have different names across collections (e.g., `visual`, `B04`, `red`, `data`). Use `getSTACItemAssets()` and inspect the results.

## Reference files
- `src/hooks/useSTAC.ts` — STAC hook with full API
- `src/utils/stac.ts` — pure STAC helper functions
- `src/layers/STACLayer.ts` — convenience layer wrapper
````

---

## 12. Testing Strategy

### Unit tests (Vitest + RTL)
- **Components**: Test rendering, interaction (click, keyboard), ARIA attributes, prop variations
- **Hooks**: Test state transitions, edge cases (boundaries, wrapping), cleanup
- **Utils**: Test pure function input/output, error cases, URL construction

### E2E tests (Playwright)
- Legend renders and is interactive on a real map
- Animation timeline controls work with real layer switching
- Visual regression screenshots for legend and timeline styling

### Coverage targets
- Components: 90%+ line coverage
- Hooks: 95%+ line coverage
- Utils: 100% line coverage

---

## 13. CSS & Theming

### CSS Custom Properties — `src/styles/base.css`

```css
:root {
  /* Colors */
  --mt-bg: rgba(255, 255, 255, 0.9);
  --mt-bg-hover: rgba(0, 0, 0, 0.04);
  --mt-border: #e5e7eb;
  --mt-text-primary: #111827;
  --mt-text-secondary: #6b7280;
  --mt-text-muted: #9ca3af;
  --mt-accent: #3b82f6;
  --mt-accent-hover: #2563eb;
  --mt-accent-light: #dbeafe;

  /* Sizing */
  --mt-legend-max-width: 280px;
  --mt-legend-padding: 12px;
  --mt-timeline-height: auto;
  --mt-ramp-height: 12px;
  --mt-swatch-size: 12px;
  --mt-font-size-xs: 10px;
  --mt-font-size-sm: 12px;

  /* Radius */
  --mt-radius: 8px;
  --mt-radius-sm: 4px;
}

/* Dark mode override example */
[data-theme="dark"] {
  --mt-bg: rgba(30, 30, 30, 0.95);
  --mt-border: #374151;
  --mt-text-primary: #f9fafb;
  --mt-text-secondary: #9ca3af;
  --mt-text-muted: #6b7280;
}
```

All component styles reference these variables. Consumers can override them to theme the entire library without touching component code.

---

## 14. Future Expansion Notes

### Adding a new data source (e.g., NASA GIBS, PMTiles)

1. Add a new file in `src/utils/` (e.g., `gibs.ts`) with pure functions
2. Add a new hook in `src/hooks/` (e.g., `useGIBS.ts`) wrapping those functions
3. Optionally add a layer wrapper in `src/layers/`
4. Create a new skill in `skills/add-gibs-layer/SKILL.md`
5. No changes needed to existing components — MapLegend and AnimationTimeline are data-source agnostic

### Splitting into a monorepo later

The internal structure is already organized for extraction:
- `src/components/` → `@maptool/components`
- `src/hooks/` → `@maptool/hooks`
- `src/utils/` → `@maptool/utils`
- `src/layers/` → `@maptool/layers`

Add Turborepo or Nx, move each folder into `packages/`, update imports to use package names.

### Adding new components

Follow the same pattern:
1. Create `src/components/NewComponent/` with component, types, tests, and index
2. Export from `src/components/index.ts`
3. Export from `src/index.ts`
4. Create a skill in `skills/`

---

## Barrel Exports

### src/index.ts

```typescript
// Components
export { MapLegend } from './components/MapLegend';
export { AnimationTimeline } from './components/AnimationTimeline';

// Component types
export type {
  MapLegendProps,
  LegendLayerConfig,
  ContinuousLegendConfig,
  CategoricalLegendConfig,
  CategoryEntry,
  LegendOrientation,
  LegendPosition,
  ContinuousScaleType,
} from './components/MapLegend/types';

export type {
  AnimationTimelineProps,
  TimelineMode,
  SpeedOption,
  Timestep,
  HistogramBin,
} from './components/AnimationTimeline/types';

// Hooks
export { useAnimationClock } from './hooks/useAnimationClock';
export { useTimeRange } from './hooks/useTimeRange';
export { useTitiler } from './hooks/useTitiler';
export { useSTAC } from './hooks/useSTAC';
export { useColorScale } from './hooks/useColorScale';

// Hook types
export type { UseAnimationClockOptions, UseAnimationClockReturn } from './hooks/useAnimationClock';
export type { UseTimeRangeOptions, UseTimeRangeReturn } from './hooks/useTimeRange';
export type { UseTitilerOptions, UseTitilerReturn } from './hooks/useTitiler';
export type { UseSTACOptions, UseSTACReturn } from './hooks/useSTAC';
export type { UseColorScaleOptions, UseColorScaleReturn } from './hooks/useColorScale';

// Layer helpers
export { createCOGLayer } from './layers/COGLayer';
export type { COGLayerOptions } from './layers/COGLayer';

// Utils
export { COLORMAPS, getColormap, listColormaps } from './utils/colormaps';
export { buildTileUrl, fetchCOGInfo, fetchCOGStatistics, fetchColormaps } from './utils/titiler';
export type { TitilerOptions, COGInfo, COGStatistics, BandStatistics } from './utils/titiler';
export { searchSTAC, fetchSTACItem, getSTACItemAssets, extractTimestamps } from './utils/stac';
export type { STACSearchParams, STACItem, STACAsset, STACSearchResult } from './utils/stac';
export { formatSI, formatFixed, formatTimestamp } from './utils/formatters';
```