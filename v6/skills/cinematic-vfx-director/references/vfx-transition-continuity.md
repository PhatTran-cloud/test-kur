# VFX Transition Continuity

## VFX can bridge a cut

For A -> B, capture the outgoing VFX state:

- source/owner;
- dominant flow vector;
- mean velocity and acceleration phase;
- density/coverage;
- particle size regime;
- turbulence scale;
- color/emission/exposure;
- opacity/occlusion;
- depth distribution;
- streak/trail orientation;
- residue state;
- camera-relative velocity;
- sound transient or sustained effect when available.

The incoming scene should inherit or deliberately transform the channels used for the bridge.

## Good bridges

### Smoke / dust wipe

Let density naturally grow until it covers enough of the frame. Cut while occluded. Enter B with compatible density, flow direction and camera-relative movement, then reveal.

### Flash / exposure bridge

Carry brightness, color temperature and exposure recovery through the cut. Do not cut from a blown-out frame to a perfectly exposed static frame with no recovery unless the rupture is intentional.

### Spark / streak bridge

Preserve dominant streak vector and screen-space direction. B should already contain compatible movement before streak detail resolves.

### Weather bridge

Rain, snow, ash or airborne dust can bind locations or time. Preserve wind direction, density and near/far speed logic unless the environmental change itself is the story point.

### Fluid / spray bridge

Carry flow direction, silhouette or droplets across the edit. Match scale and velocity so the cut does not read as unrelated particle stock footage.

### Volumetric passage

Move through fog, smoke, steam, darkness or dense particulate. The effect becomes both spatial occluder and transition medium. Camera momentum remains authoritative.

## Boundary anti-reset rules

Unless intentionally discontinuous:

- no particle system resets to age zero at the visible cut;
- no smoke plume snaps to a different wind direction;
- no debris freezes or disappears mid-flight;
- no emissive effect loses its light contribution one frame before the source disappears;
- no residue vanishes between adjacent shots of the same location/time;
- no rain/snow density jump without weather/time motivation;
- no volumetric density discontinuity that exposes the cut.
