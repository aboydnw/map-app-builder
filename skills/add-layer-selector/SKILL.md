# Skill: Add a Layer Selector

## When to use
When you want a floating panel that lets users toggle the visibility of individual map layers — for example, showing/hiding satellite imagery, building footprints, or data overlays independently.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- At least one deck.gl layer to control
- `@chakra-ui/react` installed (LayerSelector uses Chakra's `Box`, `Flex`, `HStack`, `Text`)

## Steps

### 1. Import the component

```tsx
import { LayerSelector } from "@maptool/core";
import type { LayerConfig } from "@maptool/core";
```

### 2. Set up layer visibility state

Track which layers are visible using a state object keyed by layer ID:

```tsx
import { useState, useMemo } from "react";

const [visibility, setVisibility] = useState<Record<string, boolean>>({
  buildings: true,
  satellite: true,
  fires: false,
});

function handleToggle(id: string) {
  setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
}
```

### 3. Define layer configs for the selector

```tsx
const layerConfigs: LayerConfig[] = [
  { id: "buildings", label: "Buildings", visible: visibility.buildings, color: "#f59e0b" },
  { id: "satellite", label: "Satellite Imagery", visible: visibility.satellite },
  { id: "fires", label: "Fire Detections", visible: visibility.fires, color: "#ef4444" },
];
```

The `color` prop is optional — when provided, a small color swatch appears next to the label.

### 4. Wire visibility into deck.gl layers

Pass the `visible` property from your state into each deck.gl layer:

```tsx
const layers = useMemo(() => [
  createPMTilesVectorLayer({
    id: "buildings",
    url: BUILDINGS_URL,
    visible: visibility.buildings,
  }),
  createCOGLayer({
    id: "satellite",
    tileUrl: satelliteTileUrl,
    visible: visibility.satellite,
  }),
  createGeoJSONLayer({
    id: "fires",
    data: fireData,
    visible: visibility.fires,
  }),
], [visibility, satelliteTileUrl, fireData]);
```

### 5. Render the LayerSelector

Place inside your map container div, as a sibling to `<DeckGL>`:

```tsx
<div style={{ width: "100%", height: "100%", position: "relative" }}>
  <DeckGL viewState={viewState} layers={layers} onViewStateChange={...}>
    <Map mapStyle="..." />
  </DeckGL>
  <LayerSelector
    layers={layerConfigs}
    onToggle={handleToggle}
    position="top-right"
    collapsible
  />
</div>
```

### 6. Verify

Run `npm run dev` and confirm:
- [ ] The layer selector panel appears in the chosen corner
- [ ] Each layer shows its label and a toggle checkbox
- [ ] Clicking a toggle hides/shows the corresponding map layer
- [ ] Color swatches appear for layers with a `color` prop
- [ ] Collapsing the header hides the layer list

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `layers` | `LayerConfig[]` | required | Array of layer configs with `id`, `label`, `visible`, and optional `color` |
| `onToggle` | `(id: string) => void` | required | Called when a layer's visibility toggle is clicked |
| `position` | `"top-left" \| "top-right" \| "bottom-left" \| "bottom-right"` | `"top-right"` | Corner placement on the map |
| `collapsible` | `boolean` | `true` | Whether the panel can be collapsed |

## Common mistakes
- **Not syncing `visible` on the deck.gl layer** — the LayerSelector only manages UI state. You must pass `visible` to each deck.gl layer yourself.
- **Forgetting `useMemo` for layers** — without memoization, layers recreate on every render, causing flicker.
- **Duplicate layer IDs** — the `id` in `LayerConfig` must match the `id` passed to the deck.gl layer factory.

## Reference files
- `src/components/LayerSelector/LayerSelector.tsx` — component source, `LayerSelectorProps`, `LayerConfig`
