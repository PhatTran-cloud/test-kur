---
name: lowbudget3d
description: Add high-fidelity human, animal, prop, modern Three.js, optional GPU, cinematic motion, and anti-fake-pass capabilities on top of the complete 3dviz-pro-max skill without replacing, removing, renaming, or weakening any 3dviz-pro-max behavior. Use for Three.js 3D scenes, characters, astronauts, animals, creatures, equipment, interactive scenes, visual QA, and any task where 3dviz-pro-max should remain the canonical core but needs stronger domain fidelity or validation.
---

# lowbudget3d

`lowbudget3d` is an **additive fidelity overlay**. The complete `3dviz-pro-max` skill remains the canonical core and has priority for its existing workflow, catalogs, recipes, templates, kits, scripts, evidence model, scene construction, camera, lighting, materials, interaction, and final Three.js rendering.

## Non-negotiable preservation contract

Before doing any 3D task, verify that the complete `3dviz-pro-max` skill is available. Load and follow its canonical entrypoint and relevant accompanying files. Never emulate a reduced version from memory.

Hard rules:

1. **Do not replace 3dviz-pro-max.**
2. **Do not delete, summarize away, rename, or bypass any existing 3dviz-pro-max capability.**
3. **Do not copy only its SKILL.md and pretend the complete skill is present.** Its accompanying data, references, templates, kits, and scripts matter.
4. **When this overlay and 3dviz-pro-max overlap, preserve the base behavior unless this skill adds a stricter validation gate or a clearly scoped specialist capability.**
5. **Three.js remains the final renderer.** Offline authoring may create geometry or assets, but the delivered interactive scene is still rendered in Three.js unless the user explicitly asks otherwise.
6. If the full base skill is unavailable, say so. Do not claim equivalent coverage.

Read `references/preservation-and-ownership.md` before changing an existing 3dviz project.

## Operating model

Run the normal 3dviz-pro-max workflow first. Activate this overlay only when one or more gaps appear:

- human, astronaut, avatar, anatomy, pose, clothing, face, hands;
- animal, quadruped, creature, rider/mount relation;
- equipment, worn or held props, harnesses, saddles, cables, tools;
- imported GLB/GLTF/VRM or skinned/morph-target characters;
- modern Three.js API/runtime questions;
- GPU-heavy material, particles, compute, deformation, or simulation;
- cinematic multi-object motion or scene transitions;
- visual fidelity is important enough that a technical screenshot cannot count as PASS.

Do not activate every specialist at once. Use the capability router in `references/task-routing.md`.

## Core principle: model the right thing, not the cheapest primitive

Primitive procedural geometry is excellent for many 3dviz subjects. It is often the wrong representation for realistic humans, recognizable animals, hands, faces, clothing folds, or complex worn equipment.

For fidelity-sensitive organic subjects, prefer this order:

1. suitable authored/skinned/morphable asset already available to the project;
2. compatible GLTF/GLB/VRM asset that can be loaded and verified in Three.js;
3. an existing base mesh adapted through morph targets, rig, material, clothing, and accessories;
4. procedural geometry only when the chosen style intentionally supports it.

Never build a realistic astronaut as cylinders attached to a sphere merely because primitives are easy. Build a valid humanoid first, then layer suit, helmet, gloves, boots, backpack, hoses, tools, and attachments around the same skeletal landmarks.

## Humanoid workflow

When a human or human-derived subject is visible, read `references/humanoid-system.md`.

Required sequence:

1. classify target fidelity: graphic/stylized, game-ready, realistic silhouette, close-up hero;
2. establish scale, sex/age presentation if relevant to the brief, body type, height and limb proportions;
3. use a coherent humanoid skeleton and skinning strategy;
4. validate shoulder, clavicle, elbow, wrist, pelvis, hip, knee, ankle and foot placement;
5. treat hands, head and face as high-risk regions, not decorative afterthoughts;
6. apply pose with range-of-motion awareness and grounded contact;
7. add clothing/equipment as layers driven by the same body and skeleton;
8. inspect from front, profile, three-quarter, back and intended hero camera;
9. fail the scene if anatomy or silhouette is visibly wrong even when runtime tests pass.

## Animal and creature workflow

When an animal or creature is visible, read `references/animal-system.md`.

Do not use a generic four-legged template as proof of species fidelity. Identify the morphological family and species-defining traits: spine profile, ribcage/pelvis relationship, scapular motion, limb segment lengths, stance, paw/hoof structure, neck/head ratio, tail root, gait, and surface character.

For fictional creatures, establish the real biological analogue first, then document deliberate deviations.

## Human-/animal-related objects

Read `references/attachment-and-props.md` for objects that depend on bodies.

Examples include:

