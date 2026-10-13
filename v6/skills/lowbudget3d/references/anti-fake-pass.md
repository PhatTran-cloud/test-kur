# Anti-fake-pass protocol

## Principle

Evidence of execution is not evidence of visual correctness.

The following are never sufficient by themselves:

- browser opened;
- scene rendered;
- screenshot exists;
- file hash matches;
- no JavaScript errors;
- object count is nonzero;
- animation loop advances;
- frame rate is acceptable.

## Independent gates

### 1. Technical runtime

Asset loads, no blocking console errors, expected views/actions work, update loop advances.

### 2. Geometry integrity

No catastrophic clipping, missing parts, inverted/obvious broken surfaces, invalid attachment, floating contact or unintended intersections visible at delivery scale.

### 3. Domain fidelity

The subject actually resembles the requested class and important traits. Humans require anatomy/pose checks; animals require species morphology; equipment requires correct attachment and proportion.

### 4. Composition/readability

The intended subject is readable at the intended camera, scale, contrast, depth and lighting.

### 5. Motion/physics

Required only when animated. Motion has plausible cause, trajectory, timing, contact and continuity.

### 6. Performance

Required when the user has a performance target or the scene is interactive enough that performance affects usability.

### 7. Evidence integrity

The evidence inspected corresponds to the current build, current state, requested view and requested behavior.

## Final state

Allowed values:

- PASS — direct evidence supports every mandatory gate;
- FAIL — at least one mandatory gate is contradicted;
- UNVERIFIED — evidence was not obtained;
- PARTIAL — some gates pass but final acceptance is impossible.

Never convert UNVERIFIED or PARTIAL into PASS.

## Human/animal minimum view set

When resemblance matters, inspect at least front, profile, three-quarter, back, plus the intended hero view. A single beauty shot can hide severe errors.
