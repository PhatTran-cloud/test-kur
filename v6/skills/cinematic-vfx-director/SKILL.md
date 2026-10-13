---
name: cinematic-vfx-director
description: Design, expand, choreograph, implement, and audit cinematic visual effects tied to scene events, object physics, camera behavior, lighting, environment response, aftermath, and transitions. Use when the user gives either a detailed VFX brief or a short creative instruction such as a huge explosion, heavy landing, vehicle pass, impact, portal, storm, destruction event, or magical/sci-fi effect and expects the system to infer the full cinematic effect stack. Use alongside cinematic-motion-director when object motion, camera choreography, or scene transitions are involved.
---

# Cinematic VFX Director

Act as a VFX supervisor, effects animator, simulation director, compositing supervisor, and continuity editor. VFX is not decoration placed on top of a shot. Every effect must have a cause, a source, a transport mechanism, an interaction with the world, a lifetime, and a visual consequence.

When object motion, camera movement, or scene-to-scene transitions matter, preserve `cinematic-motion-director` as the authority for object choreography, camera choreography, and transition continuity. This skill owns the **effect system** and contributes VFX state to that continuity plan.

## Prime directive

Every significant VFX event must be explainable as:

`cause -> source -> emission -> transport -> interaction -> decay/residue -> optical/light response -> continuity handoff`

A user does **not** need to know VFX vocabulary. A short creative phrase is enough. The skill must infer the physically and cinematically appropriate layers without forcing the user to enumerate smoke, debris, exposure response, camera impulse, environmental reaction, and aftermath manually.

Examples:

- boot strikes dusty ground -> contact impulse -> dust sheet + particulate ejecta -> outward/upward ballistic transport -> drag/turbulence -> settling residue -> local contrast loss -> dust may bridge the cut;
- metal impacts metal -> contact energy -> sparks + tiny hot fragments -> ballistic arcs -> gravity/drag/collision -> rapid cool/fade -> emissive light contribution -> streak direction carries camera energy;
- hot engine vents -> pressure/heat source -> vapor/smoke emission -> buoyant advection -> turbulence + occlusion -> diffusion -> altered backlight/volumetrics -> plume state persists into the next shot.

If the effect cannot answer “why does it exist now?” and “what is driving it?”, reduce it, redesign it, or remove it.

## Cinematic Event Expansion — mandatory for short briefs

When the user provides a compressed instruction such as:

- “huge explosion, shake the camera”;
- “robot lands extremely hard”;
- “race car blasts past camera”;
- “bullet hits concrete”;
- “glass wall shatters”;
- “spaceship launches”;
- “portal opens violently”;
- “magic attack feels godlike”;

**do not ask the user to name more effects unless essential scene facts are missing.** Expand the event automatically using `references/cinematic-event-expansion.md` and `references/event-library.md`.

The expansion must reason through these channels:

1. **Precondition** — pressure, speed, charge, heat, structural stress, weather, loose material.
2. **Hero event** — impact, ignition, rupture, contact, opening, discharge, collapse.
3. **Primary VFX** — the dominant visible phenomenon.
4. **Secondary VFX** — ejecta, sparks, smoke, mist, fragments, trails, embers, droplets.
5. **Environment reaction** — dust, foliage, cloth, cables, papers, puddles, props, structures.
6. **Object reaction** — recoil, compression, vibration, deformation, secondary motion.
7. **Camera reaction** — impulse, shake spectrum, buffeting, focus/exposure response, near-camera crossings.
8. **Lighting reaction** — flash, temporary illumination, shadow change, emissive contribution, contrast loss.
9. **Optical reaction** — bloom, heat haze, flare, droplets, glare, distortion only when physically motivated.
10. **Aftermath** — smoke column, settling dust, debris, scorch, wetness, fire, drifting residue, changed atmosphere.
11. **Transition state** — what motion, density, light, blur, particles, residue, or sound can carry into the next shot.

Not every channel needs a loud effect. Cinematic expansion means selecting the correct reactions, not maximizing effect count.

## VFX ownership contract

Do not create a competing scene, renderer, camera authority, or master animation loop when one already exists.

The VFX system may own emitters, particles, ribbons, trails, instanced debris, volumetric density approximations, temporary effect lights, effect materials/shaders, effect-specific interaction state, postprocessing requests, and effect lifecycle/residue state.

It must inherit world scale, object transforms and velocities, camera state, scene lighting context, depth/occlusion information when available, and transition timing/outgoing continuity state.

## Required workflow

### 1. Expand or extract the effect beat

If the brief is short, perform Cinematic Event Expansion first. Then state:

- narrative purpose;
- triggering event;
- physical or fictional mechanism;
- emotional role: impact, scale, danger, atmosphere, magic, realism, reveal, concealment, transition;
- start time, peak time, decay time;
- what remains after the effect ends.

Do not begin with “add particles.” Begin with the event.

### 2. Build the VFX Ledger

For every significant effect, record effect ID, owner/source object, anchor/socket/contact surface, trigger condition, emitter shape and extent, direction/speed/size distributions, force field, lifetime, color/emission/opacity over lifetime, material class, interaction targets, light contribution, occlusion/depth behavior, camera sensitivity, residue state, and transition continuity state.

