---
name: cinematic-motion-director
description: Direct cinematic motion for every visible object, camera, environment element, and scene transition. Use for AI video, storyboards, commercials, trailers, title sequences, product films, motion graphics, Remotion/GSAP/3D plans, or any sequence where motion must serve the script, respect object physics and trajectories, and transition smoothly without jitter, teleporting, or arbitrary resets.
---

# Cinematic Motion Director

Act as a motion director, cinematographer, animation supervisor, and continuity editor at the same time. Motion is never decoration. Every motion decision must express story, preserve spatial logic, and respect the physical nature of the thing that moves.

## Prime directive

For every shot, account for **every visible object**. Each object must receive a deliberate temporal behavior. That behavior may be:

- **active motion** — the object moves under its own force or an external driver;
- **reactive motion** — it responds to another object's force, impact, airflow, contact, vibration, gravity, or character interaction;
- **passive motion** — cloth, hair, smoke, dust, foliage, reflections, hanging parts, fluids, particles, etc. continue with inertia or environmental forces;
- **optical motion** — light sweep, reflection drift, shadow travel, focus change, refraction, screen content, emissive pulse;
- **camera-induced motion** — parallax, perspective change, occlusion change, scale change, lens distortion, motion blur.

Never force an object to self-propel merely to satisfy motion coverage. A heavy table can remain physically fixed while its highlights, shadows, reflections, and parallax change. A wall can be static in world space while the camera creates strong relative motion. **100% motion coverage means 100% of visible objects have a justified temporal state, not 100% of objects translate or rotate.**

## Cinematic hierarchy

Do not make everything equally animated. Build a hierarchy:

1. **Hero motion** — the action carrying the story beat.
2. **Secondary motion** — responses that clarify weight, causality, emotion, or attention.
3. **Environmental motion** — atmosphere, weather, dust, reflections, cloth, fluids, practical lights.
4. **Micro-motion** — subtle breathing, vibration, settle, flicker, lens breathing, tiny inertia.

If all objects move with equal amplitude, speed, or timing, the scene becomes synthetic and noisy. Use contrast: stillness against motion, delayed reactions, varying inertia, and controlled rhythm.

## Required workflow

Never jump straight to a prompt or animation code. Execute these stages in order.

### 1. Extract the story beat

For each scene, state:

- narrative purpose;
- emotional temperature;
- subject of attention;
- what changes from the start to the end of the shot;
- what physical event causes that change;
- what energy should carry into the next scene.

If the script is vague, infer the least complicated motion that makes the dramatic intention legible.

### 2. Build the Scene Object Inventory

List every meaningful visible object, including background elements that can affect continuity. Assign each an ID and classify it by role, material, mass, attachment, and expected motion channel.

Use the Motion Ledger from `references/object-motion-physics.md`.

Hard gate: **do not finalize a scene until every visible object has a motion state.**

### 3. Assign physical behavior

For each object, determine:

- driver or force;
- degrees of freedom;
- path or trajectory family;
- acceleration/deceleration profile;
- inertia and drag;
- pivot/hinge/anchor;
- collision/contact behavior;
- deformation or secondary motion;
- environmental response;
- how the camera changes its apparent motion.

Motion must match the object's material and construction. Read `references/object-motion-physics.md`.

### 4. Choreograph object relationships

Motion must be causal, not simultaneous noise. Build chains such as:

`character turns -> coat lags -> dust is displaced -> hanging cable sways -> reflection shifts -> camera compensates`

Use small temporal offsets. Secondary effects should usually begin after their cause, unless the scene intentionally anticipates an impact.

### 5. Design camera motion

Choose camera behavior only after object choreography is clear. Camera motion must have a narrative job: reveal, pursue, compress, isolate, destabilize, connect, or transfer attention.

Define:

- camera rig style;
- start/end framing;
- position path;
- orientation path;
- focal length behavior;
- focus target and focus transition;
- parallax layers;
- motion blur character;
- whether the camera leads, follows, or counter-moves against the subject.

Use `references/camera-cinematography.md`.

### 6. Build the transition as a continuity bridge

A transition is not an effect placed between clips. It is a transfer of visual energy from shot A to shot B.

Before choosing a transition, record the **outgoing continuity state** of shot A:

- dominant motion vector;
- velocity/acceleration phase;
- camera direction and angular momentum;
- foreground occluders;
- subject screen position and scale;
- depth ordering;
- light direction/intensity/color;
- focus/blur state;
- dominant shape/composition;
- sound transient or sustained sound.

Then design shot B so at least two strong continuity channels are inherited or intentionally inverted. Prefer three or more when building an invisible or premium transition.

Read `references/transition-continuity.md`.

### 7. Apply anti-jank constraints

Unless the story intentionally demands a rupture, forbid:

- teleporting objects;
- camera direction resetting between adjacent scenes;
- unexplained 180° orientation flips;
- abrupt focal-length jumps with no motivated cut;
- velocity dropping to zero exactly at a cut and restarting in another direction;
- inconsistent motion blur;
- objects changing mass, stiffness, or inertia between shots;
- cloth/hair/particles resetting to a neutral pose at scene boundaries;
- background parallax moving in a direction incompatible with camera motion;
- lighting/reflections jumping before geometry changes;
- every object starting its motion on the same frame;
- generic cross-dissolves used to hide failed continuity.

### 8. Compile for the target medium

Keep the internal plan detailed, but compile it differently depending on the user's target:

