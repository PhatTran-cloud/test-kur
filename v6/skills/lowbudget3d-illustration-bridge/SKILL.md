---
name: lowbudget3d-illustration-bridge
description: Additive downstream illustration bridge for lowbudget3d. Use when a storyboard, asset brief, illustration stage, or production packet defines scene/object identity, fabrication parts, variants, anchors, surface regions, texture plans, closest-camera use, or research constraints and the task is to fabricate separate editable 2.5D/3D assets without redesigning the scene. Preserves the complete lowbudget3d and 3dviz-pro-max systems unchanged.
---

# lowbudget3d Illustration Bridge

This skill is an **additive production bridge**. It does not replace, fork, reduce, or rewrite `lowbudget3d` or `3dviz-pro-max`.

Before using this bridge:
1. load the complete `lowbudget3d` skill;
2. verify the complete canonical `3dviz-pro-max` skill is available;
3. preserve every existing lowbudget3d/3dviz capability and anti-fake-pass rule;
4. treat the upstream storyboard packet as the authority for scene meaning and asset usage.

## Ownership boundary

### Storyboard owns
- visual thesis, story beat, scene/world meaning;
- canonical scene/shot/asset/instance IDs;
- object identity and diagnostic recognition traits;
- FG/MG/BG placement and geographic relationships;
- variant/state requirements;
- named parts, anchors, attachment semantics and closest-camera usage;
- dimensional intent (2.5D/3D/hybrid) when specified;
- research findings, uncertainty and stylization boundaries;
- asset usage, focal priority and downstream motion requirements.

### Illustration owns
- fabrication of each requested asset as separate editable modules;
- geometry/vector construction;
- authored texture resources and material response;
- part separation, pivots, anchors and articulation implementation;
- variants and state appearances;
- silhouette, construction, surface and light-response craft;
- asset-level inspection and pixel review.

### Motion owns later
- final whole-shot assembly;
- camera execution;
- scene lighting execution and animated light changes;
- animation, transitions, VFX and temporal continuity.

Do not silently steal responsibilities across these boundaries.

## Mandatory input contract

Before fabrication, resolve or explicitly mark unresolved:
- `asset_id`;
- canonical identity / real-world referent when applicable;
- recognition traits and forbidden confusions;
- dimensions / declared scale;
- parts and controllable subparts;
- anchors / sockets / attachment surfaces;
- variants and state changes;
- surface regions;
- texture plan per part and per state;
- 2.5D / 3D / hybrid route;
- closest intended camera use;
- storyboard instance usage;
- research dossier and uncertainty;
- art-direction constraints.

Read `references/storyboard-illustration-contract.md`.

If a design-critical field is missing or contradictory, flag the storyboard ambiguity. Do not invent a new scene or silently reinterpret the asset.

## Fabrication rule: separate assets, never a flattened shot

The production unit is the asset/module, not a finished frame plate.

Deliver editable source and independently addressable geometry/vector/texture resources. Preserve canonical part names and anchors so Motion can mount and animate them.

Never use a rough storyboard panel as a production texture. Never collapse foreground, hero object, background and lighting into one flattened bitmap to bypass spatial construction.

## Representation routing

Use existing lowbudget3d routing without removing anything:
- organic hero/humanoid/animal/creature -> domain specialist + fidelity QA;
- body-related prop/equipment -> attachment specialist;
- complex authored geometry -> approved offline-authoring handoff -> GLTF/GLB -> Three.js inspection;
- 2.5D -> authored painted surfaces mounted in real depth with proper contact and parallax;
- 3D -> custom geometry/skinning/morphs/materials as required;
- GPU specialization only when justified by workload.

Bare primitives are construction scaffolds, not finished illustration when the storyboard calls for authored visual fidelity.

## Recognition before decoration

A visually polished asset that is the wrong thing is a failure.

For every fidelity-sensitive asset:
1. prove silhouette/identity first;
2. prove proportions/construction;
3. prove part boundaries and attachment logic;
4. prove surface/material behavior;
5. only then tune accents and polish.

Examples:
- a leaf must preserve its intended outline, petiole insertion, venation logic and upper/lower surface identity;
- an astronaut must remain a valid humanoid under suit layers;
- an animal must preserve species-defining morphology;
- a device must preserve its actual assemblies and declared simplifications.

## Storyboard Conformance Gate

Run this gate in addition to all existing lowbudget3d anti-fake-pass gates.

FAIL if the fabricated asset:
- changes canonical identity without an explicit storyboard revision;
- drops a required part, anchor, articulation or variant;
- contradicts declared scale or attachment;
- misses recognition traits needed at the closest intended camera;
- uses a texture/material treatment incompatible with the research or state;
- bakes scene composition/camera into an asset plate;
- silently resolves storyboard uncertainty as fact;
- looks attractive but cannot execute the storyboard usage.

Read `references/storyboard-conformance.md`.

## Asset inspection

For each materially distinct asset family, inspect:
- silhouette;
- front/profile/three-quarter/back when morphology requires it;
- oblique view for true 3D;
- closest-use crop;
- construction/part view;
- grazing-light or material-response view when surface craft matters;
- articulation/anchor test when Motion depends on it.

Reuse the existing lowbudget3d anti-fake-pass philosophy: structural presence is not visual proof.

## Handoff to Motion

Return:
- canonical asset ID;
- editable source path/module;
- geometry/vector outputs;
- texture resources and mappings;
- named parts;
- pivots/anchors/sockets;
- variants;
- dimensions/scale;
- articulation constraints;
- closest-use inspection views;
- research/stylization limitations;
- storyboard conformance status;
- residual visual weaknesses.

Motion must be able to mount the asset by canonical IDs and anchors without reverse-engineering the illustration.

## Required output for substantial illustration fabrication

1. Upstream storyboard contract consumed.
2. Base lowbudget3d / complete 3dviz-pro-max route.
3. Representation and fabrication plan.
4. Part/anchor/variant/surface contract.
5. Texture/material plan.
6. Asset inspection plan.
7. Storyboard Conformance Gate result.
8. Existing lowbudget3d anti-fake-pass result.
9. Motion handoff.
