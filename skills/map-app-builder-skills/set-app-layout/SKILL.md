# Skill: Set Application Layout

## When to use
When you need to arrange panels, sidebars, bottom bars, or other UI regions around the map. Use this skill **first** to establish the spatial structure, then fill panels with content using other skills.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- `@chakra-ui/react` installed and app wrapped with `MapToolProvider`

## Template files

| File | Description |
|------|-------------|
| `templates/push-panel-layout.tsx` | Full push sidebar layout with toggle button and flex-based map resizing |
| `templates/overlay-panel-layout.tsx` | Overlay panels (right panel + bottom bar) floating over the map |
| `templates/combined-layout.tsx` | Push sidebar combined with overlay elements on the map |
| `templates/responsive-layout.tsx` | Responsive layout with push panel on desktop, Chakra Drawer on mobile |
| `templates/dark-overlay.tsx` | Dark mode overlay background styling for dark basemaps |
| `templates/details-panel-push.tsx` | DetailsPanel component usage with mode="push" |

## Concepts

### Panel modes

**Push panels** take space away from the map via flex layout. The map resizes to fill whatever space remains. Use push panels for primary navigation, persistent controls, or content-heavy sidebars.

**Overlay panels** float over the map with absolute positioning and a semi-transparent background. The map stays full-screen underneath. Use overlay panels for legends, compact toolbars, or secondary info that shouldn't shrink the map.

### Z-index hierarchy

All overlay elements must follow this z-index scale to avoid conflicts:

| z-index | Purpose |
|---------|---------|
| 1 | Toggle buttons, minor controls |
| 10 | Panels, legends, timeline bars |
| 1000 | Tooltips, popovers |

### Non-overlap rules

When combining multiple overlay elements, offset them so they don't stack on top of each other. Common approach:
- If a bottom bar exists, shift `bottom-left` and `bottom-right` legends up by the bar's height
- If a left push panel exists, overlay elements on the map start after the panel's width
- Use CSS custom properties or constants to share dimensions between elements

## Steps

### 1. Choose your layout regions

Decide which regions your app needs. Common configurations:

| Layout | Regions |
|--------|---------|
| Explorer | Left push sidebar + map |
| Dashboard | Left push sidebar + map + bottom overlay bar |
| Viewer | Map + right overlay panel + bottom overlay bar |
| Compare | Left push sidebar + map + right push sidebar |
| Minimal | Map + small overlay controls |

### 2. Push panel layout (sidebar + map)

Use Chakra's `Flex` to split the viewport. The map container gets `flex={1}` to fill remaining space. See `templates/push-panel-layout.tsx`.

For a **right** sidebar, move the `<Box>` after the map container and change `borderRight` to `borderLeft`.

For a **partial-height** push panel, add `h="75vh"` (or any fraction) and `alignSelf="flex-start"` (top-anchored) or `alignSelf="flex-end"` (bottom-anchored) to the panel Box.

### 3. Overlay panel layout

Overlay panels sit inside the map's `position: relative` container using absolute positioning. See `templates/overlay-panel-layout.tsx`.

The shared `BOTTOM_BAR_HEIGHT` constant prevents the right panel from overlapping the bottom bar. Apply the same pattern for any overlapping regions — extract the dimension as a constant and reference it in the adjacent panel's offset.

### 4. Combined push + overlay layout

For apps with a push sidebar AND overlay elements on the map, see `templates/combined-layout.tsx`.

Overlay elements only live inside the map container, so they automatically avoid the push sidebar.

### 5. Responsive behavior

On mobile, push sidebars should collapse into a drawer. See `templates/responsive-layout.tsx` for a complete example using Chakra's `Drawer` component with breakpoint-based switching.

For overlay panels on mobile, reduce width to full-screen or hide behind a toggle:

```tsx
<Box
  position="absolute"
  top={4}
  right={4}
  w={{ base: "calc(100% - 32px)", md: "320px" }}
  /* ... */
>
```

### 6. Dark mode overlays

For dark basemaps, use dark overlay backgrounds. See `templates/dark-overlay.tsx`.

### 7. Verify

- [ ] Push panels resize the map (not overlap it)
- [ ] Overlay panels don't overlap each other
- [ ] Shared dimension constants keep offsets in sync
- [ ] Sidebar collapses to drawer on mobile viewports
- [ ] Overlay panels adapt width on mobile
- [ ] Map interaction (pan, zoom) works in all uncovered areas
- [ ] Z-index hierarchy is consistent (1 → 10 → 1000)

## Common mistakes
- **Overlay panels overlapping** — always extract shared dimensions as constants and use them as offsets on adjacent panels
- **Map not resizing on sidebar toggle** — deck.gl auto-detects container resize, but if it doesn't, add a `key={String(sidebarOpen)}` to force remount
- **Forgetting `position: relative`** — the map container must have `position="relative"` for absolute overlay children to anchor correctly
- **Z-index conflicts with MapLegend/AnimationTimeline** — these components use `zIndex={10}` internally; custom overlay panels should use the same level or adjust accordingly
- **Mobile drawer not closing on navigation** — call `setSidebarOpen(false)` in any sidebar action that should dismiss the drawer

## DetailsPanel component

For push-panel layouts, use the `DetailsPanel` component with `mode="push"` for a sidebar that pushes the map content. See `templates/details-panel-push.tsx`.

The `DetailsPanel` component handles styling, scroll behavior, and consistent spacing. Use `mode="overlay"` for floating panels instead.

## Reference files
- `src/components/MapToolProvider.tsx` — Chakra provider wrapper
- `src/components/MapLegend/MapLegend.tsx` — legend positioning and z-index patterns
- `src/components/AnimationTimeline/AnimationTimeline.tsx` — bottom bar positioning
- `src/components/DetailsPanel/` — push and overlay panel component

## Reference test app
- `tests/coastal-explorer/` — working example with push-panel layout using DetailsPanel and flex container
