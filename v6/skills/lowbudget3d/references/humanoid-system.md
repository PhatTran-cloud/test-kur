# Humanoid system

## Representation choice

Realistic or recognizable humans should normally be loaded as coherent skinned geometry, not assembled from unrelated primitives.

Useful capabilities include:

- separate adult/youth and body-shape bases when available;
- morph targets for body variation;
- standard humanoid skeleton with fingers when hand fidelity matters;
- facial morphs/expressions for close views;
- consistent meter scale;
- clothing and accessories driven by the same body/skeleton.

## Anatomy audit

Inspect at least:

- overall head-to-body relationship;
- shoulder width and clavicle slope;
- upper-arm/forearm relationship;
- elbow and wrist placement;
- ribcage/waist/pelvis transition;
- hip width and femur origin;
- knee height and direction;
- shin/ankle/foot relationship;
- hand size, palm/finger readability;
- neck/head attachment and facial placement;
- left/right symmetry only where the pose calls for it.

Do not reduce anatomy QA to a fixed ratio table; target age, sex presentation, style and body type change proportions.

## Pose audit

- joints remain within plausible ranges unless intentional stylization is documented;
- weight-bearing foot/hand contacts visibly meet the support surface;
- center of mass and support make visual sense;
- no knee/elbow bending through impossible directions;
- shoulders and scapular region react to arm elevation;
- hips and torso counterbalance large limb actions;
- no obvious self-intersection.

## Astronaut construction

Use this layer order:

`humanoid -> underlayer -> suit volume -> joints/bellows -> gloves/boots -> helmet -> backpack/life-support -> hoses/cables -> tools -> decals/material detail`

The suit adds volume; it does not erase the body's joint locations. Helmet scale must fit a plausible head plus padding. Gloves and boots must still align with wrist/ankle articulation.
