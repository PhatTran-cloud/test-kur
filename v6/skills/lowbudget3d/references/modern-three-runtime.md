# Modern Three.js runtime

Use the installed Three.js version as truth. Verify APIs rather than relying on stale snippets.

## Runtime rules

- one renderer owner;
- one scene root;
- one camera authority at a time;
- one frame/update loop owner;
- asset subsystems expose `update(dt)` rather than starting their own loop;
- GLTF/GLB is preferred for complex authored assets;
- SkinnedMesh/skeleton/morph targets are first-class for characters;
- use instancing for large repeated rigid geometry where appropriate;
- keep simulation state separate from render interpolation;
- dispose geometry/material/texture resources when replacing them;
- report runtime console errors explicitly;
- preserve color-management/tone-mapping decisions already established by the base project unless there is a measured reason to change them.

## Verification

Check actual runtime state: loaded assets, scene graph, camera, frame updates, console, material compatibility, animation playback and resource failures.

Runtime verification proves implementation health, not artistic correctness.
