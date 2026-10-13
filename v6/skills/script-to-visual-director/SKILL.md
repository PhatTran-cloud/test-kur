---
name: script-to-visual-director
description: "Convert a finished script and recorded narration timing into an original, research-grounded visual direction package: visual thesis, metaphors, dynamic storyboard, scene cards, asset bible, transition graph, and implementation handoff for Fable, Three.js, Bang Motion, and Remotion. Use when narration exists or a script needs visual development before code; do not use as a renderer."
---

# Script to Visual Director

Use this skill before implementing a storytelling video. It turns narration into a visual argument rather than a literal list of nouns.

The output is a reviewable direction package, not application code:

- `docs/visual-direction.md`
- `docs/storyboard.md`
- `docs/asset-bible.md`
- `docs/transition-graph.md`
- `docs/fable-handoff.md`

If the project already has equivalent files, revise them instead of creating duplicates.

## Non-negotiable principles

1. **The script is evidence, not a shot list.** A sentence may occupy one shot, several beats, or continue through a changing world. Do not force one scene per sentence or a fixed scene count.
2. **Find the visual thesis before choosing assets.** State what the viewer should understand and feel after the whole piece. Every major beat must serve that thesis.
3. **Add meaningful information beyond the narration.** Use metaphor, scale, environment, consequence, contrast, secondary action, or reveal. Do not invent factual claims; label expressive metaphor as metaphor.
4. **Design a visual system, not a collection of pretty frames.** Lock a palette logic, shape vocabulary, typography, material family, depth strategy, camera language, motion language, and sound relationship. Change them only when the story motivates the change.
5. **Build continuity deliberately.** Track geography, scale, light direction, weather, object identity, recurring motifs, and state changes. A transition must be caused by an action, camera move, object, light, sound bridge, or meaningful cut.
6. **References teach principles, not skins.** Kage, Kurzgesagt, Bang Motion, and 3dviz-pro-max may inform composition, pacing, depth, and craft. Never copy artwork, code, exact layouts, palettes, characters, or signature moments.
7. **Choose the medium per beat.** Use 2D/vector/cut-paper for diagrams, symbols, typography, and conceptual metaphor; use real 3D for spatial scale, hero objects, physical interaction, volumetric atmosphere, and camera travel; combine them when depth helps the story.
8. **Design for implementation.** Every shot must name its focal subject, layers, camera, lighting, motion, transition, audio cue, and acceptance test. A beautiful adjective without an observable action is not a direction.

## Workflow

### A. Ingest and ground

Read the script, exact narration audio, Whisper word-level timing, existing project constraints, and approved references. If timing is unavailable, mark timing as provisional; never pretend it is synced.

Create a compact claim map:

| id | narration claim | source/evidence | confidence | visual treatment |
|---|---|---|---|---|

Separate factual claims, emotional interpretation, and expressive metaphor.

### B. Write the visual thesis

Write:

- audience and delivery format;
- the single question or tension;
- the viewer's intended takeaway;
- emotional arc;
- visual thesis in one sentence;
- three candidate visual systems;
- one chosen system and why it fits the story.

A visual system must specify palette logic, shape language, typography, surface/material, foreground/midground/background strategy, camera behavior, motion language, transition family, and sound relationship.

### C. Build beats, not slides

Group narration into meaning beats. A beat changes understanding, state, scale, viewpoint, or emotion. A pause alone is not a new scene.

For each beat, decide:

- keep the current world and transform it;
- reveal a new region of the world;
- change viewpoint or instrument;
- cut because the idea truly changes;
- use an interstitial only when the story needs a breath.

Vary shot scale, angle, depth, and motion direction for a narrative reason. Do not use a repeated template to fill duration.

### D. Create scene cards

Use the schema in `references/visual-reasoning.md`. Each scene card must include exact or provisional timecode, narration range, purpose, takeaway, visual thesis, metaphor, hero object/action, secondary details, foreground/midground/background, camera in/action/out, lighting/material, text, audio/SFX, transition in/out, assets, implementation route, and acceptance tests.

A scene is incomplete if it only says show a forest, show a planet, or animate the text.

### E. Build continuity and transition documents

Create an asset bible with canonical descriptions for recurring objects, characters, environment, palette tokens, scale, light direction, material behavior, and permitted state changes.

Create a transition graph:

```text
scene-A --cause/action--> scene-B
```

For every edge, state what carries across the cut: subject, motion vector, sound, color, light, geometry, or semantic idea. Prefer push-through, occlusion, match motion, object transformation, camera travel, motivated cut, or sound bridge over generic fade.

### F. Handoff

Read the relevant implementation skills only after the direction is stable:

- `bang-motion` for 2D motion, typography, camera grammar, and anti-slide checks;
- `3dviz-pro-max` and selected Three.js skills for 3D geometry, materials, camera, atmosphere, and validation;
- `remotion-best-practices` for timeline, audio, rendering, and delivery;
- `fable-threejs-art-director` when dispatching to Fable.

Send Fable a compact brief plus only the scene cards and asset records needed for the current phase. The handoff template is in `references/fable-handoff.md`. Do not ask Fable to invent the entire application and all scenes in one response.

### G. Review

Before implementation is considered ready, verify:

- the visual thesis is visible in the beat sequence;
- scenes add information beyond the narration without adding unsupported facts;
- no two adjacent beats repeat the same composition and motion without a reason;
- recurring objects remain recognizable;
- each transition has a cause;
- 2D/3D choices are justified;
- text is short and subordinate to the visual action;
- the hardest representative scene has a concrete render contract;
- the direction can be implemented in bounded Fable tasks.
