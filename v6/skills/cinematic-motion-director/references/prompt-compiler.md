# Prompt Compiler

The internal motion plan may be detailed. The generation prompt should be concise enough for the target model to follow.

## Generic image-to-video prompt order

1. Hero subject action.
2. Secondary object reactions.
3. Environmental motion.
4. Camera motion.
5. Motion style/timing/direction.
6. Continuity requirement for the end of the shot.

Example skeleton:

`[hero] performs [specific physical action] along [direction/path] with [speed profile]. [secondary elements] react with [lag/follow-through]. [environment] responds with [specific motion]. The camera [rig + path + tracking relationship], preserving [parallax/focus behavior]. The shot remains continuous and ends with [outgoing vector/occlusion/focus/light state] for the next transition.`

## Generic text-to-video prompt order

1. Essential scene/subject description.
2. Hero motion.
3. Secondary/environment motion.
4. Camera and lens/depth behavior.
5. Temporal rhythm.
6. End-frame transition anchor.

## Multi-object prompting

When multiple objects need distinct motion, identify them simply by stable visual role or location:

- foreground red vehicle;
- subject on the left;
- hanging lamp above the table;
- distant trees;
- reflective glass wall.

Do not repeatedly redescribe appearance if the input image already establishes it. Separate motions into short sentences when needed.

## Complexity control

If the prompt contains more than one major transformation, multiple unrelated camera changes, or several story beats, split into separate shots. A premium result is usually one coherent camera idea plus a coordinated object-motion system, not a paragraph of simultaneous tricks.

## Positive physical phrasing

Prefer describing the desired state:

- `locked camera with movement only in the subject and environment`
- `continuous seamless shot`
- `the cloth trails behind the turn, then settles`
- `the camera maintains the same clockwise arc into the end frame`

rather than long lists of prohibitions. Keep internal negative constraints in the audit; compile them into positive directions when possible.

## End-frame contract

Every generated shot intended for editing should specify an end-frame contract such as:

- foreground object crosses frame right-to-left and fills 80% of frame;
- camera finishes in fast clockwise pan blur;
- subject ends screen-right at medium scale, still moving right;
- exposure rises into a white practical light;
- focus falls fully out before cut;
- smoke flows upward-right and occupies the frame.

Shot B should begin from a compatible contract.

## Implementation spec mode

When outputting for animation/code instead of generative video, include:

- normalized time or frames for each phase;
- transform hierarchy and parent relationships;
- world-space path and screen-space intent;
- velocity/easing profile;
- pivot/anchor;
- constraints/collisions;
- secondary simulations;
- camera path/focus;
- transition overlap or cut frame.
