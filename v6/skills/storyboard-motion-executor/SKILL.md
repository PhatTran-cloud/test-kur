---
name: storyboard-motion-executor
description: Additive storyboard-to-motion execution bridge for cinematic-motion-director and cinematic-vfx-director. Use when a storyboard-v2/v2.2 packet, direction.beats, behaviors, camera_reveal, attention hierarchy, typed transition, canonical instance IDs, event intent, or persistent state must be executed without redesigning the storyboard. Preserves all existing Cinematic Motion Director and Cinematic VFX Director capabilities.
---

# Storyboard Motion Executor

This skill adds a **downstream execution contract**. It does not replace or weaken `cinematic-motion-director` or `cinematic-vfx-director`.

Use:
- `cinematic-motion-director` for object motion physics, camera choreography, secondary motion, transition execution and continuity;
- `cinematic-vfx-director` for event expansion, effect physics, environment/light/camera reaction, residue and VFX continuity;
- this bridge for preserving the storyboard's upstream direction while those skills execute it.

## Ownership boundary

### Storyboard owns WHAT / WHERE / WHY / WHEN
Preserve:
- canonical scene/shot/asset/instance/event IDs;
- geography and FG/MG/BG relationships;
- object identity and visibility/state requirements;
- story beat and viewer-information intent;
- attention hierarchy and focal target;
- camera information intent;
- camera keyframes/focus/reveal contract when provided;
- transition type/meaning and required invariant;
- narration/editorial anchor timing;
- persistent state/motif continuity;
- event intent and aftermath requirements.

### Motion owns HOW it moves
Motion may determine, within the storyboard contract:
- trajectories;
- velocity/acceleration/deceleration;
- easing and damping;
- mass/inertia/drag;
- pivot/hinge/anchor response;
- collision/contact response;
- deformation and secondary motion;
- camera interpolation and stabilization;
- focus-rack execution;
- parallax/motion-blur execution;
- transition mechanics;
- temporal implementation and seek-safe event evaluation.

### VFX owns HOW effects emerge
VFX may determine:
- emitters/layers/representation;
- source velocity inheritance;
- transport/interaction/decay;
- camera impulse response;
- temporary light/optical response;
- environment reaction;
- residue/aftermath;
- VFX state carried across cuts.

Neither Motion nor VFX may silently rewrite the storyboard's narrative direction.

Read `references/storyboard-motion-contract.md`.

## Canonical ID rule

Never replace precise upstream IDs with loose phrases such as "the leaf", "that character", or "background object" when IDs exist.

All ledgers and event bindings should use canonical IDs. Preserve them through:
`storyboard -> illustration asset -> motion assembly -> VFX -> inspection`.

## Per-object motion coverage remains mandatory

For every visible instance, assign a justified temporal state using the existing Cinematic Motion Director categories:
- active;
- reactive;
- passive/still;
- optical;
- camera-induced.

Stillness is valid when motivated. Generic looping is not.

Every active/reactive behavior must state:
`trigger -> response -> secondary response -> settle`.

Do not start every layer at the same frame.

## Attention Hierarchy Protection

Storyboard attention is an upstream constraint.

If the storyboard declares hero / secondary / ambient / suppressed or equivalent priority:
- motion amplitude;
- velocity contrast;
- VFX density;
- emissive intensity;
- camera emphasis;
- focus behavior;
- foreground crossings

must not accidentally promote a lower-priority element above the hero.

A technically impressive effect that steals the intended focal hierarchy is a failure.

Read `references/attention-and-camera-conformance.md`.

## Camera contract: intent upstream, execution downstream

Storyboard should answer:
- what is initially known/hidden;
- what becomes knowable;
- why this camera position/movement/hold serves that discovery;
- where attention should land;
- when the reveal occurs.

Motion then executes:
- interpolation;
- acceleration/damping;
- stabilization;
- parallax;
- lens/focus timing;
- operator/rig response;
- event-driven shake/buffeting.

### Camera Information Gate

Do not accept `camera.reason` that merely paraphrases subject action as sufficient direction.

The camera contract must explain the **information gain** or emotional/spatial reason for being there.

If that information intent is absent or contradictory, flag upstream ambiguity instead of inventing a new directorial concept.

Motion may improve the path without changing the intended discovery.

## Seek-safe absolute time

All animation/event state must be derivable from absolute time or deterministic state reconstruction.

Seeking to time T must not depend on having played frames 0..T in sequence.

Persistent state across shots must not reset because a new scene function starts.

## Transition execution

Storyboard owns transition meaning/type/invariant. Existing Cinematic Motion Director owns execution continuity.

Preserve relevant channels:
- position;
- movement vector;
- velocity;
- angular momentum;
- scale;
- depth/parallax;
- pose/action phase;
- focus;
- exposure/light;
- material/particle flow;
- sound;
- VFX density/residue.

Semantic and sound cuts do not require a fake shared object.

At cut boundaries, inspect both the last outgoing state and first incoming state.

## VFX Event Intent → Cinematic Event Expansion

When storyboard supplies an event intent such as:
- "rocket ignition overwhelms the environment";
- "robot landing feels extremely heavy";
- "explosion becomes the transition";
- "vehicle pass creates violent speed";

do not require storyboard to enumerate particles.

Invoke existing `cinematic-vfx-director`:
`event intent -> cause/source -> primary VFX -> secondary VFX -> world reaction -> object reaction -> camera/light/optical response -> aftermath -> transition state`.

Storyboard remains the authority for story purpose and attention hierarchy. VFX chooses the effect stack.

## Motion/VFX anti-fake-pass

In addition to existing quality gates, FAIL or flag when:
- canonical storyboard IDs are lost;
- an upstream hero is visually demoted by motion/VFX;
- camera execution changes the intended reveal;
- a transition resets persistent object/VFX state;
- motion invents a new scene concept instead of executing the board;
- an acted behavior lacks a cause;
- secondary motion ignores material/mass/constraint;
- camera shake is arbitrary noise rather than event response;
- endpoint state differs from the storyboard without explicit revision;
- final frames were not visually inspected.

Read `references/motion-conformance-review.md`.

## Handoff from Illustration

Mount illustration assets by:
- canonical asset ID;
- instance ID;
- named parts;
- pivots/anchors/sockets;
- dimensions/scale;
- variant/state;
- articulation constraints;
- texture/material resources.

Do not reverse-engineer a flattened scene plate. Do not ask Illustration to precompose the shot.

## Required output for substantial storyboard-driven motion

1. Upstream storyboard contract summary.
2. Canonical ID bindings.
3. Per-object Motion Ledger.
4. Camera information intent + execution plan.
5. Attention hierarchy protection plan.
6. Transition continuity plan.
7. VFX event expansions, if applicable.
8. Persistent state ledger.
9. Seek-safe timing/event plan.
10. Motion/VFX conformance review.
11. Observed endpoint/final-frame inspection.