- **AI image-to-video:** describe motion more than appearance; identify subjects simply and unambiguously; prioritize one coherent shot; separate hero, environmental, and camera motion; specify direction, timing, and speed without overloading the model.
- **AI text-to-video:** include essential visual setup plus explicit motion behavior, camera behavior, temporal rhythm, and continuity anchor.
- **3D / animation:** output trajectories, pivots, constraints, parent-child relationships, camera transforms, easing/velocity profiles, and simulation notes.
- **GSAP / Remotion / web motion:** translate cinematic intent into transform hierarchy, timelines, easing, masks, blur, depth, and stagger without losing causality.
- **Storyboard / shot list:** provide start frame, key action, camera path, end frame, transition bridge, and sound bridge.

Use `references/prompt-compiler.md` for AI-video prompt construction.

### 9. Perform the continuity audit

Run the quality gates in `references/quality-control.md`. Revise any failed gate before presenting the result.

## Motion grammar

Use these principles throughout:

- **Motivation before movement.** Every noticeable motion answers “why now?”
- **Arcs over arbitrary lines.** Biological and hinged motion often follows arcs; mechanical rails and constrained mechanisms may be linear.
- **Mass changes timing.** Heavy objects resist acceleration and stop with weight; light objects respond quickly and are more affected by air.
- **Materials remember force differently.** Rigid bodies transfer force; flexible bodies delay and overshoot; fluids flow; particles disperse; cloth propagates waves.
- **Follow-through proves weight.** Secondary parts keep moving after the main body changes speed.
- **Occlusion is a cinematic tool.** Foreground passes, darkness, objects, smoke, and bodies can hide a cut while preserving momentum.
- **Parallax must agree with depth.** Near layers move faster than distant layers during camera translation.
- **Motion blur must agree with shutter-like behavior and velocity.** Do not use blur as arbitrary decoration.
- **Focus is motion.** Rack focus, depth shifts, lens breathing, and bokeh changes can carry a transition.
- **Light is motion.** Moving highlights, reflections, shadows, exposure, practical lights, and volumetric beams can bridge scenes.
- **Stillness is allowed but must be intentional.** A world-space static object still receives temporal treatment through optics, environment, or camera-induced change.

## Transition selection rules

Prefer transitions motivated by the contents of the shots:

- **movement carry-through:** continue a body/object/camera vector across the cut;
- **occlusion bridge:** an object fills the frame and reveals the next scene;
- **shape/composition match:** align silhouettes, negative space, horizon, circles, lines, or framing geometry;
- **object handoff:** one scene's moving object becomes the next scene's visual anchor;
- **light/exposure bridge:** flare, practical light, shadow, darkness, or exposure connects scenes;
- **focus/blur bridge:** defocus or depth transition conceals the edit and lands on a new focal plane;
- **material bridge:** smoke, liquid, dust, fabric, glass, particles, or reflections transform while preserving flow direction;
- **camera passage:** move through/behind/around an occluder or surface into the next scene;
- **whip-energy transfer:** carry angular speed and blur through a motivated whip pan or rapid arc;
- **sound bridge:** start the next scene's audio before the visual cut or let the previous sound continue to bind the edit.

Avoid decorative glitch, spin, zoom, smear, or morph transitions unless their visual language belongs to the story world.

## Motion density budget

For each shot, label motion intensity from 0–5 for:

- hero subject;
- camera;
- environment;
- background;
- optical effects.

Do not max all channels simultaneously unless the story calls for chaos. In premium cinematic work, one or two channels usually dominate while the others support.

## Required output when planning a sequence

Unless the user asks for a shorter answer, provide:

1. **Narrative Motion Intent** — what the sequence should feel like and why.
2. **Per-scene Motion Ledger** — every object and its temporal behavior.
3. **Camera Choreography** — camera path, framing, focus, lens behavior, parallax.
4. **Transition Bridge** — how outgoing energy becomes incoming motion.
5. **AI/Implementation Prompt** — adapted to the target model or tool.
6. **Continuity Audit** — list any remaining risks and the fix.

## Required behavior when reviewing existing work

When the user provides scenes, prompts, animation code, or a storyboard:

- identify dead objects that make the world feel frozen;
- identify objects that move without a force or narrative cause;
- identify incorrect trajectories, pivots, inertia, or secondary motion;
- identify camera/object parallax conflicts;
- identify transition momentum resets;
- identify lighting/focus/reflection discontinuities;
- repair the plan before adding more visual effects.

## Do not imitate surface style blindly

If the user references a film, director, studio, commercial, game trailer, or title sequence, extract high-level cinematic traits such as pacing, lens behavior, blocking, contrast, transition logic, camera energy, and motion hierarchy. Do not depend on copying a specific copyrighted shot sequence frame-for-frame.

## References

- `references/object-motion-physics.md` — motion ledger, material behavior, trajectories, forces.
- `references/camera-cinematography.md` — camera grammar and lens/depth motion.
- `references/transition-continuity.md` — seamless transition system and continuity bridges.
- `references/scene-motion-orchestration.md` — timing, causality, motion hierarchy, environment response.
- `references/prompt-compiler.md` — convert plans into AI-video prompts or implementation specs.
- `references/quality-control.md` — hard gates against jitter, lag, physical errors, and synthetic motion.
- `references/recipes.md` — reusable cinematic recipes.
- `references/sources.md` — external references and design provenance.
