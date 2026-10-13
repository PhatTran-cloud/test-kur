# VFX Quality Control Gates

A VFX system is not approved merely because particles render.

## Gate 1 — Causal source

The effect has an identifiable trigger, source and reason to exist now.

Fail: floating particle decoration with no scene cause.

## Gate 2 — Source attachment

Emitter position/orientation follows the correct object, socket, contact point or surface normal and inherits relevant source velocity.

Fail: sparks spawn beside the impact or exhaust lags behind its moving nozzle incorrectly.

## Gate 3 — Material behavior

The effect behaves like its intended substance or defined fictional material.

Fail: smoke falls like rocks, debris floats like fog, water ignores gravity, sparks drift like snow.

## Gate 4 — Layer timing

Primary and secondary layers have causal timing and distinct lifetime regimes.

Fail: flash, debris, smoke and residue all appear and disappear together.

## Gate 5 — World interaction

Collision, occlusion, deposition, wetness, scorch, illumination, displacement or other interactions are present when visually required.

Fail: dense smoke never occludes; bright explosion produces no local light; heavy debris passes through the floor.

## Gate 6 — Scale coherence

Particle size, velocity, turbulence, gravity response and camera depth support the intended scale.

Fail: a building-sized explosion moves with sparkler-scale turbulence.

## Gate 7 — Camera coherence

Depth, parallax, motion blur/stretch and near-camera behavior agree with camera movement.

Fail: particles look screen-locked while the camera translates through the scene.

## Gate 8 — Lighting/optical coherence

Emissive effects influence exposure/light appropriately; atmospheric effects affect contrast/depth appropriately; lens effects are motivated by camera conditions.

Fail: bloom/glare appears as generic decoration unrelated to luminous sources.

## Gate 9 — Transition continuity

If the effect crosses a scene boundary, its vector, density, phase, residue and optical state are intentionally carried or transformed.

Fail: effect resets at the cut.

## Gate 10 — Performance feasibility

The implementation meets the intended real-time or generation constraints without destroying the look.

Fail: technically beautiful effect makes the interactive scene unusable, or optimization removes the defining visual behavior.

## Gate 11 — Visual inspection

Inspect the effect in the intended hero view and at least one diagnostic view that exposes depth/attachment problems. High-risk effects may require slow-motion or frame-by-frame inspection.

Fail: PASS is based only on source code, emitter counts, console state or a single flattering still frame.

## Final states

Use:

- PASS — all mandatory gates directly supported;
- FAIL — at least one mandatory gate contradicted;
- PARTIAL — some gates supported but acceptance incomplete;
- UNVERIFIED — required evidence not obtained.

Never promote PARTIAL or UNVERIFIED to PASS.
