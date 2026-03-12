# Skill: Add a Details Panel

## When to use
When you need a slide-in side panel for showing feature details, charts, metadata, or any supplemental content alongside the map — for example, displaying properties when a user clicks a map feature.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed (DetailsPanel uses Chakra's `Box` and `CloseButton`)

## Template files

| File | Description |
|------|-------------|
| `templates/details-overlay.tsx` | Complete App with overlay mode — panel floats on top of the map |
| `templates/details-push.tsx` | Complete App with push mode — panel resizes the map via flexbox |

## Steps

### 1. Choose a panel mode

- **Overlay mode** (default) — see `templates/details-overlay.tsx`. Panel floats on top of the map with a slide-in animation. Requires the map container to have `position: relative`.
- **Push mode** — see `templates/details-push.tsx`. Panel resizes the map container. Requires the parent to use `display: flex`. The panel's width animates from 0 to the specified `width`, and the map resizes automatically via deck.gl's resize observer.

Both templates show the click-to-select-feature pattern with open/close state.

### 2. Verify

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
