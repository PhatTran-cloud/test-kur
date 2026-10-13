# Quality Control Gates

A scene is not approved until all applicable gates pass.

## Gate 1 — Object Coverage

- Every visible object/group appears in the Motion Ledger.
- Every object has active, reactive, passive, optical, or camera-induced temporal behavior.
- Background elements that affect continuity are not ignored.

Fail condition: a conspicuous object is frozen for no reason while the rest of the world moves.

## Gate 2 — Physical Plausibility

- Driver/force is identifiable.
- Path matches constraints and pivot.
- Acceleration matches mass/material.
- Secondary motion follows the primary force with believable lag.
- Collision/contact responses conserve qualitative direction and weight.

Fail condition: weightless starts/stops, detached pivots, rigid cloth, solid smoke, frozen reflections, impossible wheel/body motion.

## Gate 3 — Narrative Motivation

- Hero motion serves the story beat.
- Camera motion has a dramatic verb.
- Secondary motion reinforces rather than competes.
- Motion density fits the emotional temperature.

Fail condition: technically attractive movement that has no narrative purpose.

## Gate 4 — Spatial Coherence

- Near/far parallax is correct.
- Occlusion order is stable.
- Screen direction is intentional.
- Subject size changes are explained by camera/object movement.
- 180° axis changes are motivated.

Fail condition: the viewer loses orientation unintentionally.

## Gate 5 — Temporal Coherence

- Motion onsets are staggered by cause.
- High-energy actions have anticipation/follow-through where appropriate.
- No arbitrary velocity reset at scene boundaries.
- Ambient motion does not loop mechanically unless desired.

Fail condition: every object begins/stops together or motion snaps at the cut.

## Gate 6 — Optical Coherence

- Motion blur agrees with speed.
- Focus pulls land on meaningful targets.
- Reflections/highlights follow geometry and camera.
- Exposure/light transitions are spatially motivated.

Fail condition: blur, flare, or focus used as a cosmetic overlay detached from motion.

## Gate 7 — Transition Continuity

At least two continuity channels connect adjacent scenes unless the script intentionally demands rupture.

Fail condition: transition is merely a preset effect sitting between unrelated shots.

## Gate 8 — Generation Feasibility

For AI video, ensure the shot can be described as one coherent scene. If too many independent actions compete, split the shot or reduce motion complexity.

Fail condition: prompt contains multiple transformations, camera modes, and story beats that exceed a single coherent temporal event.

## Gate 9 — Anti-jitter / Anti-lag

Check the last frames of A against first frames of B:

- motion vector continuity;
- velocity continuity;
- camera angular continuity;
- motion blur continuity;
- pose/cloth/particle continuity;
- lighting/focus continuity;
- no single-frame scale or position jump.

If any mismatch is intentional, state the dramatic reason. Otherwise repair it.

## Gate 10 — Cinematic Restraint

Ask: can any motion/effect be removed while preserving or improving the story? If yes, remove or reduce it. Cinematic richness comes from coordination and causality, not maximum effect count.
