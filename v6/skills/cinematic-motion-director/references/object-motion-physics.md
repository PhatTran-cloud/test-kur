# Object Motion Physics

## The Motion Ledger

Create one row per visible object or coherent object group.

| Field | Meaning |
| --- | --- |
| ID | Stable name used across shots |
| Narrative role | hero / support / environment / transition anchor |
| Material | rigid, elastic, cloth, hair, fluid, smoke, particles, glass, foliage, light-emitting, etc. |
| Effective mass | very light / light / medium / heavy / massive |
| Attachment | free, grounded, hinged, suspended, parented, carried, constrained |
| Driver | self-propelled, gravity, impact, motor, wind, fluid pressure, character contact, camera-induced only |
| Degrees of freedom | translation/rotation axes that are physically allowed |
| Path family | linear, arc, ballistic, orbital, pendulum, spline, constrained rail, turbulent, Brownian-like micro-motion |
| Speed profile | constant, accelerate, decelerate, ease, impulse, spring, oscillatory, terminal-velocity approach |
| Inertia | resistance to speed/direction change |
| Drag/damping | how quickly motion loses energy |
| Pivot/anchor | physical center/hinge/contact point |
| Secondary motion | lag, overshoot, bend, wobble, flutter, slosh, ripple, debris |
| Collision/contact | slide, bounce, stick, deform, break, transfer force |
| Optical response | highlight/reflection/shadow/focus changes |
| Camera response | relative screen motion/parallax/scale |
| Continuity anchor | what must survive into the next shot |

## Trajectory rules

### Rigid grounded objects

Stay fixed unless a believable force exceeds friction or a support moves. Camera motion creates parallax but not world-space drift. If impacted, translate/rotate around the contact and center of mass; heavy objects respond more slowly and settle with low-frequency motion.

### Hinged objects

Rotate around the hinge. Never translate the free end independently as if detached. Doors, lids, pendulums, crane arms, and mechanical panels must preserve their pivot.

### Suspended objects

Use pendulum-like arcs, delayed response, and damping. Cables and hanging lights inherit support motion with a lag; they do not instantly match the support's velocity.

### Vehicles and machines

Respect steering, wheel contact, suspension, tracks, joint constraints, and engine/actuator behavior. Body roll, pitch, vibration, and suspension travel should follow acceleration and terrain.

### Characters

The center of mass leads or follows depending on action. Feet plant before weight transfer. Head, torso, arms, clothing, hair, accessories, and gaze may have different timing. Avoid simultaneous robotic starts.

### Cloth and hair

They are driven by attachment points, body acceleration, gravity, and airflow. They lag, overshoot, form waves, and settle. High stiffness reduces amplitude and delay; soft fabric increases both.

### Fluids

Preserve continuity of flow and gravity. Use slosh, surface lag, waves, adhesion, splashes, and vortices. Fluids do not hold rigid silhouettes unless stylized intentionally.

### Smoke, fog, dust

Treat as volumes influenced by airflow, buoyancy, turbulence, and source motion. Dust displaced by a moving subject should trail with a delay and disperse; smoke should not move as a solid card.

### Particles and debris

Use emission origin, initial velocity, gravity, drag, collision, and size-dependent response. Small particles decelerate faster in air and may remain suspended longer.

### Glass, polished metal, wet surfaces

Even when geometry is static, reflections and highlights must respond correctly to camera/object/light movement. A moving camera should not leave specular reflections frozen to screen space.

### Foliage

Branches move at lower frequency; leaves respond at higher frequency with smaller mass and more air sensitivity. Use layered phase offsets rather than one synchronized sway.

### Lights, screens, emissive objects

World-space position may be fixed while luminance, flicker, scan, reflected light, shadow, and volumetric response create temporal behavior. Flicker must fit the source type; avoid random nightclub pulsing unless motivated.

## Force-to-motion checklist

For any noticeable motion, answer:

1. What caused it?
2. Where is force applied?
3. Around what point does it rotate?
4. How quickly can this material accelerate?
5. What continues moving after the main action stops?
6. What environmental elements react?
7. What screen-space motion is caused by the camera rather than the object?

If these answers are missing, simplify or revise the motion.

## Motion coverage without fake movement

When the user requires every object to move, distribute temporal behavior intelligently:

- hero objects: transform in world space;
- secondary rigid objects: subtle vibration, contact reaction, mechanical response, or camera parallax;
- static architecture: parallax, light/shadow travel, reflection changes, foreground occlusion;
- distant background: atmospheric drift and slower parallax;
- tiny details: bounded micro-motion rather than obvious loops.

This keeps the image alive without making the world look weightless.
