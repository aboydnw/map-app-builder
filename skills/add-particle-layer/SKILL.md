# Skill: Add a Particle Layer (Wind Animation)

## When to use
When you want to animate particles to visualize wind, ocean currents, or other flow field data on the map.

## Prerequisites
- Working map app shell (see `setup-map-app` skill)
- Wind or flow data in a supported format (PNG velocity texture or GRIB-derived JSON)

## Steps

### 1. Install the particle extension

```bash
npm install @weatherlayers/deck.gl-particle
```

### 2. Prepare wind data

Wind data is typically encoded as a PNG image where R/G channels represent U/V velocity components, or as a JSON object with grid metadata.

Example using a pre-encoded PNG velocity texture:
```tsx
const WIND_DATA = {
  image: "https://example.com/wind-velocity.png",
  bounds: [-180, -90, 180, 90],
  uMin: -30,
  uMax: 30,
  vMin: -30,
  vMax: 30,
};
```

### 3. Add the particle layer

```tsx
import { ParticleLayer } from "@weatherlayers/deck.gl-particle";

const particleLayer = new ParticleLayer({
  id: "wind-particles",
  image: WIND_DATA.image,
  imageUnscale: [WIND_DATA.uMin, WIND_DATA.uMax, WIND_DATA.vMin, WIND_DATA.vMax],
  bounds: WIND_DATA.bounds,
  numParticles: 5000,
  maxAge: 60,
  speedFactor: 2,
  color: [255, 255, 255, 200],
  width: 1.5,
  animate: true,
});
```

### 4. Add parameter controls

```tsx
import { useState } from "react";
import { Box, Slider, Text } from "@chakra-ui/react";

const [numParticles, setNumParticles] = useState(5000);
const [speed, setSpeed] = useState(2);

<Box position="absolute" top={4} right={4} bg="white" p={4} borderRadius="md" boxShadow="md" w="200px">
  <Text fontSize="sm" mb={1}>Particles: {numParticles}</Text>
  <Slider
    value={[numParticles]}
    min={1000}
    max={20000}
    step={1000}
    onValueChange={(details) => setNumParticles(details.value[0])}
  />
  <Text fontSize="sm" mt={3} mb={1}>Speed: {speed}x</Text>
  <Slider
    value={[speed]}
    min={0.5}
    max={10}
    step={0.5}
    onValueChange={(details) => setSpeed(details.value[0])}
  />
</Box>
```

### 5. Animate with requestAnimationFrame

The particle layer needs continuous re-rendering:

```tsx
import { useEffect, useRef, useState } from "react";

const [time, setTime] = useState(0);
const animRef = useRef<number>();

useEffect(() => {
  const animate = () => {
    setTime((t) => t + 1);
    animRef.current = requestAnimationFrame(animate);
  };
  animRef.current = requestAnimationFrame(animate);
  return () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };
}, []);
```

Pass `time` as a dependency to force layer re-creation, or use deck.gl's `_animate: true` prop.

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
