The fastest test loop: Create a fresh project outside the maptool repo that installs @maptool/core as a local dependency, then use Cursor with the skills to build a real map app. This validates the full chain — package exports, skill quality, Cursor comprehension, and actual rendering.
Setup

Publish locally (no npm needed):

bashcd map-app-builder
npm run build
npm pack
# produces maptool-core-0.1.0.tgz

Scaffold a test project:

bashmkdir ~/Documents/Github/ai-experiments/maptool-test-app
cd ~/Documents/Github/ai-experiments/maptool-test-app
npm create vite@latest . -- --template react-ts
npm install ../map-app-builder/maptool-core-0.1.0.tgz
Alternatively skip npm pack and just use "@maptool/core": "file:../map-app-builder" in the test project's package.json — same thing the template already does.

Copy the skills folder into the test project root so Cursor can reference them:

bashcp -r ../map-app-builder/skills ./skills
What to test (in order)
Test 1 — Setup skill. Open Cursor, prompt: "Follow the instructions in skills/setup-map-app/SKILL.md to set up this project as a map application." Verify: does Cursor produce a working map shell without you hand-holding? Note where it gets confused.
Test 2 — COG layer skill. Prompt: "Follow skills/add-cog-layer/SKILL.md. Use this COG: https://oin-hotosm.s3.amazonaws.com/5f1579e4e17d8d0010f3af8f/0/5f1579e4e17d8d0010f3af90.tif" — This is the same COG the template app uses, so you know it works with the public TiTiler. Verify: tiles render, legend shows with correct domain.
Test 3 — Animation skill. This is the hardest test because Cursor needs to understand how useAnimationClock wires to AnimationTimeline. Use a STAC-based prompt: "Follow skills/add-animation/SKILL.md. Search Earth Search for sentinel-2-l2a items over San Francisco from June 2024 and animate through them." This combines the STAC and animation skills — if Cursor can chain them, the APIs are clean enough.
Test 4 — Freestyle. Don't reference a skill at all. Just prompt: "Using @maptool/core, build a map that shows NDVI data from this COG with a green color ramp and a legend." This tests whether Cursor can figure out the library from types + JSDoc alone, without skill hand-holding.
What to watch for
The things that'll break are predictable:

Import paths — Does import { MapLegend } from "@maptool/core" resolve correctly, or does Cursor try to deep-import from @maptool/core/components/MapLegend?
CSS loading — Does Cursor remember to import @maptool/core/styles.css? The skills mention it but Cursor may skip it.
Hook ↔ component wiring — Does Cursor correctly pass clock.setPlaying to onPlayingChange (not clock.togglePlay)? The naming matters.
Null guards — Does Cursor guard titiler.tileUrl before creating the layer, or does it crash on first render?

Keep a doc of every place Cursor stumbles — that's your skill improvement backlog. The goal is that after 2-3 iterations on the skills, Cursor can go from zero to a working map app with no manual corrections.