- helmet, glasses, mask, backpack, oxygen tank, armor;
- glove, boot, tool, weapon-like fictional prop, camera, instrument;
- saddle, bridle, reins, collar, leash, harness;
- bicycle, seat, cockpit, vehicle controls;
- cables, hoses, straps, cloth and other secondary attachments.

Every attachment must declare its owner object, socket or contact surface, local transform, collision/clearance expectations, and motion inheritance.

## Modern Three.js enhancement

Read `references/modern-three-runtime.md` when implementing or reviewing runtime code.

The goal is **modern, stable Three.js**, not a renderer rewrite for its own sake.

- keep one scene ownership model;
- keep one animation/update loop owner;
- use current loader and color-management patterns appropriate to the installed Three.js version;
- prefer GLTF/GLB for complex authored assets;
- use SkinnedMesh, skeletons and morph targets where the subject requires them;
- centralize resource disposal;
- separate authoritative simulation state from visual interpolation;
- verify the actual runtime and console.

Do not force WebGPU because it is fashionable. Use it only when the task benefits materially.

## Optional GPU acceleration

Read `references/gpu-routing.md` only when the workload justifies it: large particle systems, many repeated procedural effects, compute-heavy deformation, crowd/flocking state, advanced node materials, heavy postprocessing, or a measured bottleneck.

Rules:

- GPU specialization is optional;
- do not invalidate a working 3dviz renderer path merely to move it to WebGPU;
- maintain a clear fallback or explicit compatibility statement;
- benchmark the bottleneck rather than guessing;
- visual correctness remains more important than a lower frame time for a wrong scene.

## Offline procedural authoring

Offline authoring is permitted only as a construction route. It must never become a second final renderer competing with Three.js.

Use procedural authoring when it produces geometry that is materially better than direct Three.js construction: high-detail hero meshes, repeated topology, complex bevel/opening patterns, or reusable geometry generation.

The handoff contract is:

`author -> evaluate/realize -> export GLTF/GLB -> load in Three.js -> inspect final runtime`

The proof is the Three.js result, not the authoring viewport.

## Cinematic motion

For animated scenes, read `references/cinematic-motion.md`.

Every visible object receives a justified temporal state: active, reactive, passive, optical, or camera-induced. Motion follows object material, mass, constraints and narrative role. Secondary effects inherit causality rather than starting together.

At scene boundaries, transfer motion energy through velocity, angular momentum, screen position, scale, depth, light, focus, material flow, pose/action, or sound. Do not reset motion arbitrarily at a cut.

## Anti-fake-pass protocol

Read `references/anti-fake-pass.md`. This protocol overrides any weaker interpretation of PASS.

A successful browser render, existing PNG, nonzero object count, valid hash, clean console, or acceptable frame rate **does not prove visual fidelity**.

Use independent gates:

- Technical runtime
- Geometry integrity
- Domain fidelity
- Composition/readability
- Motion/physics, when applicable
- Performance, when applicable
- Evidence integrity

`FINAL PASS` is allowed only when every mandatory gate is supported by direct evidence. Unknown is not PASS. Missing inspection is not PASS. A self-authored assertion is not evidence.

For humanoids and animals, domain fidelity is mandatory whenever resemblance matters.

The helper `scripts/validate-pass.py` can validate the final gate report mechanically; it intentionally cannot judge the image itself.

## Conflict policy

Use this ownership priority:

1. complete 3dviz-pro-max core for its existing responsibilities;
2. specialist domain layer for capabilities the base does not model deeply enough;
3. runtime modernization only for implementation details that do not alter artistic ownership;
4. GPU path only when explicitly routed;
5. fallback technical reference only when a concrete knowledge gap remains.

No specialist may create a competing renderer, camera authority, scene root, animation loop, lighting director, or final PASS definition.

## Required output for substantial builds

Unless the user asks for a shorter response, include:

1. **Base route** — which 3dviz-pro-max direction/recipe/kit/custom route is used.
2. **Specialist activation** — only the added modules needed and why.
3. **Representation plan** — primitives vs authored/skinned/morphable assets and rationale.
4. **Scene ownership** — renderer, camera, scene root, update loop, asset owners.
5. **Domain contracts** — human/animal/attachment requirements where applicable.
6. **Motion plan** — if animated.
7. **Validation plan** — required views and mandatory gates before PASS.
8. **Observed result** — separate what was built from what was actually verified.

## Required behavior when revising existing 3dviz work

Do not rewrite the project wholesale. Diagnose the smallest real gap, preserve working 3dviz behavior, and add the specialist capability at the boundary where it belongs.

Examples:

- bad astronaut -> replace/repair humanoid representation, do not replace scene lighting/camera without reason;
- ugly animal -> repair species morphology or use a better skinned asset, do not rewrite unrelated terrain;
- fake pass -> strengthen validation and recapture, do not claim success from existing screenshots;
- slow particle scene -> measure and route the particle workload to GPU, do not migrate the whole project by default.