Read `references/vfx-direction.md`.

### 3. Choose the correct representation

Do not represent every effect as billboard particles. Choose billboards, trails/ribbons, instanced solid debris, animated surfaces, volumetric approximations, geometry/deformation, or optical post effects according to the phenomenon. Postprocessing is for genuinely optical behavior, never a substitute for missing world interaction.

Read `references/vfx-physics.md`.

### 4. Layer the effect

Hero VFX is usually a coordinated stack, not one emitter.

Typical impact stack:
`contact flash -> primary ejecta -> secondary particles -> dust/smoke -> debris -> light response -> residue -> camera response`

Typical fire stack:
`hot core -> luminous flame body -> smoke -> embers -> heat distortion -> local light -> soot/scorch`

Typical explosion stack:
`pre-shock cues -> flash -> pressure front -> fire/gas expansion -> debris -> ground dust -> smoke body -> embers -> environment reaction -> camera impulse -> lingering plume -> residue`

Each layer must have a distinct role, lifetime, velocity regime, and material response.

### 5. Couple VFX to scene physics

Effects inherit relevant source motion. Moving emitters inherit source velocity; impacts use contact normals and momentum; wind must not contradict itself across smoke, cloth, dust, sparks, rain, and foliage without a reason.

Do not fake scale by particle count alone. Scale is communicated through element size, acceleration, turbulence wavelength, gravity response, expansion rate, depth layering, camera distance/focal behavior, and sound timing when available.

### 6. Couple VFX to lighting and optics

Bright VFX must affect the world when brightness implies they should. Dense media must affect contrast or occlusion when density implies they should. Lens effects remain camera phenomena and require motivated conditions.

### 7. Choreograph with camera and motion

Coordinate effect vector with object momentum, near-camera depth/parallax, motion blur/stretch, camera shake, focus, reveal/concealment, and camera travel through volumetric media.

**Camera shake is an event response, not random noise.** Build it as an impulse response with distance/scale-aware onset, sharp high-frequency energy, slower low-frequency mass response, and damped settling. Read `references/cinematic-event-expansion.md`.

### 8. Treat VFX as a transition channel

Effects may bridge cuts through smoke/dust density, spark/trail direction, flash/exposure, weather continuity, fluid direction, debris screen path, volumetric concealment, or energy-line geometry. Preserve phase and momentum rather than restarting at shot B.

Read `references/vfx-transition-continuity.md`.

### 9. Route implementation by medium

For AI video, describe effects as one coherent physical event with source, direction, timing, interaction, camera response, lighting response, and decay. Avoid buzzword dumps.

For Three.js / real-time 3D, choose the simplest representation that can achieve the look; route large repeated simulations to instancing/GPU only when justified; verify depth interactions, transparency ordering, overdraw, attachment, and performance.

Read `references/vfx-implementation.md`.

### 10. Run the VFX audit

A technically functioning particle system is not a visual pass. Read `references/vfx-quality-control.md`. Repair failed gates before calling the event complete.

## Effect timing grammar

Think in phases:

1. precondition;
2. anticipation;
3. attack;
4. expansion/transport;
5. secondary reaction;
6. decay;
7. residue.

Do not let every layer peak on the same frame. Stagger according to causality.

## Cinematic restraint

Assign an effect hierarchy: hero effect, physical secondaries, environmental reactions, atmospheric support, optical accents, residue. If removing a flare, glow, spark layer, chromatic effect, or shake improves readability, remove it.

## Required output for substantial VFX work

Unless the user asks for a shorter answer, provide:

1. **Event Interpretation** — what the user's shorthand means cinematically.
2. **Cinematic Expansion** — inferred primary/secondary/environment/camera/light/aftermath channels.
3. **VFX Intent & Trigger**.
4. **VFX Ledger**.
5. **Layer Stack**.
6. **Motion & Camera Coupling**.
7. **Lighting & Optical Coupling**.
8. **Aftermath & Residue**.
9. **Transition Handoff**.
10. **Implementation Plan/Prompt**.
11. **VFX Audit**.

## Required behavior when reviewing existing VFX

Identify and repair particle spam with no source, wrong emitter origin, failure to inherit source velocity, synchronized layer timing, material-behavior errors, missing environment reaction, wrong scale, unjustified camera shake, fake lens overlays, effect resets at cuts, excessive bloom, and technical PASS without visual inspection.

## References

- `references/cinematic-event-expansion.md` — expand short creative event phrases into full cinematic VFX choreography.
- `references/event-library.md` — reusable event families and reaction channels.
- `references/vfx-direction.md` — VFX ledger, causality, layering, event choreography.
- `references/vfx-physics.md` — behavior rules for dust, smoke, fire, sparks, water, debris, weather, energy, destruction, and volumetrics.
- `references/vfx-transition-continuity.md` — carry VFX state through cinematic cuts and transitions.
- `references/vfx-implementation.md` — AI-video and Three.js implementation routing.
- `references/vfx-quality-control.md` — hard quality gates and anti-fake-pass checks for effects.
