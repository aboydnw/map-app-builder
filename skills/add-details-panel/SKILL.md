# Skill: Add a Details Panel

## When to use
When you need a slide-in side panel for showing feature details, charts, metadata, or any supplemental content alongside the map — for example, displaying properties when a user clicks a map feature.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (DetailsPanel uses Chakra's `Box` and `CloseButton`)

## Steps

### 1. Import the component

```tsx
import { DetailsPanel } from "@maptool/core";
```

### 2. Set up open/close state

Use React state or Chakra's `useDisclosure` pattern:

```tsx
import { useState } from "react";

const [panelOpen, setPanelOpen] = useState(false);
const [selectedFeature, setSelectedFeature] = useState<Record<string, unknown> | null>(null);

function handleFeatureClick(feature: Record<string, unknown>) {
  setSelectedFeature(feature);
  setPanelOpen(true);
}
```

### 3. Render in overlay mode (default)

Overlay mode positions the panel absolutely on top of the map with a slide-in animation:

```tsx
<div style={{ width: "100%", height: "100%", position: "relative" }}>
  <DeckGL
    viewState={viewState}
    layers={layers}
    onClick={(info) => {
      if (info.object) handleFeatureClick(info.object.properties);
    }}
    onViewStateChange={...}
  >
    <Map mapStyle="..." />
  </DeckGL>

  <DetailsPanel
    title="Feature Details"
    isOpen={panelOpen}
    onClose={() => setPanelOpen(false)}
    side="right"
    width={350}
  >
    {selectedFeature && (
      <div>
        {Object.entries(selectedFeature).map(([key, val]) => (
          <div key={key} style={{ marginBottom: 8 }}>
            <strong>{key}:</strong> {String(val)}
          </div>
        ))}
      </div>
    )}
  </DetailsPanel>
</div>
```

### 4. Render in push mode (alternative)

Push mode resizes the map container instead of overlaying. The parent must use flexbox:

```tsx
<div style={{ width: "100%", height: "100%", display: "flex" }}>
  <div style={{ flex: 1, position: "relative" }}>
    <DeckGL viewState={viewState} layers={layers} onViewStateChange={...}>
      <Map mapStyle="..." />
    </DeckGL>
  </div>

  <DetailsPanel
    title="Feature Details"
    isOpen={panelOpen}
    onClose={() => setPanelOpen(false)}
    mode="push"
    side="right"
    width={350}
  >
    {selectedFeature && <div>...</div>}
  </DetailsPanel>
</div>
```

In push mode, the panel's width animates from 0 to the specified `width`, pushing the map narrower. The map will resize automatically via deck.gl's resize observer.

### 5. Verify

Run `npm run dev` and confirm:
- [ ] Clicking a map feature opens the panel with a slide-in animation
- [ ] The panel title and close button appear at the top
- [ ] Clicking the close button hides the panel
- [ ] In overlay mode, the panel floats on top of the map
- [ ] In push mode, the map resizes to accommodate the panel

## Props reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Panel content |
| `isOpen` | `boolean` | required | Controls panel visibility |
| `onClose` | `() => void` | required | Called when close button is clicked |
| `title` | `string` | — | Panel header text |
| `side` | `"left" \| "right"` | `"right"` | Which edge the panel slides from |
| `width` | `number \| string` | `350` | Panel width in px or CSS value |
| `mode` | `"overlay" \| "push"` | `"overlay"` | Overlay floats on map; push resizes the map container |

## Common mistakes
- **Missing `position: "relative"` on the map container** — in overlay mode, the panel is positioned absolutely. Without a positioned parent, it won't align correctly.
- **No flexbox parent in push mode** — push mode requires the parent container to use `display: flex` so the panel and map sit side by side.
- **Panel content overflowing** — the panel has `overflow: auto`, but if children set their own `height: 100%` without accounting for the header, scrolling may break.

## Reference files
- `src/components/DetailsPanel/DetailsPanel.tsx` — component source, `DetailsPanelProps`
