# Preservation and ownership

## Base invariants

`3dviz-pro-max` owns its complete existing workflow and must remain available as its full canonical folder. `lowbudget3d` is not a fork.

Do not:

- replace its catalog with a smaller catalog;
- reimplement its kits when the existing kit is appropriate;
- remove evidence/capture steps;
- override scene/camera/lighting ownership merely because a specialist can also create those objects;
- silently change construction route, units, state model, or viewer contract;
- claim base features are preserved when the base skill is unavailable.

## Single-owner rule

Every global concern has one owner:

| Concern | Owner |
|---|---|
| creative 3D workflow | 3dviz-pro-max |
| final Three.js renderer | 3dviz-pro-max project runtime |
| scene root | 3dviz-pro-max project runtime |
| camera direction | 3dviz-pro-max unless user explicitly changes it |
| lighting/composition | 3dviz-pro-max |
| humanoid morphology | lowbudget3d humanoid specialist |
| animal morphology | lowbudget3d animal specialist |
| worn/held/mounted attachment semantics | lowbudget3d attachment specialist |
| optional GPU implementation | lowbudget3d GPU specialist, under core ownership |
| final PASS definition | lowbudget3d anti-fake-pass gate, because it is deliberately stricter |

A specialist returns components into the core scene. It does not create a parallel app.
