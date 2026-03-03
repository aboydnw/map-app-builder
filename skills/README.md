# maptool Cursor Skills

These skills are self-contained prompt documents for common workflows using `@maptool/core`.

## How to use

1. Keep this `skills/` directory in your project root.
2. When working in Cursor, reference a skill explicitly:
   - "Follow `skills/setup-map-app/SKILL.md`"
   - "Use `skills/add-cog-layer/SKILL.md` for this task"
3. Keep the skill instructions close to code by linking the reference files listed in each skill.

## Available skills

| Skill | Description |
| --- | --- |
| `setup-map-app` | Scaffold a Vite + React + deck.gl + MapLibre app with maptool |
| `add-cog-layer` | Connect TiTiler, render a COG layer, and add a matching legend |
| `add-stac-layer` | Search a STAC API, select an item, and visualize assets |
| `add-animation` | Add temporal playback with `AnimationTimeline` and `useAnimationClock` |
| `write-tests` | Add unit and E2E tests for maptool components, hooks, and utils |
| `setup-local-stac` | Stand up a local STAC API + TiTiler + file server stack via Docker Compose |
| `ingest-stac-data` | Ingest local COG files into the local STAC stack |
| `manage-colormaps` | Control colormap selection, nodata transparency, and custom colormaps |
