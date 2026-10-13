# Asset strategy

## Choose representation by fidelity need

Use direct procedural Three.js geometry when shape grammar is simple, editable and visually appropriate.

Use authored GLTF/GLB/VRM when fidelity depends on:

- organic topology;
- skinning;
- face/hands;
- species morphology;
- clothing fit;
- complex equipment;
- sculpted or baked surface detail.

## Asset intake checklist

Before accepting an asset:

- license/provenance is known for the project;
- unit scale and orientation are normalized;
- pivot/root is useful;
- skeleton is coherent if skinned;
- morph target names and ranges are understood;
- materials/textures load in target runtime;
- triangle/draw-call/texture cost fits the intended role;
- animations do not introduce root-motion surprises;
- close-up visual inspection matches the brief.

An imported asset is not automatically higher quality than procedural geometry. It must pass the same visual gates.
