// Creates a ParticleLayer from wind velocity data.
// Requires: npm install @weatherlayers/deck.gl-particle

import { ParticleLayer } from "@weatherlayers/deck.gl-particle";
import { WIND_DATA } from "./wind-data";

interface ParticleLayerOptions {
  numParticles?: number;
  speedFactor?: number;
  maxAge?: number;
}

export function createWindParticleLayer({
  numParticles = 5000,
  speedFactor = 2,
  maxAge = 60,
}: ParticleLayerOptions = {}) {
  return new ParticleLayer({
    id: "wind-particles",
    image: WIND_DATA.image,
    imageUnscale: [WIND_DATA.uMin, WIND_DATA.uMax, WIND_DATA.vMin, WIND_DATA.vMax],
    bounds: WIND_DATA.bounds,
    numParticles,
    maxAge,
    speedFactor,
    color: [255, 255, 255, 200],
    width: 1.5,
    animate: true,
  });
}
