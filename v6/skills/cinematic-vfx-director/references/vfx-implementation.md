# VFX Implementation Routing

## AI video

Prompt effects as events, not keyword clouds.

Prefer:

`source + trigger + direction + transport + interaction + timing + decay + camera relation`

Example structure:

`The boot strikes the dry surface; a low sheet of dust ejects outward from the contact point, coarse grains arc and settle quickly while finer dust rolls behind the moving body and drifts with the crosswind; the low camera passes through the edge of the cloud as it thins.`

Avoid demanding many unrelated effect families in a single short generation. Split shots when necessary.

## Three.js and real-time 3D

### Choose CPU or GPU by workload

CPU is acceptable for small counts, sparse events, simple debris or effects where authoring simplicity matters more than density.

GPU/compute becomes attractive when the scene requires dense particles, repeated per-particle updates, long trails, flock-like behavior, large precipitation fields, complex lifetime curves, or heavy simulation.

Do not migrate an entire renderer merely because one effect benefits from GPU simulation.

### Representation guide

- soft billboard/camera-facing quad: smoke, mist, dust, glow;
- trail/ribbon: sparks, tracer, jet, energy wisp, rain streak;
- instanced mesh: debris, rock, shard, leaf, solid ash clump;
- procedural/animated surface: shock ring, ripple, scorch, frost, wetness;
- volumetric approximation: dense fog/smoke/atmosphere when depth matters.

### Blend/depth rules

- alpha/transmittance-like treatment is usually appropriate for smoke/dust/fog;
- additive/emissive treatment can suit sparks, hot fire regions and energy, but uncontrolled stacking destroys shape;
- soft particles or depth-aware fading help avoid hard intersections with geometry;
- transparent sorting and overdraw must be inspected in the actual camera views.

### Emitters

Common source shapes:

- point: tiny source, spark origin, candle-like source;
- disc: plume/fire base, ground mist;
- cone: jets, impacts, directional sprays;
- line: beam/tracer/slash source;
- sphere surface: aura/shield shell;
- volume: cloud, fog zone, distributed ambience;
- mesh/surface emission: destruction, burning surfaces, waterfalls, moving objects.

Emitter shape must follow the physical source, not convenience.

### Lifetime curves

Control at minimum when relevant:

- size over lifetime;
- opacity over lifetime;
- emission/temperature over lifetime;
- color over lifetime;
- drag or force influence over lifetime;
- stretch/trail length over lifetime.

### Performance inspection

Measure:

- particle count;
- active emitter count;
- draw calls;
- transparency overdraw;
- sorting cost;
- trail history memory;
- collision/depth sampling cost;
- postprocessing cost;
- CPU-to-GPU update volume.

Optimize only after identifying the actual bottleneck.
