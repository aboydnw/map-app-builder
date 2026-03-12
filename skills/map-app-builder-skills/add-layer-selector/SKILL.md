# Skill: Add a Layer Selector

## When to use
When you want a floating panel that lets users toggle the visibility of individual map layers — for example, showing/hiding satellite imagery, building footprints, or data overlays independently.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- At least one deck.gl layer to control
- `@chakra-ui/react` installed (LayerSelector uses Chakra's `Box`, `Flex`, `HStack`, `Text`)

## Template files

| File | Description |
|------|-------------|
| `templates/layer-selector-example.tsx` | Complete App with visibility state, LayerConfig array, and deck.gl layer integration |

## Steps

### 1. Add a layer selector

See `templates/layer-selector-example.tsx` for the complete integration. The key pattern:

1. **Visibility state** — a `Record<string, boolean>` keyed by layer ID
2. **Toggle handler** — flips the boolean for a given ID
3. **LayerConfig array** — defines `id`, `label`, `visible`, and optional `color` (shows a swatch)
4. **deck.gl layers** — pass the `visible` flag from state into each layer factory call
5. **LayerSelector component** — placed as a sibling to `<DeckGL>` inside the map container

The `id` in `LayerConfig` must match the `id` on the deck.gl layer. The component only manages UI toggles — you must pass `visible` to each deck.gl layer yourself.

### 2. Verify

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
