# VFX Direction System

## VFX ledger

For every significant effect, record:

| Field | Question |
|---|---|
| cause | What event creates the effect? |
| source | Which object/surface/volume owns it? |
| trigger | What exact condition starts it? |
| anchor | Where is the source in local/world space? |
| emission | What shape, direction and spread are used? |
| source velocity | What motion must the emitted material inherit? |
| forces | Gravity, drag, buoyancy, wind, turbulence, vortex, attraction, collision? |
| lifetime | How long does each layer persist? |
| material | Smoke, dust, liquid, solid debris, plasma-like energy, light, optical artifact? |
| interaction | What can collide, occlude, illuminate, wet, scorch, deposit, or displace? |
| residue | What remains after the visible peak? |
| camera relation | Near-lens, midground, background, crossing frame, obscuring subject? |
| transition state | What survives at the cut? |

## Cause chains

Build effects as causal chains rather than simultaneous toggles.

Examples:

`impact -> deformation/contact -> flash -> fragments -> dust -> bounce -> settling`

`heat source -> buoyant plume -> turbulence -> smoke expansion -> soot/residue`

`vehicle acceleration -> tire slip -> dust/smoke -> wake -> trailing residue`

`water impact -> crown/sheet -> droplets -> mist -> ripples -> wet surface`

## Layer separation

Each effect layer should differ in at least two of:

- lifetime;
- velocity;
- size;
- density;
- blend/material response;
- force sensitivity;
- depth behavior;
- lighting response.

If all layers share the same timing and velocity, the result reads as one synthetic emitter.

## Hierarchy

Use this priority:

1. hero causal effect;
2. secondary physical reaction;
3. atmospheric support;
4. optical accent;
5. residue.

Never let optical accents overpower the causal event unless the story intentionally calls for stylization.

## Scale coherence

Large-scale effects typically exhibit slower apparent turbulence, larger structural wavelengths, heavier debris, longer persistence, and deeper occlusion. Small-scale effects can change direction and dissipate more quickly.

Do not communicate scale by particle count alone.
