# Asset Credits and Model Scope

- Earth day map: NASA Blue Marble. Source: https://eoimages.gsfc.nasa.gov/images/imagerecords/57000/57730/land_ocean_ice_2048.jpg . Modern geography is used for modern Earth shots.
- Moon, Earth clouds and night map: Solar System Scope / INOVE, https://www.solarsystemscope.com/textures/ . CC BY 4.0, https://creativecommons.org/licenses/by/4.0/ . Textures are wrapped on spherical meshes and lit with the authored key. Attribution is also present on the final video frame.
- Retrieved 2026-10-10. Frozen texture files: `animation-studio/public/stardust-to-human/textures/`.
- Original background music is generated locally by `prepare.py`. All SFX are disabled by the user's latest request, including heartbeat and explosions. The export contains VO and BGM only.
- Adult body, targets, default skeleton and symmetric skin weights: MakeHuman Community, https://github.com/makehumancommunity/makehuman . Bundled graphical assets are CC0: https://github.com/makehumancommunity/makehuman/blob/master/LICENSE.md . License is frozen beside the GLB. The modern actor now uses UV-mapped young Asian male skin and fitted male_casualsuit06 clothing with its authored diffuse/normal maps, from https://static.makehumancommunity.org/assets/assetpacks/makehuman_system_assets.html (CC0). The anatomy is an authored base mesh; it is not a photoreal scan.
- Opening room and environment lighting: Lebombo HDRI by Greg Zaal, Poly Haven, https://polyhaven.com/a/lebombo . CC0, https://polyhaven.com/license . Frozen local 2K HDR image. This is a photographed interior panorama, not modeled room geometry.
- Current opening revision: a procedural contemporary street with an overhead camera rising from 18 to 32 m, 18 skinned pedestrians, authored MakeHuman casual clothing and shoes01 footwear (CC0). Architecture is planned by floor and facade bay, then compiled by material slot. Crowd motion uses frame-derived joint rotations; it is an illustrative walk cycle, not motion capture. Lebombo is used for reflected lighting in the street, not as its background.

## 3D Direction

Applied `3dviz-pro-max` to the existing Remotion / Three.js renderer. Retrieved and adapted `knowledge.style-cinematic` and `recipe.moon-phase-observer`: shared world-space sunlight direction, foreground/focal/background separation, a dark lunar hemisphere, atmospheric limb, differential dust rotation and contact-to-debris motion. Blender is not installed; actual ANGLE rendered frames are the validation evidence.

These scenes are cinematic illustrations, not impact, accretion, climate or orbital simulations. Surface noise represents ancient geology without claiming specific ancient continents. The Moon's modern map identifies the object, not its newborn geology. Distances, relative sizes and event timing are compressed for legibility. The translated narration preserves the supplied script's claims; applying the skill does not certify every numerical claim in that script.

Pangea is an illustrative procedural connected continental mass with a coastal embayment and material relief, not a paleogeographic data reconstruction. The asteroid now starts in the distant background and approaches the surface over its own shot duration; flash and ejecta begin at the next spoken impact anchor. No sound accompanies impacts in the current version.

Supernova uses a bounded 64-step raymarch: a compact luminous core, an expanding irregular shell, clump fields, turbulent filament emission and declining core luminosity. Color is an authored cinematic interpretation; no SVG ellipses or radial stroke particles represent the explosion.

## Natural Scene Revision

Flat environmental SVG shots were replaced by custom deterministic Three.js scenes. Creature skins use shared elliptical curve lofts with connected articulated limbs. Tree geometry follows branch levels and paired leaf placement; ferns follow rooted fronds. Materials use original procedural grain maps. Water normals and displacement share two analytic waves. Microbe membranes use rim transmission and internal RNA-like curves, with authored division. These are stylized reconstructions, not photoreal assets or cellular simulations.

Volcano geometry and lava placement share one CPU height function (radial profile, excavated crater, erosion ridges and surface bands). Lava ribbons follow the same surface with a small deliberate offset. Ash uses a bounded 40-step raymarch with height-dependent widening, wind displacement, detail erosion and transmittance. This is an authored eruption illustration, not a fluid solver or a specific ancient volcano reconstruction.

Reference passages used for silhouette/behavior: AMNH T. rex stalking stance and extended tail (https://www.amnh.org/exhibitions/permanent/saurischian-dinosaurs/tyrannosaurus-rex), NHM small two-finger forelimbs (https://www.nhm.ac.uk/discover/how-did-tyrannosaurus-use-its-arms.html), USGS cone/crater/lava formation (https://pubs.usgs.gov/gip/volc/types.html), USGS volcanic eruption types (https://pubs.usgs.gov/gip/volc/eruptions.html). No external footage was downloaded or used.

Chapter 3 separates small incoming meteorites, the named Theia body, the contact flash, orbiting ejecta, coalescence and the final Moon. Trails attach to individual incoming stones; impacts terminate on the planetary surface. Debris converges to a cluster before the Moon appears.

The giant-impact representation is grounded in NASA's Moon formation overview: https://science.nasa.gov/moon/formation/ . The scripted exact speed and 100-year formation interval are not established by that overview.

Calendar revision: the same NASA Earth day map and CC0 MakeHuman UV-textured head/shoulder mesh are reused as small 3D specimens. The human bust is sectioned from the mesh rather than made from primitive head/body shapes. Cells, theropod and irregular asteroid are procedural illustrations. Dates use one explicitly stated 4.54-billion-year / 365-day scale with December expanded. Sources and calculated dates are in calendar-direction.md and calendar-revision/report.json. The spoken calendar passage was corrected alongside the visual dates.
