# GPU routing

GPU specialization is an optimization path, not the default architecture.

## Activate when

- particle count or per-particle state is large;
- CPU simulation is a measured bottleneck;
- many agents require parallel updates;
- procedural material logic is better expressed in node/shader form;
- deformation or image-space effects dominate cost;
- target runtime supports the selected path.

## Do not activate when

- the scene is already comfortably within budget;
- the bottleneck is draw calls caused by poor asset structure;
- the real problem is bad geometry, anatomy, composition or lighting;
- migrating the renderer would risk breaking a stable base scene.

## Contract

GPU code must remain subordinate to the existing scene owner and update contract. No specialist creates a second renderer or animation loop.
