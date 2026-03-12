# Skill: Add a Particle Layer (Wind Animation)

## When to use
When you want to animate particles to visualize wind, ocean currents, or other flow field data on the map.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- Wind or flow data in a supported format (PNG velocity texture or GRIB-derived JSON)

## Template files

| File | Purpose |
|------|---------|
| `templates/wind-data.ts` | Wind velocity texture config and data source URLs |
| `templates/particle-layer.tsx` | ParticleLayer factory function with sensible defaults |
| `templates/particle-controls.tsx` | Chakra UI slider controls for particle density and speed |
| `templates/animation-loop.tsx` | `useAnimationLoop` hook using requestAnimationFrame |

## Steps

### 1. Install the particle extension

```bash
npm install @weatherlayers/deck.gl-particle
```

### 2. Prepare wind data

Wind data is typically encoded as a PNG image where R/G channels represent U/V velocity components, or as a JSON object with grid metadata.

Copy `templates/wind-data.ts` into your app's `src/` directory. Adjust the URLs and velocity bounds to match your data source.

### 3. Add the particle layer

Copy `templates/particle-layer.tsx` into your app's `src/` directory. It exports a `createWindParticleLayer` factory that accepts `numParticles`, `speedFactor`, and `maxAge` options.

### 4. Add parameter controls

Copy `templates/particle-controls.tsx` into your app's `src/` directory. It exports a `ParticleControls` component with sliders for particle count and speed. Place it as a sibling of the map component inside a relative-positioned container.

### 5. Animate with requestAnimationFrame

The particle layer needs continuous re-rendering. Copy `templates/animation-loop.tsx` into your app's `src/` directory. It exports a `useAnimationLoop` hook that returns a `time` counter.

Pass `time` as a dependency to force layer re-creation, or use deck.gl's `_animate: true` prop on the DeckGL component instead.

### 6. Verify

- [ ] Particles animate across the map following wind direction
- [ ] Particle density and speed respond to slider controls
- [ ] Performance stays above 30fps (reduce `numParticles` if needed)
- [ ] Particles respect geographic bounds

## Common mistakes
- **Wrong image encoding** — the velocity PNG must encode U in the red channel and V in the green channel, normalized to 0-255
- **Missing `imageUnscale`** — without it, velocities are treated as 0-255 instead of physical units
- **Too many particles** — start with 5000 and increase; over 20000 impacts performance significantly
- **Not enabling animation** — set `animate: true` on the layer or use `_animate` on DeckGL
- **Using with GlobeView** — particle layers may not work correctly in globe projection; test with flat MapView first

## Reference files
- [`@weatherlayers/deck.gl-particle`](https://github.com/weatherlayers/deck.gl-particle) — particle layer package
