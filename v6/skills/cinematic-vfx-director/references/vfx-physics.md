# VFX Physical Behavior

These are qualitative directing rules. Use higher-fidelity simulation only when the medium and task justify it.

## Dust and dry particulate

- source from contact, displacement, collapse, wind, tires, footsteps, impacts;
- inherit source/contact velocity;
- coarse particles follow ballistic arcs and settle sooner;
- fine dust is more influenced by drag, turbulence and ambient airflow;
- dense dust reduces contrast and visibility;
- ground-hugging dust should interact with terrain height and surface normal;
- settling can leave residue or temporarily altered surface appearance.

## Smoke, steam and vapor

- smoke should advect with airflow and often rise when buoyancy/heat supports it;
- larger structures roll and curl; tiny high-frequency noise alone reads as procedural noise rather than volume;
- density should expand/diffuse over time;
- steam may condense/dissipate faster than heavy smoke;
- plume direction must agree with wind and source motion;
- dense smoke should occlude, soften lighting and create depth.

## Fire and embers

- fire requires a believable source/fuel region in realistic contexts;
- flame body rises and deforms with flow, while source location remains anchored to fuel;
- embers detach, inherit upward/horizontal flow, then respond to gravity/drag;
- bright fire should create local illumination and exposure response when intense enough;
- smoke/soot relationship depends on material and intended realism;
- avoid treating fire as an additive blob with no world response.

## Sparks and hot fragments

- spawn from energetic contact, cutting, grinding, electrical fault, or explosive rupture;
- prefer directional streaks aligned to velocity;
- trajectories are ballistic with drag and possible collisions/bounces;
- brightness decays rapidly as fragments cool;
- use a distribution of speeds and lifetimes, not identical arcs;
- secondary smoke or scorch may remain after the sparks disappear.

## Debris and shards

- use solid geometry when silhouette, tumbling or lighting matters;
- fragment mass changes acceleration and bounce response;
- angular velocity should vary by fragment;
- collision and resting states matter;
- debris must not vanish before its implied momentum resolves unless hidden by a cut.

## Water, spray and mist

- water sheets/droplets inherit impact direction and surface normal;
- gravity dominates larger droplets;
- smaller spray becomes mist and is more wind/drag sensitive;
- water impact may create ripples, foam, splash crown and wetness;
- wet surfaces should alter roughness/specular response when visible;
- scale must match droplet size, velocity and camera distance.

## Rain and snow

- rain vector combines gravity and wind;
- near-camera streaks differ strongly from distant rainfall;
- rainfall implies splashes/wetness where surfaces are exposed;
- snow falls slower, drifts more and may accumulate;
- weather must agree with atmospheric visibility and wind cues elsewhere in the scene.

## Volumetric fog, mist and atmosphere

- density should live in world/depth space, not appear as a flat screen veil;
- light shafts require both participating medium and directional light path;
- camera travel through volume changes apparent density and parallax;
- fog can provide depth separation but should not erase composition indiscriminately.

## Electricity and energy

For realistic electricity, arcs should connect plausible potential differences or conductive targets. Branching, flicker and path changes occur faster than heavy physical motion.

For fictional energy, define a consistent rule set first: source, field, attraction/repulsion, propagation speed, decay, interaction and light contribution. Stylized does not mean arbitrary.

## Shockwaves and pressure events

Use a fast initial wave followed by slower secondary material response. Dust, loose debris, foliage, cloth, smoke and camera may react with different delays and amplitudes.

A shockwave should not look like a glowing ring unless that visual language is intentionally stylized.

## Destruction

Separate:

1. initiating force;
2. structural break or fracture;
3. primary fragments;
4. dust/smoke ejecta;
5. secondary collisions;
6. collapse/settle;
7. residue.

Keep fragment velocity and fracture direction related to the force and structure.

## Heat distortion and optical turbulence

Heat haze is refractive distortion caused by a temperature gradient. It should distort background imagery in/behind the hot region and should weaken with distance from the source. It is not a generic blur overlay.
